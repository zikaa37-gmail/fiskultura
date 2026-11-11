<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\DebateController;
use App\Http\Controllers\Controller;
use App\Models\Debate;
use App\Models\DebateModeratorLog;
use App\Models\User;
use App\Services\Assignments;
use App\Services\Notifications\DebatePromoter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminDebateController extends Controller
{
    public function list(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(Debate::STATUSES)],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $debates = Debate::with(['moderator', 'creator'])
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn (Builder $query, string $term) => $query->where('title', 'like', "%{$term}%"))
            ->orderByRaw('case when status = ? then 0 when status = ? then 1 else 2 end', [Debate::PROPOSED, Debate::OPEN])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $debates->map(fn (Debate $debate) => $this->present($debate))->values(),
            'proposed' => Debate::where('status', Debate::PROPOSED)->count(),
        ]);
    }

    public function store(Request $request, Assignments $assignments)
    {
        $data = $this->validated($request);
        $user = $request->user();

        $chosen = $this->moderatorFor($request, $data);
        $moderator = $chosen ?? ($user->hasRole(User::EDITOR) ? $user->id : $assignments->moderator()?->id);
        $debate = Debate::create([
            'slug' => Debate::uniqueSlug($data['title']),
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => Debate::OPEN,
            'moderator_id' => $moderator,
            'created_by' => $user->id,
        ]);
        if ($moderator) {
            $reason = $chosen ? DebateModeratorLog::MANUAL : ($moderator === $user->id ? DebateModeratorLog::CREATOR : DebateModeratorLog::AUTO);
            $assignments->logModerator($debate, null, $reason === DebateModeratorLog::AUTO ? null : $user, $reason);
        }

        return response()->json($this->present($debate->load(['moderator', 'creator'])), 201);
    }

    public function update(Request $request, Debate $debate, Assignments $assignments)
    {
        $data = $this->validated($request, partial: true);
        $previous = $debate->moderator_id;
        $reason = null;

        $debate->fill(array_intersect_key($data, array_flip(['title', 'description', 'status'])));
        if (isset($data['status'])) {
            $debate->closed_at = $data['status'] === Debate::CLOSED ? ($debate->closed_at ?? now()) : null;
            if ($data['status'] === Debate::OPEN && ! $debate->moderator_id) {
                $debate->moderator_id = $assignments->moderator()?->id;
                $reason = DebateModeratorLog::AUTO;
            }
        }
        if (array_key_exists('moderator_id', $data)) {
            $debate->moderator_id = $this->moderatorFor($request, $data);
            $reason = DebateModeratorLog::MANUAL;
        }
        $debate->save();
        if ($reason && $debate->moderator_id !== $previous) {
            $assignments->logModerator($debate, $previous, $reason === DebateModeratorLog::MANUAL ? $request->user() : null, $reason);
        }

        return response()->json($this->present($debate->fresh(['moderator', 'creator'])));
    }

    public function promotion(Debate $debate)
    {
        return response()->json([
            'recipients' => DebatePromoter::recipients()->count(),
            'last' => $debate->promotions()->latest('id')->first()?->present(),
            'hourly_limit' => (int) config('notifications.hourly_limit'),
        ]);
    }

    public function promote(Request $request, Debate $debate)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'min:20', 'max:1500'],
        ], [
            'message.min' => 'Poruka treba da ima bar jednu rečenicu (20 znakova).',
        ]);
        if ($debate->status !== Debate::OPEN) {
            abort(422, 'Poziv može da se pošalje samo za otvorenu temu.');
        }
        if ($debate->promotions()->whereNull('finished_at')->exists()) {
            abort(422, 'Prethodni poziv za ovu temu se još šalje.');
        }

        $promotion = $debate->promotions()->create([
            'message' => $data['message'],
            'sent_by' => $request->user()->id,
            'recipients' => DebatePromoter::recipients()->count(),
        ]);

        return response()->json([
            ...$promotion->present(),
            'message_text' => "Poziv kreće ka {$promotion->recipients} primalaca. Šalje se postepeno, najviše ".config('notifications.hourly_limit').' mejlova na sat.',
        ], 201);
    }

    public function destroy(Debate $debate)
    {
        $debate->delete();

        return response()->json(['message' => 'Tema je obrisana sa svim prilozima.']);
    }

    private function moderatorFor(Request $request, array $data): ?int
    {
        if (! array_key_exists('moderator_id', $data)) {
            return null;
        }
        if (! $request->user()->isAdmin()) {
            abort(403, 'Samo administrator ručno bira moderatora.');
        }

        return $data['moderator_id'];
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'title' => [$required, 'string', 'min:5', 'max:200'],
            'description' => ['sometimes', 'nullable', 'string', 'max:3000'],
            'status' => ['sometimes', Rule::in(Debate::STATUSES)],
            'moderator_id' => ['sometimes', 'nullable', 'integer', Rule::exists(User::class, 'id')->whereNull('blocked_at')],
        ]);
    }

    private function present(Debate $debate): array
    {
        return [
            ...DebateController::present($debate),
            'creator' => $debate->creator ? ['id' => $debate->creator->id, 'name' => $debate->creator->name] : null,
            'summary_pending' => $debate->summary_draft !== null,
            'last_promotion' => $debate->promotions()->latest('id')->first()?->present(),
        ];
    }
}

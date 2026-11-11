<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Controller;
use App\Mail\QuestionAnsweredMail;
use App\Models\Question;
use App\Models\Regulation;
use App\Models\User;
use App\Services\Ai\AnswerDrafter;
use App\Services\Inbox;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Throwable;

class AdminQuestionController extends Controller
{
    public function list(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(Question::STATUSES)],
            'search' => ['nullable', 'string', 'max:100'],
            'mine' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $onlyAssigned = $user->hasRole(User::AUTHOR) || ($filters['mine'] ?? false);

        $questions = Question::with(['asker', 'answerer', 'assignee'])
            ->when($onlyAssigned, fn (Builder $query) => $query->where('assigned_to', $user->id))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn (Builder $query, string $term) => $query->where(fn (Builder $inner) => $inner
                ->where('title', 'like', "%{$term}%")
                ->orWhere('original', 'like', "%{$term}%")
                ->orWhere('answer', 'like', "%{$term}%")))
            ->orderByRaw('case when status = ? then 0 else 1 end', [Question::PENDING])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $questions->map(fn (Question $question) => $this->present($question))->values(),
            'pending' => Question::where('status', Question::PENDING)
                ->when($onlyAssigned, fn (Builder $query) => $query->where('assigned_to', $user->id))
                ->count(),
        ]);
    }

    public function show(Request $request, Question $question)
    {
        $this->authorizeAssigned($request, $question);

        return response()->json($this->present($question->load(['asker', 'answerer', 'assignee'])));
    }

    public function assign(Request $request, Question $question)
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'integer', Rule::exists(User::class, 'id')->whereIn('role', [User::AUTHOR, User::EDITOR, User::ADMIN])->whereNull('blocked_at')],
        ], [
            'user_id.exists' => 'Pitanje može da se dodeli samo autoru, uredniku ili administratoru.',
        ]);

        $question->forceFill(['assigned_to' => $data['user_id'] ?? null])->save();

        return response()->json($this->present($question->fresh(['asker', 'answerer', 'assignee'])));
    }

    public function draft(Request $request, Question $question, AnswerDrafter $drafter)
    {
        $this->authorizeAssigned($request, $question);

        return response()->json($drafter->draft($question));
    }

    public function staff()
    {
        return response()->json(User::whereIn('role', [User::AUTHOR, User::EDITOR, User::ADMIN])
            ->whereNull('blocked_at')
            ->orderBy('name')
            ->get(['id', 'name', 'role']));
    }

    private function authorizeAssigned(Request $request, Question $question): void
    {
        $user = $request->user();
        if ($user->hasRole(User::AUTHOR) && $question->assigned_to !== $user->id) {
            abort(403, 'Ovo pitanje nije dodeljeno vama.');
        }
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $question = Question::create([
            ...$data,
            'slug' => Question::uniqueSlug($data['slug'] ?? $data['title']),
            'answered_by' => $request->user()->id,
            'published_at' => $data['status'] === Question::PUBLISHED ? now() : null,
        ]);

        return response()->json($this->present($question->load(['asker', 'answerer'])), 201);
    }

    public function update(Request $request, Question $question)
    {
        $this->authorizeAssigned($request, $question);
        $data = $this->validated($request, $question);

        $question->fill([
            ...$data,
            'slug' => isset($data['slug']) && $data['slug'] !== $question->slug ? Question::uniqueSlug($data['slug'], $question->id) : $question->slug,
            'answered_by' => $request->user()->id,
        ]);
        if ($question->status === Question::PUBLISHED && ! $question->published_at) {
            $question->published_at = now();
        }
        $question->save();

        $this->notifyAsker($question);

        return response()->json($this->present($question->fresh(['asker', 'answerer', 'assignee'])));
    }

    public function destroy(Question $question)
    {
        $question->delete();

        return response()->json(['message' => 'Pitanje je obrisano.']);
    }

    private function notifyAsker(Question $question): void
    {
        if ($question->status !== Question::PUBLISHED || $question->asker_notified_at || ! $question->asker) {
            return;
        }

        try {
            Mail::to($question->asker->email)->send(new QuestionAnsweredMail($question));
            $question->forceFill(['asker_notified_at' => now()])->save();
        } catch (Throwable $error) {
            report($error);
        }
        app(Inbox::class)->record($question->asker, 'question_answered', 'Objavljen je odgovor na vaše pitanje', "„{$question->title}“", "/pitanja/{$question->slug}");
    }

    private function validated(Request $request, ?Question $question = null): array
    {
        $publishing = $request->input('status') === Question::PUBLISHED;

        return $request->validate([
            'category' => ['required', Rule::in(Question::CATEGORIES)],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:140', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/'],
            'body' => ['nullable', 'string', 'max:5000'],
            'answer' => [$publishing ? 'required' : 'nullable', 'string', 'max:50000'],
            'regulation_keys' => ['present', 'array'],
            'regulation_keys.*' => ['string', 'distinct', Rule::exists(Regulation::class, 'key')],
            'valid_on' => [$publishing ? 'required' : 'nullable', 'date'],
            'status' => ['required', Rule::in(Question::STATUSES)],
            'editor_note' => ['nullable', 'string', 'max:2000'],
        ], [
            'answer.required' => 'Za objavu je potreban odgovor.',
            'valid_on.required' => 'Za objavu je potreban datum „važi na dan“.',
            'slug.regex' => 'Adresa sme da sadrži samo mala slova bez kvačica, brojeve i crtice.',
        ]);
    }

    private function present(Question $question): array
    {
        return [
            ...QuestionController::present($question),
            'status' => $question->status,
            'regulation_keys' => $question->regulation_keys ?? [],
            'original' => $question->original,
            'editor_note' => $question->editor_note,
            'asker' => $question->asker ? ['name' => $question->asker->name, 'email' => $question->asker->email] : null,
            'answerer' => $question->answerer?->name,
            'assignee' => $question->assignee ? ['id' => $question->assignee->id, 'name' => $question->assignee->name] : null,
            'asker_notified_at' => $question->asker_notified_at?->toIso8601String(),
            'created_at' => $question->created_at?->toIso8601String(),
        ];
    }
}

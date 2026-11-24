<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Debate;
use App\Models\DebateModeratorLog;
use App\Models\DebateReopenRequest;
use App\Models\User;
use App\Services\Assignments;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminModeratorController extends Controller
{
    public function index(Assignments $assignments)
    {
        $moderating = Debate::whereNotNull('moderator_id')->distinct()->pluck('moderator_id');
        $users = User::where('moderator_pool', true)
            ->orWhereIn('id', $moderating)
            ->orWhere('role', User::EDITOR)
            ->orderBy('name')
            ->get();

        $debates = Debate::whereIn('moderator_id', $users->pluck('id'))->get(['id', 'moderator_id', 'status', 'posts_count', 'summary_draft']);
        $requests = DebateReopenRequest::where('status', DebateReopenRequest::PENDING)->with('debate:id,moderator_id')->get();
        $lastAssigned = DebateModeratorLog::whereIn('moderator_id', $users->pluck('id'))
            ->selectRaw('moderator_id, max(created_at) as last_at')
            ->groupBy('moderator_id')
            ->pluck('last_at', 'moderator_id');

        $rows = $users->map(function (User $user) use ($debates, $requests, $lastAssigned) {
            $own = $debates->where('moderator_id', $user->id);

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'in_pool' => (bool) $user->moderator_pool,
                'blocked' => $user->isBlocked(),
                'open' => $own->where('status', Debate::OPEN)->count(),
                'proposed' => $own->where('status', Debate::PROPOSED)->count(),
                'closed' => $own->where('status', Debate::CLOSED)->count(),
                'posts_open' => (int) $own->where('status', Debate::OPEN)->sum('posts_count'),
                'pending_summaries' => $own->filter(fn (Debate $debate) => $debate->summary_draft !== null)->count(),
                'pending_requests' => $requests->filter(fn (DebateReopenRequest $request) => $request->debate?->moderator_id === $user->id)->count(),
                'last_assigned_at' => $lastAssigned->get($user->id) ? Carbon::parse($lastAssigned->get($user->id))->toIso8601String() : null,
            ];
        })->values();

        $next = $assignments->moderator();

        return response()->json([
            'data' => $rows,
            'next' => $next ? ['id' => $next->id, 'name' => $next->name] : null,
            'pool_size' => $users->where('moderator_pool', true)->count(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate(['in_pool' => ['required', 'boolean']]);
        if ($data['in_pool'] && $user->isBlocked()) {
            abort(422, 'Blokiran korisnik ne može da bude moderator.');
        }

        $user->forceFill(['moderator_pool' => $data['in_pool']])->save();

        return response()->json([
            'id' => $user->id,
            'in_pool' => $user->moderator_pool,
            'message' => $data['in_pool'] ? "{$user->name} je u rotaciji moderatora." : "{$user->name} više nije u rotaciji (postojeće teme zadržava).",
        ]);
    }

    public function log()
    {
        $entries = DebateModeratorLog::with(['debate:id,slug,title', 'moderator:id,name', 'previous:id,name', 'assigner:id,name'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        return response()->json($entries->map(fn (DebateModeratorLog $entry) => [
            'id' => $entry->id,
            'debate' => $entry->debate ? ['slug' => $entry->debate->slug, 'title' => $entry->debate->title] : null,
            'moderator' => $entry->moderator?->name,
            'previous' => $entry->previous?->name,
            'assigned_by' => $entry->assigner?->name,
            'reason' => $entry->reason,
            'created_at' => $entry->created_at?->toIso8601String(),
        ])->values());
    }
}

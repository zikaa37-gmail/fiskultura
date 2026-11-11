<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\DebatePostMail;
use App\Mail\DebateReopenDecisionMail;
use App\Mail\DebateReopenRequestMail;
use App\Models\Debate;
use App\Models\DebateModeratorLog;
use App\Models\DebatePost;
use App\Models\DebateReopenRequest;
use App\Models\User;
use App\Services\Ai\DebateAnalyst;
use App\Services\Ai\DebateIntroWriter;
use App\Services\Assignments;
use App\Services\Inbox;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class DebateController extends Controller
{
    private const MAX_PROPOSALS = 3;

    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(Debate::PUBLIC_STATUSES)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $debates = Debate::public()
            ->with('moderator')
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['q'] ?? null, fn (Builder $query, string $term) => $query->where(fn (Builder $inner) => $inner
                ->where('title', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")))
            ->orderByRaw('case when status = ? then 0 else 1 end', [Debate::OPEN])
            ->orderByRaw('coalesce(last_post_at, created_at) desc')
            ->get();

        $proposals = Debate::where('created_by', $request->user()->id)
            ->whereIn('status', [Debate::PROPOSED, Debate::REJECTED])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $debates->map(fn (Debate $debate) => self::present($debate))->values(),
            'proposals' => $proposals->map(fn (Debate $debate) => self::present($debate))->values(),
        ]);
    }

    public function show(Request $request, string $slug)
    {
        $debate = $this->visible($request, $slug);
        $user = $request->user();
        $moderating = $debate->canModerate($user);

        return response()->json([
            ...self::present($debate->load('moderator')),
            'can_moderate' => $moderating,
            'summary' => self::presentSummary($debate->summary, $debate->summary_approved_at, $debate->summary_posts),
            'intro' => self::presentIntro($debate->intro, $debate->intro_approved_at),
            'my_reopen_request' => $debate->reopenRequests()->where('user_id', $user->id)->latest('id')->first()?->present(),
            ...($moderating ? [
                'summary_draft' => self::presentSummary($debate->summary_draft, $debate->summary_draft_at, $debate->summary_draft_posts),
                'summary_guidance' => $debate->summary_guidance,
                'intro_status' => $debate->intro_status,
                'intro_guidance' => $debate->intro_guidance,
                'intro_error' => $debate->intro_error,
                'intro_draft' => self::presentIntro($debate->intro_draft, $debate->intro_generated_at),
                'reopen_requests' => $debate->reopenRequests()->with('user')->where('status', DebateReopenRequest::PENDING)->orderBy('id')->get()
                    ->map(fn (DebateReopenRequest $item) => $item->present())->values(),
            ] : []),
        ]);
    }

    public function posts(Request $request, string $slug)
    {
        $debate = $this->visible($request, $slug);
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'kind' => ['nullable', Rule::in(DebatePost::KINDS)],
            'sort' => ['nullable', Rule::in(['new', 'old', 'top'])],
            'highlighted' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
        $user = $request->user();
        $moderating = $debate->canModerate($user);

        $posts = $debate->posts()
            ->with('author')
            ->withExists(['likers as liked' => fn (Builder $query) => $query->where('users.id', $user->id)])
            ->when(! $moderating, fn (Builder $query) => $query->whereNull('hidden_at'))
            ->when($filters['kind'] ?? null, fn (Builder $query, string $kind) => $query->where('kind', $kind))
            ->when($filters['highlighted'] ?? false, fn (Builder $query) => $query->whereNotNull('highlighted_at'))
            ->when($filters['q'] ?? null, fn (Builder $query, string $term) => $query->where('body', 'like', "%{$term}%"))
            ->when(($filters['sort'] ?? 'new') === 'top', fn (Builder $query) => $query->orderByDesc('likes_count')->orderByDesc('created_at'))
            ->when(($filters['sort'] ?? 'new') === 'old', fn (Builder $query) => $query->orderBy('created_at'))
            ->when(($filters['sort'] ?? 'new') === 'new', fn (Builder $query) => $query->orderByDesc('created_at'))
            ->orderByDesc('id')
            ->paginate(30, page: $filters['page'] ?? 1);

        return response()->json([
            'data' => collect($posts->items())->map(fn (DebatePost $post) => self::presentPost($post, $user, $moderating))->values(),
            'meta' => ['current_page' => $posts->currentPage(), 'last_page' => $posts->lastPage(), 'total' => $posts->total()],
        ]);
    }

    public function propose(Request $request, Assignments $assignments, DebateIntroWriter $intro)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'min:10', 'max:200'],
            'description' => ['required', 'string', 'min:20', 'max:3000'],
        ], [
            'title.min' => 'Naziv teme treba da ima bar 10 znakova.',
            'description.min' => 'Opišite temu u bar jednoj rečenici (20 znakova).',
        ]);
        $user = $request->user();
        $staff = $user->hasRole(User::EDITOR, User::ADMIN);

        if (! $staff && Debate::where('created_by', $user->id)->where('status', Debate::PROPOSED)->count() >= self::MAX_PROPOSALS) {
            throw ValidationException::withMessages(['title' => ['Već imate '.self::MAX_PROPOSALS.' predloga koja čekaju odobrenje.']]);
        }

        $debate = Debate::create([
            'slug' => Debate::uniqueSlug($data['title']),
            'title' => $data['title'],
            'description' => $data['description'],
            'status' => $staff ? Debate::OPEN : Debate::PROPOSED,
            'moderator_id' => $user->hasRole(User::EDITOR) ? $user->id : $assignments->moderator()?->id,
            'created_by' => $user->id,
        ]);
        if ($debate->status === Debate::OPEN) {
            $intro->queue($debate);
        }
        if ($debate->moderator_id) {
            $self = $debate->moderator_id === $user->id;
            $assignments->logModerator($debate, null, $self ? $user : null, $self ? DebateModeratorLog::CREATOR : DebateModeratorLog::AUTO);
        }

        return response()->json([
            ...self::present($debate->load('moderator')),
            'message' => $staff ? 'Tema je otvorena.' : 'Predlog je poslat. Kad ga urednik odobri, tema će se pojaviti u listi.',
        ], 201);
    }

    public function storePost(Request $request, string $slug)
    {
        $debate = $this->visible($request, $slug);
        if ($debate->status !== Debate::OPEN) {
            abort(422, 'Tema je zatvorena za nove priloge.');
        }

        $data = $request->validate([
            'kind' => ['required', Rule::in(DebatePost::KINDS)],
            'body' => ['required', 'string', 'min:3', 'max:5000'],
        ], [
            'body.required' => 'Napišite šta želite da kažete.',
        ]);

        $post = $debate->posts()->create([...$data, 'user_id' => $request->user()->id]);
        $debate->refreshCounters();
        $this->notifyModerator($post->setRelation('debate', $debate->load('moderator')));

        return response()->json(self::presentPost($post->load('author'), $request->user(), $debate->canModerate($request->user())), 201);
    }

    public function like(Request $request, DebatePost $post)
    {
        $debate = $post->debate;
        if (! in_array($debate->status, Debate::PUBLIC_STATUSES, true) || $post->hidden_at) {
            abort(404);
        }
        $this->ensureOpen($debate);
        $userId = $request->user()->id;

        $liked = DB::transaction(function () use ($post, $userId) {
            $removed = $post->likers()->detach($userId);
            if (! $removed) {
                $post->likers()->attach($userId, ['created_at' => now()]);
            }
            $post->forceFill(['likes_count' => $post->likers()->count()])->save();

            return ! $removed;
        });

        return response()->json(['liked' => $liked, 'likes_count' => $post->likes_count]);
    }

    public function moderatePost(Request $request, DebatePost $post)
    {
        $debate = $post->debate;
        if (! $debate->canModerate($request->user())) {
            abort(403, 'Samo moderator teme može da ističe i skriva priloge.');
        }
        $this->ensureOpen($debate);

        $data = $request->validate([
            'highlighted' => ['sometimes', 'boolean'],
            'hidden' => ['sometimes', 'boolean'],
        ]);
        if (array_key_exists('highlighted', $data)) {
            $post->highlighted_at = $data['highlighted'] ? ($post->highlighted_at ?? now()) : null;
        }
        if (array_key_exists('hidden', $data)) {
            $post->hidden_at = $data['hidden'] ? ($post->hidden_at ?? now()) : null;
        }
        $post->save();
        $debate->refreshCounters();

        return response()->json(self::presentPost($post->load('author'), $request->user(), true));
    }

    public function update(Request $request, string $slug)
    {
        $debate = Debate::where('slug', $slug)->firstOrFail();
        if (! $debate->canModerate($request->user()) || ! in_array($debate->status, Debate::PUBLIC_STATUSES, true)) {
            abort(403, 'Samo moderator teme može da je menja.');
        }

        $data = $request->validate([
            'status' => ['sometimes', Rule::in(Debate::PUBLIC_STATUSES)],
            'description' => ['sometimes', 'nullable', 'string', 'max:3000'],
        ]);
        $debate->fill($data);
        if (isset($data['status'])) {
            $debate->closed_at = $data['status'] === Debate::CLOSED ? ($debate->closed_at ?? now()) : null;
        }
        $debate->save();

        return response()->json(self::present($debate->load('moderator')));
    }

    public function analyze(Request $request, string $slug, DebateAnalyst $analyst)
    {
        $debate = Debate::where('slug', $slug)->firstOrFail();
        if (! $debate->canModerate($request->user())) {
            abort(403, 'Samo moderator teme može da traži analizu.');
        }
        $this->ensureOpen($debate);

        $data = $request->validate(['guidance' => ['nullable', 'string', 'max:2000']]);
        $guidance = trim((string) ($data['guidance'] ?? '')) ?: null;

        $summary = $analyst->analyze($debate, $guidance);
        $debate->forceFill([
            'summary_draft' => $summary,
            'summary_draft_at' => now(),
            'summary_draft_posts' => $debate->posts()->whereNull('hidden_at')->count(),
            'summary_guidance' => $guidance,
        ])->save();

        return response()->json([
            'summary_draft' => self::presentSummary($debate->summary_draft, $debate->summary_draft_at, $debate->summary_draft_posts),
            'summary_guidance' => $debate->summary_guidance,
        ]);
    }

    public function approve(Request $request, string $slug)
    {
        $debate = Debate::where('slug', $slug)->firstOrFail();
        if (! $debate->canModerate($request->user())) {
            abort(403, 'Samo moderator teme može da odobri analizu.');
        }
        $this->ensureOpen($debate);
        if (! $debate->summary_draft) {
            abort(422, 'Nema nacrta analize za odobravanje.');
        }

        $debate->forceFill([
            'summary' => $debate->summary_draft,
            'summary_approved_at' => now(),
            'summary_posts' => $debate->summary_draft_posts,
            'summary_draft' => null,
            'summary_draft_at' => null,
            'summary_draft_posts' => null,
        ])->save();

        return response()->json([
            'summary' => self::presentSummary($debate->summary, $debate->summary_approved_at, $debate->summary_posts),
            'summary_draft' => null,
            'message' => 'Analiza je objavljena.',
        ]);
    }

    public function requestReopen(Request $request, string $slug, Inbox $inbox)
    {
        $debate = $this->visible($request, $slug);
        if ($debate->status !== Debate::CLOSED) {
            abort(422, 'Tema nije zatvorena.');
        }
        $user = $request->user();
        if ($debate->reopenRequests()->where('user_id', $user->id)->where('status', DebateReopenRequest::PENDING)->exists()) {
            abort(422, 'Vaš zahtev za ovu temu već čeka odgovor moderatora.');
        }

        $data = $request->validate([
            'kind' => ['required', Rule::in(DebatePost::KINDS)],
            'body' => ['required', 'string', 'min:10', 'max:5000'],
        ], [
            'body.min' => 'Napišite šta želite da kažete (bar 10 znakova).',
        ]);

        $reopen = $debate->reopenRequests()->create([...$data, 'user_id' => $user->id]);
        $reopen->setRelation('debate', $debate->load('moderator'))->setRelation('user', $user);

        $moderator = $debate->moderator;
        if ($moderator && ! $moderator->isBlocked()) {
            try {
                Mail::to($moderator->email)->send(new DebateReopenRequestMail($reopen));
            } catch (Throwable $error) {
                report($error);
            }
            $inbox->record($moderator, 'debate_reopen_request', "Zahtev da se ponovo otvori tema: {$debate->title}", "Zahtev od: {$user->name}. ".Str::limit($reopen->body, 300), "/debate/{$debate->slug}");
        }

        return response()->json([...$reopen->present(), 'message' => 'Zahtev je poslat moderatoru. Javićemo vam mejlom kad odluči.'], 201);
    }

    public function decideReopen(Request $request, DebateReopenRequest $reopen, Inbox $inbox)
    {
        $debate = $reopen->debate;
        if (! $debate->canModerate($request->user())) {
            abort(403, 'Samo moderator teme odlučuje o ponovnom otvaranju.');
        }
        if ($reopen->status !== DebateReopenRequest::PENDING) {
            abort(422, 'O ovom zahtevu je već odlučeno.');
        }

        $data = $request->validate([
            'approve' => ['required', 'boolean'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($reopen, $debate, $data, $request) {
            $reopen->forceFill([
                'status' => $data['approve'] ? DebateReopenRequest::APPROVED : DebateReopenRequest::REJECTED,
                'decided_by' => $request->user()->id,
                'decided_at' => now(),
                'decision_note' => trim((string) ($data['note'] ?? '')) ?: null,
            ])->save();

            if ($data['approve']) {
                $debate->forceFill(['status' => Debate::OPEN, 'closed_at' => null])->save();
                $debate->posts()->create(['user_id' => $reopen->user_id, 'kind' => $reopen->kind, 'body' => $reopen->body]);
                $debate->refreshCounters();
            }
        });

        $reopen->load('user', 'debate');
        if ($reopen->user && ! $reopen->user->isBlocked()) {
            try {
                Mail::to($reopen->user->email)->send(new DebateReopenDecisionMail($reopen));
            } catch (Throwable $error) {
                report($error);
            }
            $approved = $reopen->status === DebateReopenRequest::APPROVED;
            $inbox->record(
                $reopen->user,
                'debate_reopen_decision',
                $approved ? "Tema je ponovo otvorena: {$debate->title}" : "Tema „{$debate->title}“ ostaje zatvorena",
                $approved ? 'Moderator je odobrio vaš zahtev i vaš prilog je objavljen.' : ($reopen->decision_note ? "Poruka moderatora: {$reopen->decision_note}" : 'Moderator nije odobrio ponovno otvaranje.'),
                "/debate/{$debate->slug}",
            );
        }

        return response()->json([
            ...$reopen->present(),
            'message' => $data['approve'] ? 'Tema je ponovo otvorena i prilog je objavljen.' : 'Zahtev je odbijen. Član dobija mejl.',
        ]);
    }

    public function requestIntro(Request $request, string $slug, DebateIntroWriter $intro)
    {
        $debate = Debate::where('slug', $slug)->firstOrFail();
        if (! $debate->canModerate($request->user())) {
            abort(403, 'Samo moderator teme traži uvodni pregled.');
        }
        $this->ensureOpen($debate);
        if (in_array($debate->intro_status, [DebateIntroWriter::PENDING, DebateIntroWriter::GENERATING], true) && $debate->intro_requested_at?->gt(now()->subMinutes(15))) {
            abort(422, 'Uvodni pregled se već pravi. Javićemo kad bude spreman.');
        }

        $data = $request->validate(['guidance' => ['nullable', 'string', 'max:2000']]);
        $intro->queue($debate, trim((string) ($data['guidance'] ?? '')) ?: null);

        return response()->json(['intro_status' => DebateIntroWriter::PENDING, 'message' => 'AI pretražuje internet i piše pregled. To traje minut-dva; dobićete notifikaciju kad bude spreman.'], 202);
    }

    public function approveIntro(Request $request, string $slug)
    {
        $debate = Debate::where('slug', $slug)->firstOrFail();
        if (! $debate->canModerate($request->user())) {
            abort(403, 'Samo moderator teme odobrava uvodni pregled.');
        }
        $this->ensureOpen($debate);
        if (! $debate->intro_draft) {
            abort(422, 'Nema nacrta uvodnog pregleda.');
        }

        $debate->forceFill([
            'intro' => $debate->intro_draft,
            'intro_approved_at' => now(),
            'intro_draft' => null,
            'intro_status' => DebateIntroWriter::APPROVED,
        ])->save();

        return response()->json(['intro' => self::presentIntro($debate->intro, $debate->intro_approved_at), 'message' => 'Uvodni pregled je objavljen.']);
    }

    public static function presentIntro(?array $intro, $at): ?array
    {
        return $intro ? [...$intro, 'at' => $at?->toIso8601String()] : null;
    }

    private function ensureOpen(Debate $debate): void
    {
        if ($debate->status === Debate::CLOSED) {
            abort(422, 'Tema je zatvorena i zamrznuta: prilozi, lajkovi i sažetak ostaju kakvi jesu.');
        }
    }

    private function notifyModerator(DebatePost $post): void
    {
        $moderator = $post->debate->moderator;
        if (! $moderator || $moderator->id === $post->user_id || $moderator->isBlocked()) {
            return;
        }

        try {
            Mail::to($moderator->email)->send(new DebatePostMail($post->load('author')));
        } catch (Throwable $error) {
            report($error);
        }
        app(Inbox::class)->record($moderator, 'debate_post', "Novi prilog u debati: {$post->debate->title}", ($post->author?->name ?? 'Član').': '.Str::limit($post->body, 300), "/debate/{$post->debate->slug}");
    }

    private function visible(Request $request, string $slug): Debate
    {
        $debate = Debate::where('slug', $slug)->firstOrFail();
        $user = $request->user();
        $public = in_array($debate->status, Debate::PUBLIC_STATUSES, true);
        if (! $public && $debate->created_by !== $user->id && ! $debate->canModerate($user) && ! $user->hasRole(User::EDITOR, User::ADMIN)) {
            abort(404);
        }

        return $debate;
    }

    public static function present(Debate $debate): array
    {
        return [
            'id' => $debate->id,
            'slug' => $debate->slug,
            'title' => $debate->title,
            'description' => $debate->description,
            'status' => $debate->status,
            'moderator' => $debate->moderator ? ['id' => $debate->moderator->id, 'name' => $debate->moderator->name] : null,
            'posts_count' => $debate->posts_count,
            'last_post_at' => $debate->last_post_at?->toIso8601String(),
            'has_summary' => $debate->summary !== null,
            'created_at' => $debate->created_at?->toIso8601String(),
            'closed_at' => $debate->closed_at?->toIso8601String(),
        ];
    }

    public static function presentSummary(?array $summary, $at, ?int $posts): ?array
    {
        if (! $summary) {
            return null;
        }

        $quoted = DebatePost::with('author')
            ->whereIn('id', collect($summary['best_posts'] ?? [])->pluck('post_id'))
            ->get()
            ->keyBy('id');

        return [
            ...$summary,
            'best_posts' => collect($summary['best_posts'] ?? [])
                ->map(fn (array $item) => ($post = $quoted->get($item['post_id'])) && ! $post->hidden_at ? [
                    ...$item,
                    'kind' => $post->kind,
                    'excerpt' => Str::limit($post->body, 320),
                    'author' => $post->author?->name ?? 'Bivši član',
                    'likes_count' => $post->likes_count,
                ] : null)
                ->filter()
                ->values()
                ->all(),
            'generated_at' => $at?->toIso8601String(),
            'posts_analyzed' => $posts,
        ];
    }

    public static function presentPost(DebatePost $post, ?User $viewer, bool $moderating): array
    {
        return [
            'id' => $post->id,
            'kind' => $post->kind,
            'body' => $post->body,
            'likes_count' => $post->likes_count,
            'liked' => (bool) ($post->liked ?? false),
            'highlighted' => $post->highlighted_at !== null,
            'author' => $post->author?->name ?? 'Bivši član',
            'mine' => $viewer !== null && $post->user_id === $viewer->id,
            'created_at' => $post->created_at?->toIso8601String(),
            ...($moderating ? ['hidden' => $post->hidden_at !== null] : []),
        ];
    }
}

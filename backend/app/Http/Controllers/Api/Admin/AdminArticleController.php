<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Debate;
use App\Models\Topic;
use App\Models\User;
use App\Services\Inbox;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminArticleController extends Controller
{
    private const KIND_LABELS = [Article::COLUMN => 'Kolumna', Article::ARTICLE => 'Članak'];

    public function __construct(private readonly Inbox $inbox) {}

    public function options(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'topics' => Topic::orderBy('sort')->orderBy('name')->get()->map(fn (Topic $topic) => $topic->present())->values(),
            'debates' => Debate::whereIn('status', Debate::PUBLIC_STATUSES)->orderByDesc('created_at')->get(['id', 'title'])
                ->map(fn (Debate $debate) => ['id' => $debate->id, 'title' => $debate->title])->values(),
            'profile' => ['name' => $user->name, 'byline' => $user->byline, 'bio' => $user->bio],
        ]);
    }

    public function list(Request $request)
    {
        $user = $request->user();
        $filters = $request->validate([
            'status' => ['nullable', Rule::in([...Article::STATUSES, 'scheduled'])],
            'kind' => ['nullable', Rule::in(Article::KINDS)],
            'topic_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $scope = Article::query()->when(! $this->isEditor($user), fn (Builder $query) => $query->where('author_id', $user->id));

        $page = (clone $scope)
            ->with(['topic', 'author'])
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => match ($status) {
                'scheduled' => $query->where('status', Article::PUBLISHED)->where('published_at', '>', now()),
                Article::PUBLISHED => $query->visible(),
                default => $query->where('status', $status),
            })
            ->when($filters['kind'] ?? null, fn (Builder $query, string $kind) => $query->where('kind', $kind))
            ->when($filters['topic_id'] ?? null, fn (Builder $query, int $id) => $query->where('topic_id', $id))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $inner) => $inner
                ->where('title', 'like', "%{$search}%")
                ->orWhere('summary', 'like', "%{$search}%")))
            ->orderByRaw('case when status = ? then 0 when status = ? then 1 else 2 end', [Article::SUBMITTED, Article::RETURNED])
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 25, page: $filters['page'] ?? 1);

        return response()->json([
            'data' => $page->getCollection()->map(fn (Article $article) => $this->present($article, $user))->values(),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
            'submitted' => (clone $scope)->where('status', Article::SUBMITTED)->count(),
        ]);
    }

    public function show(Request $request, Article $article)
    {
        $this->authorizeView($request->user(), $article);

        return response()->json($this->present($article->load(['topic', 'author']), $request->user(), withBody: true));
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $this->validated($request, $user);

        $article = Article::create([
            ...$data,
            'slug' => Article::uniqueSlug($data['slug'] ?? $data['title']),
            'author_id' => $user->id,
            'status' => Article::DRAFT,
        ]);

        return response()->json($this->present($article->load(['topic', 'author']), $user, withBody: true), 201);
    }

    public function update(Request $request, Article $article)
    {
        $user = $request->user();
        abort_unless($article->isEditableBy($user), 403, 'Tekst je poslat uredniku i ne može da se menja dok ga ne pregleda.');
        $data = $this->validated($request, $user);

        $article->update([
            ...$data,
            'slug' => isset($data['slug']) && $data['slug'] !== $article->slug ? Article::uniqueSlug($data['slug'], $article->id) : $article->slug,
        ]);

        return response()->json($this->present($article->fresh(['topic', 'author']), $user, withBody: true));
    }

    public function submit(Request $request, Article $article)
    {
        $user = $request->user();
        abort_unless($article->author_id === $user->id && in_array($article->status, [Article::DRAFT, Article::RETURNED], true), 403, 'Tekst je već poslat ili objavljen.');
        if (blank($user->byline)) {
            throw ValidationException::withMessages(['byline' => 'Pre slanja upiši potpis: zvanje ili specijalnost i mesto. Tekst se objavljuje pod tvojim imenom.']);
        }

        $article->forceFill(['status' => Article::SUBMITTED, 'submitted_at' => now()])->save();

        $editors = User::whereIn('role', [User::EDITOR, User::ADMIN])->whereNull('blocked_at')->whereKeyNot($user->id)->get();
        $this->inbox->record($editors, 'article_submitted', "Tekst za pregled: {$article->title}", "{$user->name} · ".self::KIND_LABELS[$article->kind], "/admin/tekstovi/{$article->id}", ['site']);

        return response()->json($this->present($article->fresh(['topic', 'author']), $user, withBody: true));
    }

    public function publish(Request $request, Article $article)
    {
        $user = $request->user();
        $data = $request->validate(['published_at' => ['nullable', 'date']]);
        $wasVisible = $article->isVisible();

        $article->forceFill([
            'status' => Article::PUBLISHED,
            'published_at' => isset($data['published_at']) ? Carbon::parse($data['published_at']) : ($article->published_at ?? now()),
            'reviewed_by' => $user->id,
            'editor_note' => null,
        ])->save();

        if (! $wasVisible && $article->author_id !== $user->id) {
            $scheduled = $article->published_at->isFuture();
            $this->inbox->record(
                $article->author,
                'article_published',
                $scheduled ? "Tekst je odobren: {$article->title}" : "Tekst je objavljen: {$article->title}",
                $scheduled ? 'Objava je zakazana za '.$article->published_at->timezone(config('app.timezone'))->format('j. n. Y. \u H:i').'.' : null,
                $scheduled ? "/admin/tekstovi/{$article->id}" : "/tekstovi/{$article->slug}",
                ['site'],
            );
        }

        return response()->json($this->present($article->fresh(['topic', 'author']), $user, withBody: true));
    }

    public function sendBack(Request $request, Article $article)
    {
        $user = $request->user();
        $data = $request->validate(['note' => ['required', 'string', 'max:5000']]);

        $article->forceFill(['status' => Article::RETURNED, 'editor_note' => $data['note'], 'reviewed_by' => $user->id])->save();

        if ($article->author_id !== $user->id) {
            $this->inbox->record($article->author, 'article_returned', "Tekst je vraćen na doradu: {$article->title}", $data['note'], "/admin/tekstovi/{$article->id}", ['site']);
        }

        return response()->json($this->present($article->fresh(['topic', 'author']), $user, withBody: true));
    }

    public function unpublish(Request $request, Article $article)
    {
        $article->forceFill(['status' => Article::DRAFT, 'featured' => false])->save();

        return response()->json($this->present($article->fresh(['topic', 'author']), $request->user(), withBody: true));
    }

    public function feature(Request $request, Article $article)
    {
        $data = $request->validate(['featured' => ['required', 'boolean']]);
        $article->forceFill(['featured' => $data['featured']])->save();

        return response()->json($this->present($article->fresh(['topic', 'author']), $request->user()));
    }

    public function destroy(Request $request, Article $article)
    {
        $user = $request->user();
        abort_unless($this->isEditor($user) || ($article->author_id === $user->id && $article->status !== Article::PUBLISHED), 403, 'Objavljen tekst može da obriše samo urednik.');

        $article->delete();

        return response()->json(['message' => 'Tekst je obrisan.']);
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'byline' => ['nullable', 'string', 'max:160'],
            'bio' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();
        $user->forceFill(['byline' => $data['byline'] ?? null, 'bio' => $data['bio'] ?? null])->save();

        return response()->json(['name' => $user->name, 'byline' => $user->byline, 'bio' => $user->bio]);
    }

    private function validated(Request $request, User $user): array
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in(Article::KINDS)],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'debate_id' => ['nullable', 'integer', Rule::exists('debates', 'id')->whereIn('status', Debate::PUBLIC_STATUSES)],
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string', 'max:1000'],
            'body' => ['required', 'string', 'max:100000'],
            'slug' => ['nullable', 'string', 'max:140', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/'],
        ], [
            'slug.regex' => 'Adresa sme da sadrži samo mala slova bez kvačica, brojeve i crtice.',
        ]);

        if (! $this->isEditor($user)) {
            unset($data['slug']);
        }

        return $data;
    }

    private function authorizeView(User $user, Article $article): void
    {
        abort_unless($this->isEditor($user) || $article->author_id === $user->id, 403, 'Ovaj tekst nije tvoj.');
    }

    private function isEditor(User $user): bool
    {
        return $user->hasRole(User::EDITOR, User::ADMIN);
    }

    private function present(Article $article, User $user, bool $withBody = false): array
    {
        return [
            ...ArticleController::present($article, $withBody),
            'topic_id' => $article->topic_id,
            'debate_id' => $article->debate_id,
            'status' => $article->status,
            'is_visible' => $article->isVisible(),
            'editor_note' => $article->editor_note,
            'submitted_at' => $article->submitted_at?->toIso8601String(),
            'updated_at' => $article->updated_at?->toIso8601String(),
            'author_id' => $article->author_id,
            'can_edit' => $article->isEditableBy($user),
            'can_submit' => $article->author_id === $user->id && in_array($article->status, [Article::DRAFT, Article::RETURNED], true),
        ];
    }
}

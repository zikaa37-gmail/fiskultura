<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Debate;
use App\Models\Topic;
use App\Models\User;
use App\Services\Ai\ArticleSummarizer;
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
            'proposals' => ['nullable', 'boolean'],
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
            ->when($filters['proposals'] ?? false, fn (Builder $query) => $query->whereNotNull('topic_proposal'))
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
        $data = $this->validated($request);

        $article = Article::create([
            ...$data,
            'slug' => Article::uniqueSlug($data['title']),
            'author_id' => $user->id,
            'status' => Article::DRAFT,
        ]);

        return response()->json($this->present($article->load(['topic', 'author']), $user, withBody: true), 201);
    }

    public function update(Request $request, Article $article)
    {
        $user = $request->user();
        abort_unless($article->isEditableBy($user), 403, 'Tekst je poslat uredniku i ne može da se menja dok ga ne pregleda.');
        $data = $this->validated($request);

        $article->update([
            ...$data,
            'slug' => $article->published_at === null && $data['title'] !== $article->title ? Article::uniqueSlug($data['title'], $article->id) : $article->slug,
        ]);

        return response()->json($this->present($article->fresh(['topic', 'author']), $user, withBody: true));
    }

    public function submit(Request $request, Article $article)
    {
        $user = $request->user();
        abort_unless($article->author_id === $user->id && in_array($article->status, [Article::DRAFT, Article::RETURNED], true), 403, 'Tekst je već poslat ili objavljen.');
        if (blank($user->byline)) {
            throw ValidationException::withMessages(['byline' => 'Pre slanja upiši potpis u profilu: zvanje ili specijalnost i mesto.']);
        }

        $article->forceFill(['status' => Article::SUBMITTED, 'submitted_at' => now()])->save();

        $editors = User::whereIn('role', [User::EDITOR, User::ADMIN])->whereNull('blocked_at')->whereKeyNot($user->id)->get();
        $detail = "{$user->name} · ".self::KIND_LABELS[$article->kind].($article->topic_proposal ? " · predlaže novu temu: {$article->topic_proposal}" : '');
        $this->inbox->record($editors, 'article_submitted', "Tekst za pregled: {$article->title}", $detail, "/admin/tekstovi/{$article->id}", ['site']);

        return response()->json($this->present($article->fresh(['topic', 'author']), $user, withBody: true));
    }

    public function publish(Request $request, Article $article)
    {
        $user = $request->user();
        $data = $request->validate(['published_at' => ['nullable', 'date']]);
        if ($article->topic_proposal) {
            throw ValidationException::withMessages(['topic_proposal' => "Autor predlaže novu temu „{$article->topic_proposal}”. Pre objave je dodaj kao novu temu, izaberi postojeću ili odbaci predlog."]);
        }
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

    public function resolveTopic(Request $request, Article $article)
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:120'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
        ]);
        $name = trim((string) ($data['name'] ?? ''));

        if ($name !== '') {
            $topic = Topic::whereRaw('lower(name) = ?', [mb_strtolower($name)])->first()
                ?? Topic::create(['name' => $name, 'slug' => Topic::uniqueSlug($name), 'sort' => (int) Topic::max('sort') + 10]);
            $article->forceFill(['topic_id' => $topic->id, 'topic_proposal' => null])->save();
        } else {
            $article->forceFill(['topic_id' => $data['topic_id'] ?? $article->topic_id, 'topic_proposal' => null])->save();
        }

        return response()->json($this->present($article->fresh(['topic', 'author']), $request->user(), withBody: true));
    }

    public function summary(Request $request, ArticleSummarizer $summarizer)
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'min:200', 'max:100000'],
        ], [
            'body.min' => 'Prvo nalepi tekst, pa AI može da napiše uvod.',
        ]);

        return response()->json(['summary' => $summarizer->summarize($data['title'] ?? '', $data['body'])]);
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in(Article::KINDS)],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'topic_proposal' => ['nullable', 'string', 'max:120'],
            'debate_id' => ['nullable', 'integer', Rule::exists('debates', 'id')->whereIn('status', Debate::PUBLIC_STATUSES)],
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string', 'max:1000'],
            'body' => ['required', 'string', 'max:100000'],
        ]);
        $proposal = trim((string) ($data['topic_proposal'] ?? ''));
        $data['topic_proposal'] = empty($data['topic_id']) && $proposal !== '' ? $proposal : null;

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
            'topic_proposal' => $article->topic_proposal,
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

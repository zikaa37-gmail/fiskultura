<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Debate;
use App\Models\Topic;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    public function topics()
    {
        $topics = Topic::withCount(['articles' => fn (Builder $query) => $query->visible()])
            ->orderBy('sort')
            ->orderBy('name')
            ->get();

        return response()->json($topics->map(fn (Topic $topic) => [...$topic->present(), 'articles_count' => $topic->articles_count])->values());
    }

    public function list(Request $request)
    {
        $filters = $request->validate([
            'kind' => ['nullable', Rule::in(Article::KINDS)],
            'topic' => ['nullable', 'string', 'max:80'],
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $page = Article::visible()
            ->with(['topic', 'author'])
            ->when($filters['kind'] ?? null, fn (Builder $query, string $kind) => $query->where('kind', $kind))
            ->when($filters['topic'] ?? null, fn (Builder $query, string $slug) => $query->whereHas('topic', fn (Builder $topic) => $topic->where('slug', $slug)))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $inner) => $inner
                ->where('title', 'like', "%{$search}%")
                ->orWhere('summary', 'like', "%{$search}%")))
            ->orderByDesc('featured')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 12, page: $filters['page'] ?? 1);

        return response()->json([
            'data' => $page->getCollection()->map(fn (Article $article) => self::present($article))->values(),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
        ]);
    }

    public function show(string $slug)
    {
        $article = Article::visible()->with(['topic', 'author', 'debate'])->where('slug', $slug)->firstOrFail();

        $related = Article::visible()
            ->with(['topic', 'author'])
            ->whereKeyNot($article->id)
            ->where(fn (Builder $query) => $query
                ->where('author_id', $article->author_id)
                ->when($article->topic_id, fn (Builder $inner) => $inner->orWhere('topic_id', $article->topic_id)))
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        $debate = $article->debate && in_array($article->debate->status, Debate::PUBLIC_STATUSES, true) ? $article->debate : null;

        return response()->json([
            ...self::present($article, withBody: true),
            'debate' => $debate ? ['slug' => $debate->slug, 'title' => $debate->title] : null,
            'related' => $related->map(fn (Article $item) => self::present($item))->values(),
        ]);
    }

    public static function present(Article $article, bool $withBody = false): array
    {
        $author = $article->author;

        return [
            'id' => $article->id,
            'slug' => $article->slug,
            'kind' => $article->kind,
            'title' => $article->title,
            'summary' => $article->summary,
            ...($withBody ? ['body' => $article->body] : []),
            'featured' => $article->featured,
            'published_at' => $article->published_at?->toIso8601String(),
            'topic' => $article->topic ? ['slug' => $article->topic->slug, 'name' => $article->topic->name] : null,
            'author' => [
                'name' => $author?->name,
                'byline' => $author?->byline,
                ...($withBody ? ['bio' => $author?->bio] : []),
            ],
        ];
    }
}

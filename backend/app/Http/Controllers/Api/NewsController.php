<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NewsController extends Controller
{
    public function list(Request $request)
    {
        $filters = $request->validate([
            'category' => ['nullable', Rule::in(News::CATEGORIES)],
            'organization' => ['nullable', 'string', 'max:100'],
            'umbrella' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'search' => ['nullable', 'string', 'max:100'],
            'featured' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $page = News::visible()
            ->with('organization')
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->when($filters['organization'] ?? null, fn (Builder $query, string $slug) => $query->whereHas('organization', fn (Builder $organization) => $organization->where('slug', $slug)))
            ->when($filters['umbrella'] ?? null, fn (Builder $query, string $slug) => $query->whereHas('organization', fn (Builder $organization) => $organization
                ->where('slug', $slug)
                ->orWhereHas('parent', fn (Builder $parent) => $parent->where('slug', $slug))))
            ->when($filters['year'] ?? null, fn (Builder $query, int $year) => $query->whereYear('published_at', $year))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $inner) => $inner
                ->where('title', 'like', "%{$search}%")
                ->orWhere('summary', 'like', "%{$search}%")))
            ->when($filters['featured'] ?? false, fn (Builder $query) => $query->where('featured', true))
            ->orderByDesc('featured')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 12, page: $filters['page'] ?? 1);

        return response()->json([
            'data' => $page->getCollection()->map(fn (News $news) => self::present($news))->values(),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
        ]);
    }

    public function years()
    {
        $years = News::visible()->pluck('published_at')->map(fn ($date) => (int) $date->format('Y'))->unique()->sortDesc()->values();

        return response()->json($years);
    }

    public function show(string $slug)
    {
        $news = News::visible()->with('organization')->where('slug', $slug)->firstOrFail();

        $related = News::visible()
            ->with('organization')
            ->whereKeyNot($news->id)
            ->where(fn (Builder $query) => $query
                ->when($news->organization_id, fn (Builder $inner) => $inner->where('organization_id', $news->organization_id))
                ->orWhere('category', $news->category))
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        return response()->json([
            ...self::present($news, withBody: true),
            'related' => $related->map(fn (News $item) => self::present($item))->values(),
        ]);
    }

    public static function present(News $news, bool $withBody = false): array
    {
        $organization = $news->organization;

        return [
            'id' => $news->id,
            'slug' => $news->slug,
            'title' => $news->title,
            'summary' => $news->summary,
            ...($withBody ? ['body' => $news->body] : []),
            'category' => $news->category,
            'featured' => $news->featured,
            'cover_image' => $news->cover_image,
            'published_at' => $news->published_at?->toIso8601String(),
            'source' => [
                'url' => $news->source_url,
                'type' => $news->source_type,
                'published_at' => $news->source_published_at?->toDateString(),
            ],
            'organization' => $organization ? [
                'slug' => $organization->slug,
                'name' => $organization->name,
                'short_name' => $organization->short_name,
            ] : null,
        ];
    }
}

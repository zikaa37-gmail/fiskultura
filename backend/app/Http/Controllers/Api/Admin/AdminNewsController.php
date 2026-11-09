<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class AdminNewsController extends Controller
{
    public function list(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in([News::DRAFT, News::PUBLISHED, 'scheduled'])],
            'category' => ['nullable', Rule::in(News::CATEGORIES)],
            'organization_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $page = News::with(['organization', 'author'])
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => match ($status) {
                'scheduled' => $query->where('status', News::PUBLISHED)->where('published_at', '>', now()),
                News::PUBLISHED => $query->where('status', News::PUBLISHED)->where('published_at', '<=', now()),
                default => $query->where('status', $status),
            })
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->when($filters['organization_id'] ?? null, fn (Builder $query, int $id) => $query->where('organization_id', $id))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $inner) => $inner
                ->where('title', 'like', "%{$search}%")
                ->orWhere('summary', 'like', "%{$search}%")))
            ->orderByRaw('case when status = ? then 0 else 1 end', [News::DRAFT])
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 25, page: $filters['page'] ?? 1);

        return response()->json([
            'data' => $page->getCollection()->map(fn (News $news) => $this->present($news))->values(),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
        ]);
    }

    public function show(News $news)
    {
        return response()->json($this->present($news->load(['organization', 'author'])));
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $news = News::create([
            ...$data,
            'slug' => News::uniqueSlug($data['slug'] ?? $data['title']),
            'author_id' => $request->user()->id,
            'published_at' => $this->publishedAt($data),
        ]);

        return response()->json($this->present($news->load(['organization', 'author'])), 201);
    }

    public function update(Request $request, News $news)
    {
        $data = $this->validated($request, $news);

        $news->update([
            ...$data,
            'slug' => isset($data['slug']) && $data['slug'] !== $news->slug ? News::uniqueSlug($data['slug'], $news->id) : $news->slug,
            'published_at' => $this->publishedAt($data, $news),
        ]);

        return response()->json($this->present($news->fresh(['organization', 'author'])));
    }

    public function feature(Request $request, News $news)
    {
        $data = $request->validate(['featured' => ['required', 'boolean']]);
        $news->forceFill(['featured' => $data['featured']])->save();

        return response()->json($this->present($news->fresh(['organization', 'author'])));
    }

    public function destroy(News $news)
    {
        $news->delete();

        return response()->json(['message' => 'Vest je obrisana.']);
    }

    private function validated(Request $request, ?News $news = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:140', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/'],
            'summary' => ['required', 'string', 'max:1000'],
            'body' => ['nullable', 'string', 'max:50000'],
            'category' => ['required', Rule::in(News::CATEGORIES)],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'source_url' => ['nullable', 'url', 'max:500'],
            'source_type' => ['nullable', Rule::in(News::SOURCE_TYPES)],
            'source_published_at' => ['nullable', 'date'],
            'status' => ['required', Rule::in([News::DRAFT, News::PUBLISHED])],
            'featured' => ['boolean'],
        ], [
            'slug.regex' => 'Adresa sme da sadrži samo mala slova bez kvačica, brojeve i crtice.',
        ]);
    }

    private function publishedAt(array $data, ?News $news = null): ?Carbon
    {
        if ($data['status'] === News::PUBLISHED) {
            return $news?->published_at ?? now();
        }

        return $news?->published_at;
    }

    private function present(News $news): array
    {
        return [
            'id' => $news->id,
            'slug' => $news->slug,
            'title' => $news->title,
            'summary' => $news->summary,
            'body' => $news->body,
            'category' => $news->category,
            'organization_id' => $news->organization_id,
            'organization' => $news->organization ? ['slug' => $news->organization->slug, 'name' => $news->organization->name, 'short_name' => $news->organization->short_name] : null,
            'source_url' => $news->source_url,
            'source_type' => $news->source_type,
            'source_published_at' => $news->source_published_at?->toDateString(),
            'status' => $news->status,
            'is_visible' => $news->status === News::PUBLISHED && $news->published_at !== null && $news->published_at->lte(now()),
            'published_at' => $news->published_at?->toIso8601String(),
            'featured' => $news->featured,
            'author' => $news->author?->name,
            'updated_at' => $news->updated_at?->toIso8601String(),
        ];
    }
}

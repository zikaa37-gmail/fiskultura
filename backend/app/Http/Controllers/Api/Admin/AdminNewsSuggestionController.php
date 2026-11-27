<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Models\NewsSuggestion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminNewsSuggestionController extends Controller
{
    public function list(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(NewsSuggestion::STATUSES)],
            'origin' => ['nullable', Rule::in([NewsSuggestion::FEED, NewsSuggestion::FORM])],
            'organization' => ['nullable', 'string', 'max:100'],
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $page = NewsSuggestion::with(['organization', 'source', 'news', 'reviewer'])
            ->where('status', $filters['status'] ?? NewsSuggestion::NEW)
            ->when($filters['origin'] ?? null, fn (Builder $query, string $origin) => $query->where('origin', $origin))
            ->when($filters['organization'] ?? null, fn (Builder $query, string $slug) => $query->whereHas('organization', fn (Builder $organization) => $organization->where('slug', $slug)))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $inner) => $inner
                ->where('title', 'like', "%{$search}%")
                ->orWhere('excerpt', 'like', "%{$search}%")
                ->orWhere('sender_organization', 'like', "%{$search}%")))
            ->orderByRaw('coalesce(published_on, date(created_at)) desc')
            ->orderByDesc('id')
            ->paginate(25, page: $filters['page'] ?? 1);

        return response()->json([
            'data' => $page->getCollection()->map(fn (NewsSuggestion $suggestion) => $this->present($suggestion))->values(),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
            'counts' => NewsSuggestion::query()->select('status', DB::raw('count(*) as total'))->groupBy('status')->pluck('total', 'status'),
        ]);
    }

    public function accept(Request $request, NewsSuggestion $suggestion)
    {
        if ($suggestion->status === NewsSuggestion::ACCEPTED && $suggestion->news) {
            return response()->json(['news_id' => $suggestion->news_id]);
        }

        $news = DB::transaction(function () use ($request, $suggestion) {
            $organization = $suggestion->organization;
            $news = News::create([
                'slug' => News::uniqueSlug($suggestion->title),
                'title' => $suggestion->title,
                'summary' => '',
                'category' => 'vest',
                'organization_id' => $organization?->id,
                'source_url' => $suggestion->url,
                'source_type' => News::sourceTypeFor($suggestion->url, $organization),
                'source_published_at' => $suggestion->published_on ?? $suggestion->created_at,
                'status' => News::DRAFT,
                'author_id' => $request->user()->id,
            ]);
            $this->review($suggestion, NewsSuggestion::ACCEPTED, $request->user()->id, $news->id);

            return $news;
        });

        return response()->json(['news_id' => $news->id], 201);
    }

    public function update(Request $request, NewsSuggestion $suggestion)
    {
        $data = $request->validate(['status' => ['required', Rule::in([NewsSuggestion::NEW, NewsSuggestion::DISMISSED])]]);

        $this->review($suggestion, $data['status'], $data['status'] === NewsSuggestion::NEW ? null : $request->user()->id);

        return response()->json($this->present($suggestion->fresh(['organization', 'source', 'news', 'reviewer'])));
    }

    private function review(NewsSuggestion $suggestion, string $status, ?int $reviewer, ?int $newsId = null): void
    {
        $suggestion->forceFill([
            'status' => $status,
            'reviewed_by' => $reviewer,
            'reviewed_at' => $reviewer ? now() : null,
            'news_id' => $newsId ?? ($status === NewsSuggestion::NEW ? null : $suggestion->news_id),
        ])->save();
    }

    private function present(NewsSuggestion $suggestion): array
    {
        return [
            'id' => $suggestion->id,
            'origin' => $suggestion->origin,
            'status' => $suggestion->status,
            'title' => $suggestion->title,
            'url' => $suggestion->url,
            'excerpt' => $suggestion->excerpt,
            'published_on' => $suggestion->published_on?->toDateString(),
            'created_at' => $suggestion->created_at?->toIso8601String(),
            'organization' => $suggestion->organization ? ['id' => $suggestion->organization->id, 'slug' => $suggestion->organization->slug, 'name' => $suggestion->organization->short_name ?: $suggestion->organization->name] : null,
            'source_type' => $suggestion->source?->type,
            'sender' => $suggestion->origin === NewsSuggestion::FORM ? [
                'name' => $suggestion->sender_name,
                'email' => $suggestion->sender_email,
                'organization' => $suggestion->sender_organization,
            ] : null,
            'news' => $suggestion->news ? ['id' => $suggestion->news->id, 'title' => $suggestion->news->title, 'status' => $suggestion->news->status] : null,
            'reviewer' => $suggestion->reviewer?->name,
            'reviewed_at' => $suggestion->reviewed_at?->toIso8601String(),
            'host' => $suggestion->url ? Str::after((string) parse_url($suggestion->url, PHP_URL_HOST), 'www.') : null,
        ];
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Models\Organization;
use App\Services\LinkChecker;

class OrganizationController extends Controller
{
    public function index()
    {
        $organizations = Organization::with('parent')
            ->withCount(['news' => fn ($query) => $query->visible()])
            ->orderBy('name')
            ->get();

        return response()->json($organizations->map(fn (Organization $organization) => self::present($organization))->values());
    }

    public function show(string $slug)
    {
        $organization = Organization::with(['parent', 'members'])
            ->withCount(['news' => fn ($query) => $query->visible()])
            ->where('slug', $slug)
            ->firstOrFail();

        $news = $organization->news()->visible()->with('organization')->orderByDesc('published_at')->limit(20)->get();

        return response()->json([
            ...self::present($organization),
            'members' => $organization->members->sortBy('city')->map(fn (Organization $member) => [
                'slug' => $member->slug,
                'name' => $member->name,
                'short_name' => $member->short_name,
                'city' => $member->city,
            ])->values(),
            'news' => $news->map(fn (News $item) => NewsController::present($item))->values(),
        ]);
    }

    public static function present(Organization $organization): array
    {
        return [
            'id' => $organization->id,
            'slug' => $organization->slug,
            'name' => $organization->name,
            'short_name' => $organization->short_name,
            'type' => $organization->type,
            'level' => $organization->level,
            'city' => $organization->city,
            'website' => $organization->website,
            'social' => $organization->social ?? (object) [],
            'email' => $organization->email,
            'description' => $organization->description,
            'status' => $organization->status,
            'last_activity' => $organization->last_activity?->toDateString(),
            'parent' => $organization->parent ? ['slug' => $organization->parent->slug, 'name' => $organization->parent->name, 'short_name' => $organization->parent->short_name] : null,
            'member_source' => $organization->member_source,
            'link_status' => (object) collect(['website', 'facebook', 'instagram', 'youtube', 'member_source'])
                ->mapWithKeys(fn (string $field) => [$field => LinkChecker::statusFor($organization, $field)])
                ->filter()
                ->all(),
            'news_count' => $organization->news_count ?? null,
        ];
    }
}

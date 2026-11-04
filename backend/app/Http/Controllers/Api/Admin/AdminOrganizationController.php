<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\LinkChecker;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminOrganizationController extends Controller
{
    public function index()
    {
        $organizations = Organization::with('parent')->withCount('news')->orderBy('name')->get();

        return response()->json($organizations->map(fn (Organization $organization) => $this->present($organization))->values());
    }

    public function show(Organization $organization)
    {
        return response()->json($this->present($organization->load('parent')->loadCount('news')));
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['slug'] = $data['slug'] ?? $this->uniqueSlug($data['short_name'] ?? $data['name']);

        $brokenLinks = $data['broken_links'] ?? [];
        unset($data['broken_links']);
        $organization = Organization::create($data);
        LinkChecker::markBroken($organization, $brokenLinks);

        return response()->json($this->present($organization->load('parent')->loadCount('news')), 201);
    }

    public function update(Request $request, Organization $organization)
    {
        $data = $this->validated($request, $organization);

        if (($data['parent_id'] ?? null) === $organization->id) {
            return response()->json(['message' => 'Organizacija ne može biti sama sebi krovna.', 'errors' => ['parent_id' => ['Organizacija ne može biti sama sebi krovna.']]], 422);
        }

        $brokenLinks = $data['broken_links'] ?? null;
        unset($data['broken_links']);
        $organization->update([...$data, 'slug' => $data['slug'] ?? $organization->slug]);
        if ($brokenLinks !== null) {
            LinkChecker::markBroken($organization->fresh(), $brokenLinks);
        }

        return response()->json($this->present($organization->fresh('parent')->loadCount('news')));
    }

    public function destroy(Organization $organization)
    {
        $organization->delete();

        return response()->json(['message' => 'Organizacija je obrisana. Njene vesti su ostale, bez oznake organizacije.']);
    }

    private function validated(Request $request, ?Organization $organization = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:100', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/', Rule::unique('organizations', 'slug')->ignore($organization?->id)],
            'short_name' => ['nullable', 'string', 'max:60'],
            'type' => ['required', Rule::in(Organization::TYPES)],
            'level' => ['required', Rule::in(Organization::LEVELS)],
            'city' => ['nullable', 'string', 'max:120'],
            'website' => ['nullable', 'url', 'max:255'],
            'social' => ['nullable', 'array'],
            'social.facebook' => ['nullable', 'url', 'max:255'],
            'social.instagram' => ['nullable', 'url', 'max:255'],
            'social.youtube' => ['nullable', 'url', 'max:255'],
            'email' => ['nullable', 'email', 'max:190'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::in(Organization::STATUSES)],
            'last_activity' => ['nullable', 'date'],
            'parent_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'member_source' => ['nullable', 'url', 'max:255'],
            'broken_links' => ['nullable', 'array'],
            'broken_links.*' => [Rule::in(['website', 'facebook', 'instagram', 'youtube', 'member_source'])],
        ], [
            'slug.regex' => 'Adresa sme da sadrži samo mala slova bez kvačica, brojeve i crtice.',
        ]);

        if (array_key_exists('social', $data)) {
            $data['social'] = array_filter($data['social'] ?? []) ?: null;
        }

        return $data;
    }

    private function uniqueSlug(string $value): string
    {
        $base = Str::slug($value) ?: 'organizacija';
        $slug = $base;
        $suffix = 2;

        while (Organization::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function present(Organization $organization): array
    {
        return [
            ...OrganizationController::present($organization),
            'parent_id' => $organization->parent_id,
            'broken_links' => LinkChecker::manuallyBroken($organization),
        ];
    }
}

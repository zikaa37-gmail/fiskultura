<?php

namespace App\Services;

use App\Models\News;
use App\Models\Organization;
use App\Models\Regulation;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ContentImporter
{
    public function import(string $organizationsPath, string $newsPath, ?string $regulationsPath = null): array
    {
        $organizations = json_decode((string) file_get_contents($organizationsPath), true, flags: JSON_THROW_ON_ERROR);
        $news = json_decode((string) file_get_contents($newsPath), true, flags: JSON_THROW_ON_ERROR);
        $regulations = $regulationsPath ? json_decode((string) file_get_contents($regulationsPath), true, flags: JSON_THROW_ON_ERROR) : [];

        return DB::transaction(function () use ($organizations, $news, $regulations) {
            return [
                'organizations' => $this->importOrganizations($organizations),
                'news' => $this->importNews($news),
                'regulations' => $this->importRegulations($regulations),
            ];
        });
    }

    private function importRegulations(array $rows): array
    {
        $created = 0;
        $updated = 0;

        foreach ($rows as $index => $row) {
            $attributes = [
                'title' => $row['title'],
                'kind' => $row['kind'],
                'areas' => $row['areas'],
                'gazette' => $row['gazette'] ?? null,
                'url' => $row['url'] ?? null,
                'valid_from' => $row['validFrom'] ?? null,
                'valid_to' => $row['validTo'] ?? null,
                'summary' => $row['summary'],
                'verification' => $row['verification'] ?? 'unverified',
                'verification_note' => $row['verificationNote'] ?? null,
                'sort' => $index,
            ];

            $regulation = Regulation::where('key', $row['key'])->first();
            if (! $regulation) {
                Regulation::create(['key' => $row['key'], ...$attributes]);
                $created++;

                continue;
            }

            if ($regulation->isUntouched()) {
                $regulation->fill($attributes);
                if ($regulation->isDirty()) {
                    $regulation->timestamps = false;
                    $regulation->save();
                    $updated++;
                }
            }
        }

        return ['created' => $created, 'updated' => $updated, 'skipped' => count($rows) - $created - $updated];
    }

    private function importOrganizations(array $rows): array
    {
        $created = 0;

        foreach ($rows as $row) {
            $organization = Organization::firstOrNew(['slug' => $row['slug']]);
            if ($organization->exists) {
                continue;
            }

            $organization->fill([
                'name' => $row['name'],
                'short_name' => $row['shortName'] ?? null,
                'type' => $row['type'],
                'level' => $row['level'],
                'city' => $row['city'] ?? null,
                'website' => $row['website'] ?? null,
                'social' => array_filter($row['social'] ?? []) ?: null,
                'email' => $row['email'] ?? null,
                'description' => $row['description'] ?? null,
                'status' => in_array($row['status'] ?? null, Organization::STATUSES, true) ? $row['status'] : 'nepoznato',
                'last_activity' => $row['lastActivity'] ?? null,
                'member_source' => $row['memberSource'] ?? null,
            ])->save();
            $created++;
        }

        foreach ($rows as $row) {
            $wanted = $row['brokenLinks'] ?? [];
            if ($wanted === []) {
                continue;
            }
            $organization = Organization::where('slug', $row['slug'])->first();
            $current = LinkChecker::manuallyBroken($organization);
            if (array_diff($wanted, $current) !== []) {
                LinkChecker::markBroken($organization, array_values(array_unique([...$current, ...$wanted])));
            }
        }

        $slugToId = Organization::pluck('id', 'slug');
        foreach ($rows as $row) {
            if (! empty($row['parent']) && isset($slugToId[$row['parent']])) {
                Organization::where('slug', $row['slug'])->whereNull('parent_id')->update(['parent_id' => $slugToId[$row['parent']]]);
            }
        }

        return ['created' => $created, 'skipped' => count($rows) - $created];
    }

    private function importNews(array $rows): array
    {
        $created = 0;
        $updated = 0;
        $organizations = Organization::all()->keyBy('slug');

        foreach ($rows as $row) {
            $organization = $organizations[$row['organization']] ?? null;
            $existing = News::where('source_url', $row['url'])->where('title', $row['title'])->first();
            if ($existing) {
                if ($this->untouched($existing) && $existing->summary !== $row['summary']) {
                    $existing->timestamps = false;
                    $existing->forceFill(['summary' => $row['summary']])->saveQuietly();
                    $updated++;
                }

                continue;
            }

            $date = $this->parseDate($row['date'] ?? null);

            News::create([
                'slug' => News::uniqueSlug($row['title']),
                'title' => $row['title'],
                'summary' => $row['summary'],
                'category' => in_array($row['category'] ?? null, News::CATEGORIES, true) ? $row['category'] : 'ostalo',
                'organization_id' => $organization?->id,
                'source_url' => $row['url'],
                'source_type' => News::sourceTypeFor($row['url'], $organization),
                'source_published_at' => $date,
                'status' => News::PUBLISHED,
                'published_at' => $date ? $date->copy()->min(now()) : Carbon::create(2021, 1, 1),
            ]);
            $created++;
        }

        return ['created' => $created, 'updated' => $updated, 'skipped' => count($rows) - $created - $updated];
    }

    private function untouched(News $news): bool
    {
        return $news->author_id === null && $news->created_at?->equalTo($news->updated_at);
    }

    private function parseDate(?string $value): ?Carbon
    {
        if (! $value) {
            return null;
        }

        return strlen($value) === 7 ? Carbon::createFromFormat('Y-m-d', "{$value}-01")->startOfDay() : Carbon::parse($value)->startOfDay();
    }
}

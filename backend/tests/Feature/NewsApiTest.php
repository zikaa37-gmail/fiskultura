<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\Organization;
use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ContentSeeder::class);
    }

    public function test_import_creates_organizations_with_umbrella_and_news_with_sources(): void
    {
        $this->assertSame(39, Organization::count());
        $this->assertSame(15, Organization::where('slug', 'sspfvs')->firstOrFail()->members()->count());
        $this->assertSame(65, News::count());
        $this->assertSame(0, News::whereNull('source_url')->count());
        $this->assertSame(0, News::whereNull('organization_id')->count());

        $this->seed(ContentSeeder::class);
        $this->assertSame(65, News::count());
        $this->assertSame(39, Organization::count());
    }

    public function test_reimport_fixes_untouched_summaries_but_keeps_editor_changes(): void
    {
        $untouched = News::orderBy('id')->first();
        $edited = News::orderBy('id')->skip(1)->first();
        $original = $untouched->summary;

        $untouched->timestamps = false;
        $untouched->forceFill(['summary' => 'Stari sažetak sa internom napomenom.'])->saveQuietly();
        $this->travel(1)->minutes();
        $edited->update(['summary' => 'Urednik je prepravio sažetak.']);

        $this->seed(ContentSeeder::class);

        $this->assertSame($original, $untouched->fresh()->summary);
        $this->assertTrue($untouched->fresh()->created_at->equalTo($untouched->fresh()->updated_at));
        $this->assertSame('Urednik je prepravio sažetak.', $edited->fresh()->summary);
        $this->assertSame(65, News::count());
    }

    public function test_list_is_paginated_newest_first_with_source_and_organization(): void
    {
        $response = $this->postJson('/api/news/list', ['per_page' => 5])
            ->assertOk()
            ->assertJsonPath('meta.total', 65)
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure(['data' => [['slug', 'title', 'summary', 'category', 'published_at', 'source' => ['url', 'type', 'published_at'], 'organization' => ['slug', 'name', 'short_name']]]]);

        $dates = collect($response->json('data'))->pluck('published_at');
        $this->assertSame($dates->sortDesc()->values()->all(), $dates->all());
    }

    public function test_list_filters_by_category_organization_umbrella_year_and_search(): void
    {
        $category = $this->postJson('/api/news/list', ['category' => 'takmicenje', 'per_page' => 50])->assertOk();
        $this->assertNotEmpty($category->json('data'));
        $this->assertSame(['takmicenje'], collect($category->json('data'))->pluck('category')->unique()->values()->all());

        $organization = $this->postJson('/api/news/list', ['organization' => 'sspfvs', 'per_page' => 50])->assertOk();
        $this->assertSame(['sspfvs'], collect($organization->json('data'))->pluck('organization.slug')->unique()->values()->all());

        $umbrella = $this->postJson('/api/news/list', ['umbrella' => 'sspfvs', 'per_page' => 50])->assertOk();
        $this->assertGreaterThan($organization->json('meta.total'), $umbrella->json('meta.total'));

        $year = $this->postJson('/api/news/list', ['year' => 2024, 'per_page' => 50])->assertOk();
        $this->assertTrue(collect($year->json('data'))->every(fn ($item) => str_starts_with($item['published_at'], '2024')));

        $search = $this->postJson('/api/news/list', ['search' => 'Zdravitas', 'per_page' => 50])->assertOk();
        $this->assertNotEmpty($search->json('data'));
    }

    public function test_drafts_and_future_news_are_hidden(): void
    {
        $draft = News::first();
        $draft->update(['status' => News::DRAFT]);
        $future = News::skip(1)->first();
        $future->update(['published_at' => now()->addDay()]);

        $this->postJson('/api/news/list', ['per_page' => 50])->assertJsonPath('meta.total', 63);
        $this->getJson("/api/news/{$draft->slug}")->assertNotFound();
        $this->getJson("/api/news/{$future->slug}")->assertNotFound();
    }

    public function test_show_returns_news_with_related(): void
    {
        $news = News::whereHas('organization', fn ($query) => $query->where('slug', 'sspfvs'))->firstOrFail();

        $this->getJson("/api/news/{$news->slug}")
            ->assertOk()
            ->assertJsonPath('slug', $news->slug)
            ->assertJsonPath('organization.slug', 'sspfvs')
            ->assertJsonStructure(['body', 'related']);
    }

    public function test_organizations_index_and_show(): void
    {
        $this->getJson('/api/organizations')
            ->assertOk()
            ->assertJsonCount(39);

        $this->getJson('/api/organizations/sspfvs')
            ->assertOk()
            ->assertJsonPath('short_name', 'SSPFVS')
            ->assertJsonCount(15, 'members')
            ->assertJsonStructure(['news', 'news_count']);

        $this->getJson('/api/organizations/upfk-beograd')
            ->assertOk()
            ->assertJsonPath('parent.slug', 'sspfvs');

        $this->getJson('/api/organizations/ne-postoji')->assertNotFound();
    }

    public function test_years_lists_distinct_years(): void
    {
        $years = $this->getJson('/api/news/years')->assertOk()->json();

        $this->assertContains(2024, $years);
        $this->assertSame($years, collect($years)->sortDesc()->values()->all());
    }
}

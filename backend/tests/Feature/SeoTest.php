<?php

namespace Tests\Feature;

use App\Http\Controllers\SeoController;
use App\Models\News;
use App\Models\Organization;
use App\Models\Question;
use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ContentSeeder::class);
        config(['app.frontend_url' => 'https://fiskultura.rs']);
    }

    public function test_routes_list_only_public_content_for_prerender(): void
    {
        $draft = News::create(['slug' => 'nacrt-vesti', 'title' => 'Nacrt', 'summary' => 'x', 'category' => 'vest', 'status' => News::DRAFT]);
        $future = News::create(['slug' => 'buduca-vest', 'title' => 'Buduća', 'summary' => 'x', 'category' => 'vest', 'status' => News::PUBLISHED, 'published_at' => now()->addDay()]);
        $pending = Question::create(['slug' => 'na-cekanju', 'category' => 'ostalo', 'title' => 'Na čekanju']);

        $routes = $this->getJson('/api/seo/routes')->assertOk()->json();

        $this->assertCount(News::visible()->count(), $routes['news']);
        $this->assertCount(Organization::count(), $routes['organizations']);
        $this->assertCount(Question::visible()->count(), $routes['questions']);
        $slugs = array_column([...$routes['news'], ...$routes['questions']], 'slug');
        foreach ([$draft->slug, $future->slug, $pending->slug] as $hidden) {
            $this->assertNotContains($hidden, $slugs);
        }
    }

    public function test_sitemap_has_static_pages_and_public_details_but_not_members_only_questions(): void
    {
        $response = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

        $xml = simplexml_load_string($response->getContent());
        $locations = [];
        foreach ($xml->url as $url) {
            $locations[] = (string) $url->loc;
        }

        $this->assertContains('https://fiskultura.rs/', $locations);
        $this->assertContains('https://fiskultura.rs/pitanja', $locations);
        $news = News::visible()->first();
        $this->assertContains("https://fiskultura.rs/vesti/{$news->slug}", $locations);
        $this->assertContains('https://fiskultura.rs/udruzenja/sspfvs', $locations);
        $this->assertSame(count(SeoController::STATIC_PAGES) + News::visible()->count() + Organization::count(), count($locations));
        $this->assertEmpty(array_filter($locations, fn (string $location) => str_contains($location, '/pitanja/')));
        $this->assertStringNotContainsString('/admin', $response->getContent());
    }

    public function test_rss_lists_newest_public_news_with_absolute_links(): void
    {
        $draft = News::create(['slug' => 'nacrt-rss', 'title' => 'Nacrt', 'summary' => 'x', 'category' => 'vest', 'status' => News::DRAFT]);
        $future = News::create(['slug' => 'buduca-rss', 'title' => 'Buduća', 'summary' => 'x', 'category' => 'vest', 'status' => News::PUBLISHED, 'published_at' => now()->addDay()]);
        $newest = News::create(['slug' => 'najnovija-rss', 'title' => 'Najnovija & prva', 'summary' => 'Kratko <b>o</b> vesti', 'category' => 'takmicenje', 'status' => News::PUBLISHED, 'published_at' => now()->subSecond()]);

        $response = $this->get('/rss.xml')->assertOk()->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8');

        $xml = simplexml_load_string($response->getContent());
        $this->assertSame('2.0', (string) $xml['version']);
        $links = [];
        foreach ($xml->channel->item as $item) {
            $links[] = (string) $item->link;
        }
        $this->assertSame('https://fiskultura.rs/vesti/najnovija-rss', $links[0]);
        $this->assertSame('Najnovija & prva', (string) $xml->channel->item[0]->title);
        $this->assertSame('Kratko <b>o</b> vesti', (string) $xml->channel->item[0]->description);
        $this->assertSame('Takmičenja', (string) $xml->channel->item[0]->category);
        $this->assertCount(min(30, News::visible()->count()), $links);
        $this->assertNotContains("https://fiskultura.rs/vesti/{$draft->slug}", $links);
        $this->assertNotContains("https://fiskultura.rs/vesti/{$future->slug}", $links);
    }
}

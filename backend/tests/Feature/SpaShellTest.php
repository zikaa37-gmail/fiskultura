<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\Question;
use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpaShellTest extends TestCase
{
    use RefreshDatabase;

    private string $shell;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ContentSeeder::class);
        $this->shell = tempnam(sys_get_temp_dir(), 'shell');
        file_put_contents($this->shell, '<!doctype html><html><head><title>Fiskultura</title></head><body><app-root></app-root></body></html>');
        config(['app.frontend_url' => 'https://fiskultura.rs', 'app.spa_shell' => $this->shell]);
    }

    protected function tearDown(): void
    {
        @unlink($this->shell);
        parent::tearDown();
    }

    public function test_news_published_after_prerender_gets_its_own_canonical(): void
    {
        $news = News::create(['slug' => 'nova-vest', 'title' => 'Nova vest', 'summary' => 'x', 'category' => 'vest', 'status' => News::PUBLISHED, 'published_at' => now()->subHour()]);

        $this->get('/vesti/'.$news->slug.'/?strana=2')
            ->assertOk()
            ->assertSee('<link rel="canonical" href="https://fiskultura.rs/vesti/nova-vest">', false)
            ->assertDontSee('noindex', false);
    }

    public function test_static_page_gets_canonical(): void
    {
        $this->get('/vesti')->assertOk()->assertSee('<link rel="canonical" href="https://fiskultura.rs/vesti">', false);
    }

    public function test_unknown_or_hidden_content_is_404_with_noindex(): void
    {
        $draft = News::create(['slug' => 'nacrt', 'title' => 'Nacrt', 'summary' => 'x', 'category' => 'vest', 'status' => News::DRAFT]);
        $pending = Question::create(['slug' => 'na-cekanju', 'category' => 'ostalo', 'title' => 'Na čekanju']);

        foreach (['/nepostoji', '/vesti/'.$draft->slug, '/pitanja/'.$pending->slug, '/udruzenja/nema-ga', '/sportovi/nepostojeci'] as $path) {
            $this->get($path)
                ->assertNotFound()
                ->assertSee('<meta name="robots" content="noindex, nofollow">', false)
                ->assertDontSee('rel="canonical"', false)
                ->assertSee('<app-root>', false);
        }
    }

    public function test_private_pages_are_served_without_canonical_and_with_noindex(): void
    {
        foreach (['/prijava', '/admin/vesti', '/profil', '/obavestenja/odjava'] as $path) {
            $this->get($path)
                ->assertOk()
                ->assertSee('<meta name="robots" content="noindex, nofollow">', false)
                ->assertDontSee('rel="canonical"', false);
        }
    }

    public function test_api_paths_stay_json_404(): void
    {
        $this->getJson('/api/nepostoji')->assertNotFound()->assertJsonStructure(['message']);
    }
}

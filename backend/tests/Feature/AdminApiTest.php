<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\ContentSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $admin;

    private User $editor;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([UserSeeder::class, ContentSeeder::class]);
        $this->admin = User::where('email', 'admin@fiskultura.test')->firstOrFail();
        $this->editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $this->user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
    }

    private function newsPayload(array $overrides = []): array
    {
        return [
            'title' => 'Seminar „Igre sa loptom u mlađim razredima"',
            'summary' => 'Društvo pedagoga organizuje jednodnevni seminar za nastavnike i učitelje.',
            'body' => "Prvi pasus.\n\nDrugi pasus.",
            'category' => 'seminar',
            'organization_id' => Organization::where('slug', 'upfk-beograd')->value('id'),
            'source_url' => 'https://example.org/seminar',
            'source_type' => 'sajt',
            'status' => News::PUBLISHED,
            'featured' => true,
            ...$overrides,
        ];
    }

    public function test_only_editors_and_admins_reach_news_admin(): void
    {
        $this->postJson('/api/admin/news/list')->assertUnauthorized();
        $this->withJwt($this->user)->postJson('/api/admin/news/list')->assertForbidden();
        $this->withJwt($this->editor)->postJson('/api/admin/news/list')->assertOk()->assertJsonPath('meta.total', 65);
        $this->withJwt($this->admin)->postJson('/api/admin/news/list')->assertOk();
    }

    public function test_editor_creates_publishes_and_edits_news(): void
    {
        $created = $this->withJwt($this->editor)->postJson('/api/admin/news', $this->newsPayload())
            ->assertCreated()
            ->assertJsonPath('slug', 'seminar-igre-sa-loptom-u-mladim-razredima')
            ->assertJsonPath('author', 'Urednik')
            ->assertJsonPath('is_visible', true)
            ->json();

        $this->getJson("/api/news/{$created['slug']}")->assertOk()->assertJsonPath('organization.slug', 'upfk-beograd');

        $this->withJwt($this->editor)->patchJson("/api/admin/news/{$created['id']}", $this->newsPayload(['title' => 'Novi naslov', 'status' => News::DRAFT]))
            ->assertOk()
            ->assertJsonPath('title', 'Novi naslov')
            ->assertJsonPath('slug', $created['slug'])
            ->assertJsonPath('is_visible', false);

        $this->getJson("/api/news/{$created['slug']}")->assertNotFound();
    }

    public function test_scheduled_news_is_hidden_until_publish_time(): void
    {
        $news = $this->withJwt($this->editor)->postJson('/api/admin/news', $this->newsPayload(['published_at' => now()->addDays(2)->toIso8601String()]))
            ->assertCreated()
            ->assertJsonPath('is_visible', false)
            ->json();

        $this->withJwt($this->editor)->postJson('/api/admin/news/list', ['status' => 'scheduled'])->assertJsonPath('meta.total', 1);
        $this->getJson("/api/news/{$news['slug']}")->assertNotFound();
    }

    public function test_news_validation_and_duplicate_slugs(): void
    {
        $this->withJwt($this->editor)->postJson('/api/admin/news', ['title' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'summary', 'category', 'status']);

        $this->withJwt($this->editor)->postJson('/api/admin/news', $this->newsPayload(['slug' => 'Loša Adresa']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('slug');

        $first = $this->withJwt($this->editor)->postJson('/api/admin/news', $this->newsPayload())->json('slug');
        $second = $this->withJwt($this->editor)->postJson('/api/admin/news', $this->newsPayload())->json('slug');
        $this->assertSame("{$first}-2", $second);
    }

    public function test_editor_deletes_news(): void
    {
        $news = News::first();

        $this->withJwt($this->editor)->deleteJson("/api/admin/news/{$news->id}")->assertOk();
        $this->assertModelMissing($news);
    }

    public function test_list_filters_drafts_and_search(): void
    {
        News::first()->update(['status' => News::DRAFT]);

        $this->withJwt($this->editor)->postJson('/api/admin/news/list', ['status' => 'draft'])->assertJsonPath('meta.total', 1);
        $this->withJwt($this->editor)->postJson('/api/admin/news/list', ['status' => 'published'])->assertJsonPath('meta.total', 64);
        $this->assertNotEmpty($this->withJwt($this->editor)->postJson('/api/admin/news/list', ['search' => 'Zdravitas'])->json('data'));
    }

    public function test_editor_creates_and_updates_organization_but_only_admin_deletes(): void
    {
        $parent = Organization::where('slug', 'sspfvs')->firstOrFail();

        $organization = $this->withJwt($this->editor)->postJson('/api/admin/organizations', [
            'name' => 'Udruženje pedagoga fizičke kulture Sombor',
            'short_name' => 'UPFK Sombor',
            'type' => 'strukovno-udruzenje',
            'level' => 'gradski',
            'city' => 'Sombor',
            'status' => 'aktivno',
            'parent_id' => $parent->id,
            'social' => ['facebook' => 'https://facebook.com/upfksombor', 'instagram' => null],
        ])->assertCreated()
            ->assertJsonPath('slug', 'upfk-sombor')
            ->assertJsonPath('parent.slug', 'sspfvs')
            ->assertJsonPath('social.facebook', 'https://facebook.com/upfksombor')
            ->json();

        $this->withJwt($this->editor)->patchJson("/api/admin/organizations/{$organization['id']}", [
            'name' => 'UPFK Sombor',
            'type' => 'strukovno-udruzenje',
            'level' => 'gradski',
            'status' => 'aktivno',
            'parent_id' => $organization['id'],
        ])->assertUnprocessable();

        $this->withJwt($this->editor)->deleteJson("/api/admin/organizations/{$organization['id']}")->assertForbidden();
        $this->withJwt($this->admin)->deleteJson("/api/admin/organizations/{$organization['id']}")->assertOk();
        $this->assertSame(15, $parent->members()->count());
    }

    public function test_deleting_organization_keeps_its_news(): void
    {
        $organization = Organization::where('slug', 'sspfvs')->firstOrFail();
        $count = $organization->news()->count();

        $this->withJwt($this->admin)->deleteJson("/api/admin/organizations/{$organization->id}")->assertOk();
        $this->assertSame(65, News::count());
        $this->assertSame($count, News::whereNull('organization_id')->count());
    }

    public function test_admin_manages_users_but_not_self(): void
    {
        $this->withJwt($this->editor)->postJson('/api/admin/users/list')->assertForbidden();

        $this->withJwt($this->admin)->postJson('/api/admin/users/list', ['role' => 'user'])
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.email', 'korisnik@fiskultura.test');

        $this->withJwt($this->admin)->patchJson("/api/admin/users/{$this->user->id}", ['role' => 'author'])
            ->assertOk()
            ->assertJsonPath('role', 'author');

        $this->withJwt($this->admin)->patchJson("/api/admin/users/{$this->user->id}", ['blocked' => true])
            ->assertOk()
            ->assertJsonPath('blocked', true);
        $this->withJwt($this->user->fresh())->getJson('/api/auth/me')->assertUnauthorized();

        $this->withJwt($this->admin)->patchJson("/api/admin/users/{$this->admin->id}", ['role' => 'user'])->assertUnprocessable();
        $this->assertSame('admin', $this->admin->fresh()->role);
    }
}

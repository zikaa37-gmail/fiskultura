<?php

namespace Tests\Feature;

use App\Mail\UserInvitationMail;
use App\Models\News;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\User;
use Database\Seeders\ContentSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
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

    public function test_publish_time_is_set_on_publish_and_featured_goes_first_and_can_be_switched_off(): void
    {
        $draft = $this->withJwt($this->editor)->postJson('/api/admin/news', $this->newsPayload(['status' => 'draft', 'published_at' => now()->addDays(2)->toIso8601String()]))
            ->assertCreated()->assertJsonPath('published_at', null)->json();

        $this->travel(5)->minutes();
        $published = $this->withJwt($this->editor)->patchJson("/api/admin/news/{$draft['id']}", $this->newsPayload(['status' => 'published', 'featured' => true]))
            ->assertOk()->assertJsonPath('is_visible', true)->json();
        $this->assertNotNull($published['published_at']);

        $this->travel(5)->minutes();
        $this->withJwt($this->editor)->postJson('/api/admin/news', $this->newsPayload(['title' => 'Novija obična vest', 'featured' => false]))->assertCreated();

        $this->postJson('/api/news/list', [])->assertJsonPath('data.0.slug', $published['slug']);

        $this->withJwt($this->user)->patchJson("/api/admin/news/{$draft['id']}/featured", ['featured' => false])->assertForbidden();
        $this->withJwt($this->editor)->patchJson("/api/admin/news/{$draft['id']}/featured", ['featured' => false])->assertOk()->assertJsonPath('featured', false);
        $this->postJson('/api/news/list', [])->assertJsonPath('data.0.title', 'Novija obična vest');
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

        foreach ([['organization' => 'bass'], ['umbrella' => 'sspfvs'], ['year' => 2025]] as $filter) {
            $this->assertSame(
                $this->postJson('/api/news/list', $filter)->json('meta.total'),
                $this->withJwt($this->editor)->postJson('/api/admin/news/list', $filter + ['status' => 'published'])->json('meta.total'),
            );
        }
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

    public function test_promotion_to_editor_or_admin_requires_admin_password(): void
    {
        $url = "/api/admin/users/{$this->user->id}";

        $this->withJwt($this->admin)->patchJson($url, ['role' => 'editor'])
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);
        $this->withJwt($this->admin)->patchJson($url, ['role' => 'admin', 'password' => 'pogresna'])
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);
        $this->assertSame('user', $this->user->fresh()->role);

        $this->withJwt($this->admin)->patchJson($url, ['role' => 'editor', 'password' => 'lozinka123'])
            ->assertOk()->assertJsonPath('role', 'editor');

        $this->withJwt($this->admin)->patchJson($url, ['role' => 'admin'])
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);
        $this->withJwt($this->admin)->patchJson($url, ['role' => 'admin', 'password' => 'lozinka123'])
            ->assertOk()->assertJsonPath('role', 'admin');
    }

    public function test_demotion_needs_no_password(): void
    {
        $this->withJwt($this->admin)->patchJson("/api/admin/users/{$this->editor->id}", ['role' => 'user'])
            ->assertOk()->assertJsonPath('role', 'user');
    }

    public function test_only_admin_deletes_users_and_never_self(): void
    {
        $this->user->forceFill(['email_verified_at' => now()])->save();
        Subscription::ensureFor($this->user);

        $this->withJwt($this->editor)->deleteJson("/api/admin/users/{$this->user->id}")->assertForbidden();
        $this->withJwt($this->admin)->deleteJson("/api/admin/users/{$this->admin->id}")->assertUnprocessable();
        $this->assertModelExists($this->admin);

        $this->withJwt($this->admin)->deleteJson("/api/admin/users/{$this->user->id}")->assertOk();
        $this->assertModelMissing($this->user);
        $this->assertSame(0, Subscription::where('email', 'korisnik@fiskultura.test')->count());
    }

    public function test_admin_adds_user_who_gets_link_for_password(): void
    {
        Mail::fake();

        $payload = ['name' => 'Rade Test', 'email' => 'Rade@Example.com', 'role' => 'user', 'school' => 'OŠ Vuk', 'district' => 'Borski'];
        $this->withJwt($this->editor)->postJson('/api/admin/users', $payload)->assertForbidden();

        $this->withJwt($this->admin)->postJson('/api/admin/users', $payload)
            ->assertCreated()->assertJsonPath('email', 'rade@example.com')->assertJsonPath('verified', false);
        Mail::assertSent(UserInvitationMail::class, fn (UserInvitationMail $mail) => $mail->hasTo('rade@example.com') && str_contains($mail->url, '/zavrsi-registraciju?token='));

        $this->withJwt($this->admin)->postJson('/api/admin/users', $payload)->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->withJwt($this->admin)->postJson('/api/admin/users', [...$payload, 'email' => 'drugi@example.com', 'role' => 'editor'])
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);
        $this->withJwt($this->admin)->postJson('/api/admin/users', [...$payload, 'email' => 'drugi@example.com', 'role' => 'editor', 'password' => 'lozinka123'])
            ->assertCreated()->assertJsonPath('role', 'editor');
    }

    public function test_admin_adds_user_without_invitation(): void
    {
        Mail::fake();

        $this->withJwt($this->admin)->postJson('/api/admin/users', ['name' => 'Bez Poziva', 'email' => 'bez@example.com', 'role' => 'user', 'phone' => '060 3355531', 'invite' => false])
            ->assertCreated()->assertJsonPath('phone', '+381 60 3355531')->assertJsonPath('invited_at', null);
        Mail::assertNothingSent();
    }

    public function test_admin_edits_profile_and_email_follows_subscription(): void
    {
        $this->user->forceFill(['email_verified_at' => now()])->save();
        $subscription = Subscription::ensureFor($this->user);
        $url = "/api/admin/users/{$this->user->id}";

        $this->withJwt($this->editor)->patchJson($url, ['name' => 'Novo Ime'])->assertForbidden();
        $this->withJwt($this->admin)->patchJson($url, ['email' => 'urednik@fiskultura.test'])->assertUnprocessable()->assertJsonValidationErrors(['email']);

        $this->withJwt($this->admin)->patchJson($url, ['name' => 'Novo Ime', 'email' => 'Novi@Example.com', 'school' => 'OŠ Nova', 'member_status' => 'student', 'district' => null])
            ->assertOk()
            ->assertJsonPath('name', 'Novo Ime')
            ->assertJsonPath('email', 'novi@example.com')
            ->assertJsonPath('school', 'OŠ Nova')
            ->assertJsonPath('member_status', 'student')
            ->assertJsonPath('role', 'user');
        $this->assertSame('novi@example.com', $subscription->fresh()->email);
    }

    public function test_admin_invites_one_or_many_pending_users_and_they_finish_registration(): void
    {
        Mail::fake();
        $pending = User::factory()->create(['name' => 'Rade Kraljević', 'email' => 'rade@example.com', 'school' => 'OŠ Vuk', 'email_verified_at' => null]);
        $blocked = User::factory()->create(['email_verified_at' => null, 'blocked_at' => now()]);

        $this->withJwt($this->editor)->postJson('/api/admin/users/invitations', ['ids' => [$pending->id]])->assertForbidden();
        $this->withJwt($this->admin)->postJson('/api/admin/users/list', ['pending' => true])->assertOk()->assertJsonPath('data.0.email', 'rade@example.com');

        $this->withJwt($this->admin)->postJson('/api/admin/users/invitations', ['ids' => [$pending->id, $blocked->id, $this->admin->id]])
            ->assertOk()->assertJsonPath('sent', 1)->assertJsonPath('skipped', 2)->assertJsonPath('failed', 0);
        $this->assertNotNull($pending->fresh()->invited_at);

        $url = '';
        Mail::assertSent(UserInvitationMail::class, function (UserInvitationMail $mail) use (&$url) {
            $url = $mail->url;

            return $mail->hasTo('rade@example.com') && $mail->envelope()->subject === 'Rade, pozivamo vas na portal Fiskultura' && str_contains($mail->render(), 'OŠ Vuk');
        });
        $token = substr($url, strpos($url, 'token=') + 6);

        $this->postJson('/api/auth/invitation', ['token' => 'pogresan'])->assertUnprocessable();
        $this->postJson('/api/auth/invitation', ['token' => $token])->assertOk()->assertJsonPath('name', 'Rade Kraljević')->assertJsonMissingPath('password');

        $this->postJson('/api/auth/invitation/complete', ['token' => $token, 'name' => 'Rade K.', 'phone' => '060 123 4567', 'password' => 'novalozinka1', 'password_confirmation' => 'novalozinka1'])->assertOk();

        $done = $pending->fresh();
        $this->assertNotNull($done->email_verified_at);
        $this->assertSame('Rade K.', $done->name);
        $this->assertSame('+381 60 1234567', $done->phone);
        $this->assertTrue(Subscription::where('email', 'rade@example.com')->exists());
        $this->postJson('/api/auth/login', ['email' => 'rade@example.com', 'password' => 'novalozinka1'])->assertOk();
        $this->postJson('/api/auth/invitation', ['token' => $token])->assertUnprocessable();

        $this->withJwt($this->admin)->postJson('/api/admin/users/invitations', ['ids' => [$pending->id]])->assertJsonPath('sent', 0);
    }

    public function test_new_invitation_cancels_the_previous_link(): void
    {
        Mail::fake();
        $pending = User::factory()->create(['email_verified_at' => null]);
        $urls = [];

        foreach ([1, 2] as $ignored) {
            $this->withJwt($this->admin)->postJson('/api/admin/users/invitations', ['ids' => [$pending->id]])->assertJsonPath('sent', 1);
        }
        Mail::assertSent(UserInvitationMail::class, function (UserInvitationMail $mail) use (&$urls) {
            $urls[] = substr($mail->url, strpos($mail->url, 'token=') + 6);

            return true;
        });

        $this->postJson('/api/auth/invitation', ['token' => $urls[0]])->assertUnprocessable();
        $this->postJson('/api/auth/invitation', ['token' => $urls[1]])->assertOk();
    }
}

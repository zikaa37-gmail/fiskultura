<?php

namespace Tests\Feature;

use App\Models\InstagramPost;
use App\Models\SocialAccount;
use App\Models\User;
use App\Services\Instagram\InstagramPublisher;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class InstagramTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private const IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==';

    private User $admin;

    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        $this->admin = User::where('email', 'admin@fiskultura.test')->firstOrFail();
        $this->editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $this->app->instance(InstagramPublisher::class, new InstagramPublisher(0));
    }

    private function fakeInstagram(bool $publishOk = true): void
    {
        Http::fake([
            'graph.instagram.com/me*' => Http::response(['user_id' => '1784', 'username' => 'fiskultura_rs']),
            'graph.instagram.com/refresh_access_token*' => Http::response(['access_token' => 'novi-dugotrajni-token-0123456789', 'expires_in' => 5184000]),
            'graph.instagram.com/1784/media_publish' => $publishOk
                ? Http::response(['id' => 'm-99'])
                : Http::sequence()->push(['error' => ['message' => 'Media ID is not available']], 400)->push(['id' => 'm-99']),
            'graph.instagram.com/1784/media' => Http::response(['id' => 'c-1']),
            'graph.instagram.com/c-1*' => Http::response(['status_code' => 'FINISHED']),
            'graph.instagram.com/m-99*' => Http::response(['permalink' => 'https://www.instagram.com/p/abc/']),
        ]);
    }

    public function test_only_admin_connects_and_token_is_stored_encrypted(): void
    {
        $this->fakeInstagram();

        $this->withJwt($this->editor)->postJson('/api/admin/instagram/connect', ['token' => 'kratkotrajni-token-0123456789'])->assertForbidden();
        $this->withJwt($this->admin)->postJson('/api/admin/instagram/connect', ['token' => 'kratkotrajni-token-0123456789'])
            ->assertOk()->assertJsonPath('connected', true)->assertJsonPath('username', 'fiskultura_rs');

        $this->assertSame('novi-dugotrajni-token-0123456789', SocialAccount::instagram()->token);
        $this->assertStringNotContainsString('novi-dugotrajni-token', (string) DB::table('social_accounts')->value('token'));
        $this->withJwt($this->editor)->getJson('/api/admin/instagram')->assertOk()->assertJsonPath('connected', true)->assertJsonMissingPath('token');
    }

    public function test_bad_token_is_rejected(): void
    {
        Http::fake(['graph.instagram.com/*' => Http::response(['error' => ['message' => 'Invalid OAuth access token']], 400)]);

        $this->withJwt($this->admin)->postJson('/api/admin/instagram/connect', ['token' => 'pogresan-token-0123456789'])->assertUnprocessable()->assertJsonValidationErrors('token');
        $this->assertFalse(SocialAccount::instagram()->connected());
    }

    public function test_editor_publishes_post_now_with_caption_and_public_image(): void
    {
        $this->fakeInstagram();
        $this->withJwt($this->admin)->postJson('/api/admin/instagram/connect', ['token' => 'kratkotrajni-token-0123456789'])->assertOk();

        $this->withJwt($this->editor)->postJson('/api/admin/instagram/posts', ['kind' => 'post', 'caption' => 'Nova stručna debata #fiskultura', 'image' => 'data:image/png;base64,AAAA'])
            ->assertUnprocessable()->assertJsonValidationErrors('image');
        $this->withJwt($this->editor)->postJson('/api/admin/instagram/posts', ['kind' => 'post', 'caption' => 'Nova stručna debata #fiskultura', 'image' => self::IMAGE, 'source_type' => 'debate', 'source_id' => 5])
            ->assertCreated()
            ->assertJsonPath('status', InstagramPost::PUBLISHED)
            ->assertJsonPath('permalink', 'https://www.instagram.com/p/abc/');

        Http::assertSent(fn (HttpRequest $request) => str_ends_with($request->url(), '/1784/media')
            && $request['caption'] === 'Nova stručna debata #fiskultura'
            && str_contains($request['image_url'], '/api/public/instagram-media/'));
        $this->assertNull(InstagramPost::firstOrFail()->image);
    }

    public function test_failed_publish_keeps_image_and_can_be_retried(): void
    {
        $this->fakeInstagram(false);
        $this->withJwt($this->admin)->postJson('/api/admin/instagram/connect', ['token' => 'kratkotrajni-token-0123456789'])->assertOk();

        $this->withJwt($this->editor)->postJson('/api/admin/instagram/posts', ['kind' => 'story', 'image' => self::IMAGE])
            ->assertCreated()->assertJsonPath('status', InstagramPost::FAILED)->assertJsonPath('error', 'Media ID is not available');
        $post = InstagramPost::firstOrFail();
        $this->get("/api/public/instagram-media/{$post->token}.jpg")->assertOk()->assertHeader('Content-Type', 'image/jpeg');

        $this->withJwt($this->editor)->postJson("/api/admin/instagram/posts/{$post->id}/publish")->assertOk()->assertJsonPath('status', InstagramPost::PUBLISHED);
        $this->get("/api/public/instagram-media/{$post->token}.jpg")->assertNotFound();
    }

    public function test_scheduled_post_is_published_by_command(): void
    {
        $this->fakeInstagram();
        $this->withJwt($this->admin)->postJson('/api/admin/instagram/connect', ['token' => 'kratkotrajni-token-0123456789'])->assertOk();

        $this->withJwt($this->editor)->postJson('/api/admin/instagram/posts', ['kind' => 'post', 'caption' => 'Sutra', 'image' => self::IMAGE, 'scheduled_at' => now()->addHour()->toIso8601String()])
            ->assertCreated()->assertJsonPath('status', InstagramPost::SCHEDULED);

        $this->artisan('instagram:publish-scheduled')->expectsOutput('Instagram: objavljeno zakazanih 0.');
        $this->travel(61)->minutes();
        $this->artisan('instagram:publish-scheduled')->expectsOutput('Instagram: objavljeno zakazanih 1.');
        $this->assertSame(InstagramPost::PUBLISHED, InstagramPost::firstOrFail()->status);
    }

    public function test_publishing_requires_connected_account_and_members_have_no_access(): void
    {
        $member = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();

        $this->withJwt($member)->getJson('/api/admin/instagram/posts')->assertForbidden();
        $this->withJwt($this->editor)->postJson('/api/admin/instagram/posts', ['kind' => 'post', 'image' => self::IMAGE])->assertUnprocessable();
    }

    public function test_same_post_goes_to_instagram_and_facebook_page(): void
    {
        $this->fakeInstagram();
        Http::fake([
            'graph.facebook.com/1234567/photos' => Http::response(['id' => 'ph-1', 'post_id' => '1234567_888']),
            'graph.facebook.com/1234567_888*' => Http::response(['permalink_url' => 'https://www.facebook.com/fiskultura/posts/888']),
            'graph.facebook.com/1234567*' => Http::response(['id' => '1234567', 'name' => 'Fiskultura RS', 'access_token' => 'token-stranice-0123456789']),
        ]);
        $this->withJwt($this->admin)->postJson('/api/admin/instagram/connect', ['token' => 'kratkotrajni-token-0123456789'])->assertOk();
        $this->withJwt($this->editor)->postJson('/api/admin/facebook/connect', ['page_id' => '1234567', 'token' => 'sistemski-token-0123456789'])->assertForbidden();
        $this->withJwt($this->admin)->postJson('/api/admin/facebook/connect', ['page_id' => '1234567', 'token' => 'sistemski-token-0123456789'])
            ->assertOk()->assertJsonPath('connected', true)->assertJsonPath('username', 'Fiskultura RS');
        $this->assertSame('token-stranice-0123456789', SocialAccount::facebook()->token);

        $this->withJwt($this->editor)->postJson('/api/admin/instagram/posts', ['kind' => 'story', 'image' => self::IMAGE, 'networks' => ['instagram', 'facebook']])->assertUnprocessable();
        $this->withJwt($this->editor)->postJson('/api/admin/instagram/posts', ['kind' => 'post', 'caption' => 'Zajedno', 'image' => self::IMAGE, 'networks' => ['instagram', 'facebook']])
            ->assertCreated()
            ->assertJsonPath('status', InstagramPost::PUBLISHED)
            ->assertJsonPath('facebook_status', InstagramPost::PUBLISHED)
            ->assertJsonPath('facebook_permalink', 'https://www.facebook.com/fiskultura/posts/888');

        Http::assertSent(fn (HttpRequest $request) => str_ends_with($request->url(), '/1234567/photos')
            && $request['caption'] === 'Zajedno' && $request['access_token'] === 'token-stranice-0123456789');
    }

    public function test_facebook_failure_is_retried_without_posting_to_instagram_again(): void
    {
        $this->fakeInstagram();
        Http::fake([
            'graph.facebook.com/1234567/photos' => Http::sequence()->push(['error' => ['message' => 'Nema dozvole']], 403)->push(['id' => 'ph-1', 'post_id' => '1234567_888']),
            'graph.facebook.com/1234567_888*' => Http::response(['permalink_url' => 'https://www.facebook.com/p/888']),
            'graph.facebook.com/1234567*' => Http::response(['id' => '1234567', 'name' => 'Fiskultura RS']),
        ]);
        $this->withJwt($this->admin)->postJson('/api/admin/instagram/connect', ['token' => 'kratkotrajni-token-0123456789'])->assertOk();
        $this->withJwt($this->admin)->postJson('/api/admin/facebook/connect', ['page_id' => '1234567', 'token' => 'token-stranice-0123456789'])->assertOk();

        $this->withJwt($this->editor)->postJson('/api/admin/instagram/posts', ['kind' => 'post', 'image' => self::IMAGE, 'networks' => ['instagram', 'facebook']])
            ->assertCreated()->assertJsonPath('status', InstagramPost::FAILED)->assertJsonPath('facebook_error', 'Nema dozvole')->assertJsonPath('error', null);
        $post = InstagramPost::firstOrFail();
        $this->assertSame('m-99', $post->media_id);

        $this->withJwt($this->editor)->postJson("/api/admin/instagram/posts/{$post->id}/publish")->assertOk()->assertJsonPath('status', InstagramPost::PUBLISHED);
        $this->assertCount(1, Http::recorded(fn (HttpRequest $request) => str_ends_with($request->url(), '/1784/media_publish')));
    }

    public function test_oauth_connects_instagram_and_facebook_page(): void
    {
        config([
            'social.instagram.app_id' => 'ig-app', 'social.instagram.app_secret' => 'ig-secret',
            'social.facebook.app_id' => 'fb-app', 'social.facebook.app_secret' => 'fb-secret', 'social.facebook.page_id' => '61596639594353',
            'app.frontend_url' => 'https://fiskultura.rs',
        ]);
        $this->fakeInstagram();
        Http::fake([
            'api.instagram.com/oauth/access_token' => Http::response(['access_token' => 'kratki-ig-token-0123456789']),
            'graph.instagram.com/access_token*' => Http::response(['access_token' => 'dugi-ig-token-0123456789', 'expires_in' => 5184000]),
            'graph.facebook.com/v23.0/oauth/access_token*' => Http::response(['access_token' => 'fb-korisnik-token-0123456789']),
            'graph.facebook.com/61596639594353/photos' => Http::response(['id' => 'ph-2', 'post_id' => '61596639594353_9']),
            'graph.facebook.com/61596639594353_9*' => Http::response(['permalink_url' => 'https://www.facebook.com/p/9']),
            'graph.facebook.com/61596639594353*' => Http::response(['id' => '61596639594353', 'name' => 'Fiskultura RS', 'access_token' => 'stranica-token-0123456789', 'instagram_business_account' => ['id' => '1784', 'username' => 'fiskultura_rs']]),
            'graph.facebook.com/1784/media_publish' => Http::response(['id' => 'm-fb']),
            'graph.facebook.com/1784/media' => Http::response(['id' => 'c-fb']),
            'graph.facebook.com/c-fb*' => Http::response(['status_code' => 'FINISHED']),
            'graph.facebook.com/m-fb*' => Http::response(['permalink' => 'https://www.instagram.com/p/fb/']),
            'graph.facebook.com/v23.0/me/accounts*' => Http::response(['data' => [
                ['id' => '111', 'name' => 'Druga', 'access_token' => 'druga-0123456789'],
                ['id' => '61596639594353', 'name' => 'Fiskultura RS', 'access_token' => 'stranica-token-0123456789'],
            ]]),
        ]);

        $this->withJwt($this->editor)->postJson('/api/admin/social/instagram/authorize')->assertForbidden();
        $state = $this->withJwt($this->admin)->getJson('/api/admin/instagram')->assertOk()
            ->assertJsonPath('oauth.instagram', true)->assertJsonPath('facebook.page_id', '61596639594353');

        foreach (['instagram', 'facebook'] as $network) {
            $url = $this->withJwt($this->admin)->postJson("/api/admin/social/{$network}/authorize")->assertOk()->json('url');
            parse_str((string) parse_url($url, PHP_URL_QUERY), $query);
            $this->assertStringEndsWith("/api/public/social/{$network}/callback", $query['redirect_uri']);
            $this->get("/api/public/social/{$network}/callback?code=abc&state=".urlencode($query['state']))
                ->assertRedirect("https://fiskultura.rs/admin/drustvene-mreze?povezano={$network}");
        }

        Http::assertSent(fn (HttpRequest $request) => str_contains($request->url(), 'refresh_access_token') && str_contains($request->url(), 'dugi-ig-token'));
        $this->assertSame('stranica-token-0123456789', SocialAccount::facebook()->token);
        $this->assertSame('Fiskultura RS', SocialAccount::facebook()->username);
        $instagram = SocialAccount::instagram();
        $this->assertTrue($instagram->viaFacebook());
        $this->assertSame(['1784', 'fiskultura_rs', 'stranica-token-0123456789'], [$instagram->external_id, $instagram->username, $instagram->token]);

        $this->withJwt($this->editor)->postJson('/api/admin/instagram/posts', ['kind' => 'post', 'caption' => 'Jedan token', 'image' => self::IMAGE, 'networks' => ['instagram', 'facebook']])
            ->assertCreated()->assertJsonPath('status', InstagramPost::PUBLISHED)->assertJsonPath('permalink', 'https://www.instagram.com/p/fb/');
        Http::assertSent(fn (HttpRequest $request) => $request->url() === 'https://graph.facebook.com/1784/media' && $request['access_token'] === 'stranica-token-0123456789');
        $this->get('/api/public/social/facebook/callback?code=abc&state=los')->assertRedirectContains('greska=');
    }
}

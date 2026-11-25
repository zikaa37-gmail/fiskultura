<?php

namespace Tests\Feature;

use App\Mail\NewsSuggestionMail;
use App\Models\News;
use App\Models\NewsSuggestion;
use App\Models\Organization;
use App\Models\OrganizationSource;
use App\Models\User;
use App\Models\UserNotification;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class NewsSuggestionTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        $this->editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        Mail::fake();
    }

    private function organization(array $overrides = []): Organization
    {
        return Organization::create([
            'slug' => 'upfk-test',
            'name' => 'UPFK Test',
            'short_name' => 'UPFK Test',
            'type' => 'strukovno-udruzenje',
            'level' => 'gradski',
            'status' => 'aktivno',
            'website' => 'https://upfk.example.org',
            'social' => [
                'facebook' => 'https://www.facebook.com/upfktest',
                'youtube' => 'https://www.youtube.com/channel/UCw-5HTUSgzClOw4VbnrRUnQ',
            ],
            ...$overrides,
        ]);
    }

    private function rss(array $items): string
    {
        $xml = '';
        foreach ($items as [$title, $link, $date]) {
            $xml .= "<item><title>{$title}</title><link>{$link}</link><pubDate>{$date}</pubDate><description><![CDATA[<p>Opis &amp; <b>detalji</b> objave.</p>]]></description></item>";
        }

        return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>UPFK</title>'.$xml.'</channel></rss>';
    }

    public function test_check_discovers_feed_and_queues_only_new_recent_items(): void
    {
        $recent = now()->subDays(3)->toRfc2822String();
        $old = now()->subDays(200)->toRfc2822String();
        Http::fake([
            'upfk.example.org/robots.txt' => Http::response("User-agent: *\nDisallow: /wp-admin/\n"),
            'upfk.example.org/feed/' => Http::response($this->rss([
                ['Seminar o igrama', 'https://upfk.example.org/seminar-o-igrama/', $recent],
                ['Stara vest', 'https://upfk.example.org/stara/', $old],
                ['Već objavljeno', 'https://www.upfk.example.org/vec-objavljeno', $recent],
            ])),
            'upfk.example.org*' => Http::response('<html><head><link rel="alternate" type="application/rss+xml" href="/feed/"></head></html>'),
        ]);
        $organization = $this->organization();
        News::create(['slug' => 'vec', 'title' => 'Već', 'summary' => 'x', 'category' => 'vest', 'status' => News::DRAFT, 'source_url' => 'https://upfk.example.org/vec-objavljeno/']);

        $this->artisan('sources:check')->assertSuccessful();

        $sources = OrganizationSource::where('organization_id', $organization->id)->get()->keyBy('type');
        $this->assertCount(3, $sources);
        $this->assertSame(OrganizationSource::MANUAL, $sources['facebook']->mode);
        $this->assertSame(OrganizationSource::MANUAL, $sources['youtube']->mode);
        $this->assertSame('https://upfk.example.org/feed/', $sources['sajt']->feed_url);
        $this->assertSame('ok', $sources['sajt']->last_status);
        $this->assertSame(['Seminar o igrama'], NewsSuggestion::pluck('title')->all());
        $this->assertSame('Opis & detalji objave.', NewsSuggestion::where('title', 'Seminar o igrama')->value('excerpt'));
        $this->assertTrue(UserNotification::where('user_id', $this->editor->id)->where('kind', 'news_suggestion')->exists());

        $this->artisan('sources:check')->assertSuccessful();
        $this->assertSame(1, NewsSuggestion::count());
        $this->assertSame(3, OrganizationSource::count());
    }

    public function test_robots_disallow_and_missing_feed_are_recorded(): void
    {
        Http::fake([
            'upfk.example.org/robots.txt' => Http::response("User-agent: *\nDisallow: /feed\n"),
            'upfk.example.org/feed/' => Http::response($this->rss([['Vest', 'https://upfk.example.org/vest', now()->toRfc2822String()]])),
            'upfk.example.org*' => Http::response('<html></html>'),
            'drugi.example.org/feed/' => Http::response('', 404),
            'drugi.example.org*' => Http::response('<html>bez fida</html>'),
        ]);
        $this->organization(['social' => []]);
        $this->organization(['slug' => 'drugi', 'name' => 'Drugi', 'website' => 'https://drugi.example.org', 'social' => []]);

        $this->artisan('sources:check')->assertSuccessful();

        $this->assertSame(['https://drugi.example.org' => 'no_feed', 'https://upfk.example.org' => 'blocked'], OrganizationSource::orderBy('url')->pluck('last_status', 'url')->all());
        $this->assertSame(0, NewsSuggestion::count());
    }

    public function test_public_form_validates_and_notifies_editors(): void
    {
        $this->postJson('/api/news-suggestions', ['sender_name' => 'Ana', 'sender_email' => 'ana@example.com', 'title' => 'Kros u Kraljevu'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['sender_organization', 'excerpt']);
        $this->postJson('/api/news-suggestions', ['sender_name' => 'Ana', 'sender_email' => 'ana@example.com', 'sender_organization' => 'DPFK Kraljevo', 'title' => 'Kros u Kraljevu', 'excerpt' => 'Opis', 'website' => 'bot'])
            ->assertUnprocessable();

        $payload = ['sender_name' => 'Ana', 'sender_email' => 'Ana@Example.com', 'sender_organization' => 'DPFK Kraljevo', 'title' => 'Kros u Kraljevu', 'url' => 'https://dpfk.example.org/kros'];
        $this->postJson('/api/news-suggestions', $payload)->assertCreated();
        $this->postJson('/api/news-suggestions', $payload)->assertOk();

        $this->assertSame(1, NewsSuggestion::count());
        $this->assertSame('ana@example.com', NewsSuggestion::value('sender_email'));
        Mail::assertSent(NewsSuggestionMail::class, fn (NewsSuggestionMail $mail) => $mail->hasTo($this->editor->email) && $mail->hasReplyTo('ana@example.com'));
        $this->assertTrue(UserNotification::where('user_id', $this->editor->id)->where('kind', 'news_suggestion')->exists());
    }

    public function test_editor_turns_suggestion_into_draft_or_dismisses_it(): void
    {
        $organization = $this->organization();
        $suggestion = NewsSuggestion::create(['organization_id' => $organization->id, 'origin' => NewsSuggestion::FEED, 'title' => 'Seminar o igrama', 'url' => 'https://upfk.example.org/seminar', 'url_hash' => NewsSuggestion::hashUrl('https://upfk.example.org/seminar'), 'published_on' => '2026-11-20']);
        $other = NewsSuggestion::create(['origin' => NewsSuggestion::FORM, 'title' => 'Kros', 'excerpt' => 'Opis', 'sender_name' => 'Ana', 'sender_email' => 'ana@example.com', 'sender_organization' => 'DPFK']);
        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();

        $this->withJwt($user)->postJson('/api/admin/news-suggestions/list')->assertForbidden();
        $this->withJwt($this->editor)->postJson('/api/admin/news-suggestions/list')
            ->assertOk()
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('data.0.sender.email', 'ana@example.com')
            ->assertJsonPath('data.1.title', 'Seminar o igrama');

        $newsId = $this->withJwt($this->editor)->postJson("/api/admin/news-suggestions/{$suggestion->id}/accept")->assertCreated()->json('news_id');
        $news = News::findOrFail($newsId);
        $this->assertSame(News::DRAFT, $news->status);
        $this->assertSame($organization->id, $news->organization_id);
        $this->assertSame('sajt', $news->source_type);
        $this->assertSame('2026-11-20', $news->source_published_at->toDateString());
        $this->assertSame(NewsSuggestion::ACCEPTED, $suggestion->fresh()->status);
        $this->withJwt($this->editor)->postJson("/api/admin/news-suggestions/{$suggestion->id}/accept")->assertOk()->assertJsonPath('news_id', $newsId);

        $this->withJwt($this->editor)->patchJson("/api/admin/news-suggestions/{$other->id}", ['status' => 'dismissed'])->assertOk()->assertJsonPath('status', 'dismissed');
        $this->withJwt($this->editor)->postJson('/api/admin/news-suggestions/list')->assertJsonPath('meta.total', 0)->assertJsonPath('counts.accepted', 1);
        $this->withJwt($this->editor)->postJson('/api/admin/news-suggestions/list', ['status' => 'dismissed'])->assertJsonPath('data.0.title', 'Kros');
        $this->withJwt($this->editor)->patchJson("/api/admin/news-suggestions/{$other->id}", ['status' => 'new'])->assertOk()->assertJsonPath('reviewer', null);
    }

    public function test_editor_manages_sources(): void
    {
        $organization = $this->organization(['social' => []]);
        $payload = ['organization_id' => $organization->id, 'type' => 'facebook', 'url' => 'https://www.facebook.com/upfktest', 'mode' => 'auto'];

        $this->withJwt($this->editor)->postJson('/api/admin/sources', $payload)->assertUnprocessable()->assertJsonValidationErrors('mode');
        $id = $this->withJwt($this->editor)->postJson('/api/admin/sources', [...$payload, 'mode' => 'manual'])->assertCreated()->json('id');
        $this->withJwt($this->editor)->postJson('/api/admin/sources', [...$payload, 'mode' => 'manual'])->assertUnprocessable()->assertJsonValidationErrors('url');
        $this->withJwt($this->editor)->patchJson("/api/admin/sources/{$id}", ['organization_id' => $organization->id, 'type' => 'youtube', 'url' => 'https://www.youtube.com/channel/UCw-5HTUSgzClOw4VbnrRUnQ', 'mode' => 'auto'])
            ->assertOk()
            ->assertJsonPath('type', 'youtube');
        $this->withJwt($this->editor)->getJson('/api/admin/sources')->assertOk()->assertJsonCount(1)->assertJsonPath('0.organization.slug', 'upfk-test');
        $this->withJwt($this->editor)->deleteJson("/api/admin/sources/{$id}")->assertOk();
        $this->assertSame(0, OrganizationSource::count());
    }
}

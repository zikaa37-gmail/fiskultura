<?php

namespace Tests\Feature;

use App\Mail\NoticeMail;
use App\Mail\SubscriptionMail;
use App\Models\News;
use App\Models\NotificationLog;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Notifications\NewsNotifier;
use Database\Seeders\ContentSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([UserSeeder::class, ContentSeeder::class]);
        News::query()->update(['notified_at' => now()]);
        Subscription::query()->delete();
        Mail::fake();
    }

    private function subscribe(array $overrides = []): void
    {
        $this->postJson('/api/subscriptions', [
            'email' => 'Nastavnik@Primer.rs', 'frequency' => Subscription::WEEKLY, 'categories' => [], 'organization_ids' => [], ...$overrides,
        ])->assertOk();
    }

    private function active(array $attributes = []): Subscription
    {
        $subscription = Subscription::create(['email' => 'pratilac@primer.rs', 'frequency' => Subscription::INSTANT, ...$attributes]);
        $subscription->forceFill(['confirmed_at' => now()->subWeeks(2), 'last_digest_at' => now()->subWeeks(2)])->save();

        return $subscription;
    }

    private function news(array $attributes = []): News
    {
        return News::create([
            'slug' => 'vest-'.uniqid(), 'title' => 'Seminar o igrama', 'summary' => 'Kratko.', 'category' => 'seminar',
            'status' => News::PUBLISHED, 'published_at' => now()->subHour(), 'featured' => true, ...$attributes,
        ]);
    }

    public function test_double_opt_in_confirms_and_does_not_reveal_existing_address(): void
    {
        $this->subscribe(['categories' => ['seminar']]);

        $subscription = Subscription::firstOrFail();
        $this->assertSame('nastavnik@primer.rs', $subscription->email);
        $this->assertFalse($subscription->isActive());
        Mail::assertSent(SubscriptionMail::class, fn (SubscriptionMail $mail) => $mail->purpose === Subscription::CONFIRM);

        $this->postJson('/api/subscriptions/confirm', ['id' => $subscription->id, 'token' => 'pogresan'])->assertNotFound();
        $this->postJson('/api/subscriptions/confirm', ['id' => $subscription->id, 'token' => $subscription->token(Subscription::CONFIRM)])
            ->assertOk()->assertJsonPath('active', true)->assertJsonPath('manage_token', $subscription->token(Subscription::MANAGE));

        $this->travel(10)->minutes();
        $this->subscribe(['categories' => ['vest']]);
        $this->assertSame(['seminar'], $subscription->fresh()->categories);
        Mail::assertSent(SubscriptionMail::class, fn (SubscriptionMail $mail) => $mail->purpose === Subscription::MANAGE);
    }

    public function test_manage_and_one_click_unsubscribe_with_token(): void
    {
        $subscription = $this->active();
        $organization = Organization::firstOrFail();
        $manage = ['id' => $subscription->id, 'token' => $subscription->token(Subscription::MANAGE)];

        $this->postJson('/api/subscriptions/manage', $manage)->assertOk()->assertJsonPath('email', 'pratilac@primer.rs');
        $this->patchJson('/api/subscriptions/manage', [...$manage, 'frequency' => 'weekly', 'categories' => ['takmicenje'], 'organization_ids' => [$organization->id], 'active' => true])
            ->assertOk()->assertJsonPath('frequency', 'weekly')->assertJsonPath('organization_ids.0', $organization->id);
        $this->patchJson('/api/subscriptions/manage', [...$manage, 'frequency' => 'nekad', 'categories' => [], 'organization_ids' => [], 'active' => true])
            ->assertUnprocessable();

        $this->post("/api/subscriptions/unsubscribe?id={$subscription->id}&token={$subscription->token(Subscription::UNSUBSCRIBE)}")
            ->assertOk()->assertJsonPath('active', false);
        $this->assertNotNull($subscription->fresh()->unsubscribed_at);
        $this->postJson('/api/subscriptions/unsubscribe', ['id' => $subscription->id, 'token' => $subscription->token(Subscription::MANAGE)])->assertNotFound();
    }

    public function test_logged_in_user_manages_own_subscription_without_confirmation_mail(): void
    {
        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();

        $this->withJwt($user)->getJson('/api/me/subscription')->assertOk()->assertJsonPath('active', false);
        $this->withJwt($user)->putJson('/api/me/subscription', ['frequency' => 'instant', 'categories' => ['konkurs'], 'organization_ids' => [], 'active' => true])
            ->assertOk()->assertJsonPath('active', true);
        $this->assertSame($user->id, Subscription::firstOrFail()->user_id);
        Mail::assertNothingSent();

        $this->withJwt($user)->putJson('/api/me/subscription', ['frequency' => 'instant', 'categories' => [], 'organization_ids' => [], 'active' => false])
            ->assertOk()->assertJsonPath('active', false);
        $this->assertNotNull(Subscription::firstOrFail()->unsubscribed_at);
    }

    public function test_every_published_news_goes_once_to_matching_instant_subscribers(): void
    {
        $news = $this->news();
        $matching = $this->active(['categories' => ['seminar']]);
        $this->active(['email' => 'drugi@primer.rs', 'categories' => ['takmicenje']]);
        $this->active(['email' => 'nedeljno@primer.rs', 'frequency' => Subscription::WEEKLY]);
        Subscription::create(['email' => 'nepotvrdjen@primer.rs', 'frequency' => Subscription::INSTANT]);
        $this->news(['featured' => false]);
        $this->news(['published_at' => now()->addDay()]);

        $this->artisan('notifications:send')->assertSuccessful();
        $this->artisan('notifications:send')->assertSuccessful();

        $this->assertSame(2, Mail::sent(NoticeMail::class, fn (NoticeMail $mail) => $mail->notice->kind === Subscription::INSTANT)->count());
        Mail::assertSent(NoticeMail::class, fn (NoticeMail $mail) => $mail->hasTo($matching->email)
            && str_contains($mail->notice->subject, 'Seminar o igrama')
            && str_contains($mail->notice->unsubscribeUrl, 'obavestenja/odjava'));
        $this->assertNotNull($news->fresh()->notified_at);
    }

    public function test_verified_account_gets_instant_notifications_for_everything_by_default(): void
    {
        $user = User::factory()->unverified()->create(['email' => 'Nova@Skola.rs']);
        $this->assertSame(0, Subscription::count());

        $user->forceFill(['email_verified_at' => now()])->save();

        $subscription = Subscription::firstOrFail();
        $this->assertSame(['nova@skola.rs', $user->id, Subscription::INSTANT, [], []], [$subscription->email, $subscription->user_id, $subscription->frequency, $subscription->categories, $subscription->organization_ids]);
        $this->assertTrue($subscription->isActive());

        $subscription->forceFill(['unsubscribed_at' => now(), 'frequency' => Subscription::WEEKLY])->save();
        $user->forceFill(['email_verified_at' => now()->addMinute()])->save();
        $this->assertFalse($subscription->fresh()->isActive());
        $this->assertSame(Subscription::WEEKLY, $subscription->fresh()->frequency);
    }

    public function test_hourly_limit_leaves_the_rest_for_the_next_run(): void
    {
        config(['notifications.hourly_limit' => 2]);
        $news = $this->news();
        foreach (range(1, 3) as $i) {
            $this->active(['email' => "p{$i}@primer.rs"]);
        }

        $this->artisan('notifications:send')->expectsOutputToContain('limit')->assertSuccessful();
        Mail::assertSent(NoticeMail::class, 2);
        $this->assertNull($news->fresh()->notified_at);

        $this->travel(61)->minutes();
        $this->artisan('notifications:send')->assertSuccessful();
        Mail::assertSent(NoticeMail::class, 3);
        $this->assertNotNull($news->fresh()->notified_at);
    }

    public function test_weekly_digest_on_monday_with_followed_news_only(): void
    {
        $monday = Carbon::parse('2026-11-09 07:05:00');
        $this->travelTo($monday->copy()->subDays(3));
        $this->news(['title' => 'Takmičenje u krosu', 'category' => 'takmicenje', 'featured' => false]);
        $this->news(['title' => 'Konkurs za školu', 'category' => 'konkurs', 'featured' => false]);
        $weekly = $this->active(['frequency' => Subscription::WEEKLY, 'categories' => ['takmicenje']]);
        $empty = $this->active(['email' => 'prazno@primer.rs', 'frequency' => Subscription::WEEKLY, 'categories' => ['propis']]);

        $this->travelTo($monday->copy()->subHours(2));
        $this->artisan('notifications:send')->assertSuccessful();
        Mail::assertNotSent(NoticeMail::class);

        $this->travelTo($monday);
        $this->artisan('notifications:send')->assertSuccessful();
        $this->artisan('notifications:send')->assertSuccessful();

        Mail::assertSent(NoticeMail::class, 1);
        Mail::assertSent(NoticeMail::class, fn (NoticeMail $mail) => $mail->hasTo($weekly->email)
            && count($mail->notice->items) === 1 && $mail->notice->items[0]['title'] === 'Takmičenje u krosu');
        $this->assertTrue($empty->fresh()->last_digest_at->equalTo($monday));
        $this->assertSame(1, NotificationLog::where('kind', 'weekly')->count());
    }

    public function test_admin_sees_counts_and_user_cannot(): void
    {
        $this->active();
        $this->active(['email' => 'odjavljen@primer.rs'])->forceFill(['unsubscribed_at' => now()])->save();
        app(NewsNotifier::class)->record(Subscription::first(), Subscription::INSTANT);

        $admin = User::where('email', 'admin@fiskultura.test')->firstOrFail();
        $this->withJwt($admin)->getJson('/api/admin/subscriptions/stats')->assertOk()
            ->assertJsonPath('active', 1)->assertJsonPath('instant', 1)->assertJsonPath('unsubscribed', 1)->assertJsonPath('sent_7d', 1);

        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $this->withJwt(User::where('email', 'urednik@fiskultura.test')->firstOrFail())->getJson('/api/admin/subscriptions/stats')->assertForbidden();
        $this->withJwt($user)->getJson('/api/admin/subscriptions/stats')->assertForbidden();
    }
}

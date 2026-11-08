<?php

namespace Tests\Feature;

use App\Models\RefreshToken;
use App\Models\Subscription;
use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class MembershipTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
    }

    private function member(array $attributes = []): User
    {
        return User::factory()->create([
            'role' => User::USER,
            'email_verified_at' => now(),
            ...$attributes,
        ]);
    }

    public function test_registration_keeps_status_and_valid_source_only(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/register', [
            'name' => 'Student Niš',
            'email' => 'student@fsfv.rs',
            'password' => 'tajna-lozinka',
            'password_confirmation' => 'tajna-lozinka',
            'member_status' => 'student',
            'source' => 'fsfv-nis',
        ])->assertCreated();

        $this->postJson('/api/auth/register', [
            'name' => 'Drugi',
            'email' => 'drugi@skola.rs',
            'password' => 'tajna-lozinka',
            'password_confirmation' => 'tajna-lozinka',
            'source' => '<script>',
        ])->assertCreated();

        $this->assertSame('student', User::where('email', 'student@fsfv.rs')->value('member_status'));
        $this->assertSame('fsfv-nis', User::where('email', 'student@fsfv.rs')->value('source'));
        $this->assertNull(User::where('email', 'drugi@skola.rs')->value('source'));

        $this->postJson('/api/auth/register', [
            'name' => 'Treći',
            'email' => 'treci@skola.rs',
            'password' => 'tajna-lozinka',
            'password_confirmation' => 'tajna-lozinka',
            'member_status' => 'trener',
        ])->assertUnprocessable()->assertJsonValidationErrors('member_status');
    }

    public function test_profile_saves_status_and_consents(): void
    {
        $user = $this->member();

        $this->withJwt($user)->patchJson('/api/auth/me', [
            'name' => $user->name,
            'member_status' => 'nastavnik-os',
            'directory_consent' => true,
            'surveys_consent' => true,
        ])->assertOk()
            ->assertJsonPath('member_status', 'nastavnik-os')
            ->assertJsonPath('directory_consent', true)
            ->assertJsonPath('surveys_consent', true);

        $first = $user->fresh()->directory_consent_at;
        $this->assertNotNull($first);

        $this->withJwt($user)->patchJson('/api/auth/me', ['name' => $user->name, 'directory_consent' => true])->assertOk();
        $this->assertEquals($first, $user->fresh()->directory_consent_at);

        $this->withJwt($user)->patchJson('/api/auth/me', ['name' => $user->name, 'directory_consent' => false])
            ->assertOk()
            ->assertJsonPath('directory_consent', false)
            ->assertJsonPath('surveys_consent', true);
    }

    public function test_directory_shows_only_consenting_members_to_consenting_members(): void
    {
        $viewer = $this->member(['name' => 'Ana', 'district' => 'Zlatiborski']);
        $listed = $this->member(['name' => 'Bojan', 'member_status' => 'nastavnik-ss', 'district' => 'Beogradski', 'directory_consent_at' => now()]);
        $this->member(['name' => 'Ceca']);
        $this->member(['name' => 'Dragan', 'directory_consent_at' => now(), 'blocked_at' => now()]);
        $this->member(['name' => 'Ema', 'directory_consent_at' => now(), 'email_verified_at' => null]);

        $this->withJwt($viewer)->getJson('/api/members')->assertForbidden()->assertJsonPath('code', 'directory_consent_required');

        $viewer->forceFill(['directory_consent_at' => now()])->save();

        $response = $this->withJwt($viewer)->getJson('/api/members')->assertOk();
        $this->assertSame(['Ana', 'Bojan'], collect($response->json('data'))->pluck('name')->all());
        $response->assertJsonMissingPath('data.0.email');

        $this->withJwt($viewer)->getJson('/api/members?district=Beogradski')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $listed->id);

        $this->withoutToken()->getJson('/api/members')->assertUnauthorized();
    }

    public function test_logout_all_revokes_every_refresh_token(): void
    {
        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();

        $first = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => UserSeeder::DEV_PASSWORD])->json('refresh_token');
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => UserSeeder::DEV_PASSWORD]);

        $this->withJwt($user)->postJson('/api/auth/logout-all')->assertOk();

        $this->assertSame(0, RefreshToken::where('user_id', $user->id)->whereNull('revoked_at')->count());
        $this->postJson('/api/auth/refresh', ['refresh_token' => $first])->assertUnprocessable();
    }

    public function test_refresh_marks_member_active(): void
    {
        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $token = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => UserSeeder::DEV_PASSWORD])->json('refresh_token');
        $user->forceFill(['last_active_at' => now()->subYear()])->save();

        $this->postJson('/api/auth/refresh', ['refresh_token' => $token])->assertOk();

        $this->assertTrue($user->fresh()->last_active_at->isToday());
    }

    public function test_export_and_delete_own_account(): void
    {
        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        Subscription::create(['email' => $user->email, 'user_id' => $user->id, 'frequency' => 'weekly']);

        $this->withJwt($user)->getJson('/api/me/export')
            ->assertOk()
            ->assertJsonPath('account.email', $user->email)
            ->assertJsonPath('subscription.frequency', 'weekly')
            ->assertJsonStructure(['exported_at', 'account', 'subscription', 'questions']);

        $this->withJwt($user)->deleteJson('/api/auth/me', ['password' => 'pogresna'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');

        $this->withJwt($user)->deleteJson('/api/auth/me', ['password' => UserSeeder::DEV_PASSWORD])->assertOk();

        $this->assertNull(User::find($user->id));
        $this->assertSame(0, Subscription::where('email', $user->email)->count());
    }

    public function test_last_admin_cannot_delete_account(): void
    {
        $admin = User::where('email', 'admin@fiskultura.test')->firstOrFail();

        $this->withJwt($admin)->deleteJson('/api/auth/me', ['password' => UserSeeder::DEV_PASSWORD])
            ->assertUnprocessable();
        $this->assertNotNull(User::find($admin->id));
    }

    public function test_member_stats_for_editors(): void
    {
        $this->member(['member_status' => 'student', 'source' => 'fsfv-bg', 'directory_consent_at' => now()]);
        $this->member(['member_status' => 'student', 'source' => 'fsfv-bg']);
        $this->member(['member_status' => 'nastavnik-os']);

        $editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $response = $this->withJwt($editor)->getJson('/api/admin/members/stats')->assertOk();

        $this->assertSame(1, $response->json('in_directory'));
        $this->assertContains(['value' => 'fsfv-bg', 'total' => 2], $response->json('by_source'));
        $this->assertContains(['value' => 'student', 'total' => 2], $response->json('by_status'));

        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $this->withJwt($user)->getJson('/api/admin/members/stats')->assertForbidden();
    }
}

<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureRole;
use App\Mail\AccountVerificationMail;
use App\Mail\PasswordResetMail;
use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
    }

    public function test_login_returns_tokens_and_user(): void
    {
        $this->postJson('/api/auth/login', ['email' => 'admin@fiskultura.test', 'password' => UserSeeder::DEV_PASSWORD])
            ->assertOk()
            ->assertJsonStructure(['access_token', 'refresh_token', 'user' => ['id', 'name', 'email', 'role', 'school', 'municipality', 'district']])
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonMissingPath('user.password');
    }

    public function test_login_rejects_wrong_password(): void
    {
        $this->postJson('/api/auth/login', ['email' => 'admin@fiskultura.test', 'password' => 'pogresna'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_registration_sends_verification_and_blocks_login_until_verified(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/register', [
            'name' => 'Nova Koleginica',
            'email' => 'Nova@Skola.rs',
            'password' => 'tajna-lozinka',
            'password_confirmation' => 'tajna-lozinka',
            'municipality' => 'Čačak',
        ])->assertCreated();

        $user = User::where('email', 'nova@skola.rs')->firstOrFail();
        $this->assertSame(User::USER, $user->role);
        $this->assertNull($user->email_verified_at);

        $this->postJson('/api/auth/login', ['email' => 'nova@skola.rs', 'password' => 'tajna-lozinka'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $token = null;
        Mail::assertSent(AccountVerificationMail::class, function (AccountVerificationMail $mail) use (&$token) {
            parse_str((string) parse_url($mail->url, PHP_URL_QUERY), $query);
            $token = $query['token'];

            return $mail->hasTo('nova@skola.rs') && str_starts_with($mail->url, 'http://localhost:5190/potvrda-naloga?token=');
        });

        $this->postJson('/api/auth/verify-email', ['token' => $token])
            ->assertOk()
            ->assertJsonPath('user.email', 'nova@skola.rs');

        $this->assertNotNull($user->fresh()->email_verified_at);

        $this->postJson('/api/auth/verify-email', ['token' => $token])->assertUnprocessable();

        $this->postJson('/api/auth/login', ['email' => 'nova@skola.rs', 'password' => 'tajna-lozinka'])->assertOk();
    }

    public function test_registration_ignores_requested_role(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/register', [
            'name' => 'Neko',
            'email' => 'neko@skola.rs',
            'password' => 'tajna-lozinka',
            'password_confirmation' => 'tajna-lozinka',
            'role' => 'admin',
        ])->assertCreated();

        $this->assertSame(User::USER, User::where('email', 'neko@skola.rs')->value('role'));
    }

    public function test_registration_rejects_existing_email(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Duplikat',
            'email' => 'korisnik@fiskultura.test',
            'password' => 'tajna-lozinka',
            'password_confirmation' => 'tajna-lozinka',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_password_reset_flow(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/forgot-password', ['email' => 'korisnik@fiskultura.test'])->assertOk();
        $this->postJson('/api/auth/forgot-password', ['email' => 'ne-postoji@fiskultura.test'])->assertOk();

        $token = null;
        Mail::assertSent(PasswordResetMail::class, 1);
        Mail::assertSent(PasswordResetMail::class, function (PasswordResetMail $mail) use (&$token) {
            parse_str((string) parse_url($mail->url, PHP_URL_QUERY), $query);
            $token = $query['token'];

            return true;
        });

        $this->postJson('/api/auth/reset-password', ['token' => $token, 'password' => 'nova-lozinka', 'password_confirmation' => 'nova-lozinka'])->assertOk();

        $this->postJson('/api/auth/login', ['email' => 'korisnik@fiskultura.test', 'password' => UserSeeder::DEV_PASSWORD])->assertUnprocessable();
        $this->postJson('/api/auth/login', ['email' => 'korisnik@fiskultura.test', 'password' => 'nova-lozinka'])->assertOk();
        $this->postJson('/api/auth/reset-password', ['token' => $token, 'password' => 'treca-lozinka', 'password_confirmation' => 'treca-lozinka'])->assertUnprocessable();
    }

    public function test_refresh_rotates_tokens(): void
    {
        $login = $this->postJson('/api/auth/login', ['email' => 'korisnik@fiskultura.test', 'password' => UserSeeder::DEV_PASSWORD])->json();

        $refreshed = $this->postJson('/api/auth/refresh', ['refresh_token' => $login['refresh_token']])->assertOk()->json();

        $this->assertNotSame($login['refresh_token'], $refreshed['refresh_token']);
        $this->postJson('/api/auth/refresh', ['refresh_token' => $login['refresh_token']])->assertUnprocessable();
    }

    public function test_profile_can_be_read_and_updated(): void
    {
        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();

        $this->getJson('/api/auth/me')->assertUnauthorized();

        $this->withJwt($user)->patchJson('/api/auth/me', ['name' => 'Korisnik Portala', 'school' => 'OŠ „Sveti Sava"', 'municipality' => 'Niš', 'district' => 'Nišavski'])
            ->assertOk()
            ->assertJsonPath('municipality', 'Niš')
            ->assertJsonPath('role', 'user');
    }

    public function test_blocked_user_cannot_use_token_or_log_in(): void
    {
        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $user->forceFill(['blocked_at' => now()])->save();

        $this->withJwt($user)->getJson('/api/auth/me')->assertUnauthorized();
        $this->postJson('/api/auth/login', ['email' => 'korisnik@fiskultura.test', 'password' => UserSeeder::DEV_PASSWORD])->assertUnprocessable();
    }

    public function test_role_middleware_allows_only_listed_roles(): void
    {
        Route::middleware(['api', 'jwt', 'role:editor,admin'])->get('/api/test-editor', fn () => ['ok' => true]);

        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();

        $this->withJwt($user)->getJson('/api/test-editor')->assertForbidden();
        $this->withJwt($editor)->getJson('/api/test-editor')->assertOk();
    }
}

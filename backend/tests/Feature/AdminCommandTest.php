<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_verified_admin_that_can_log_in(): void
    {
        $this->artisan('app:admin', ['email' => 'Admin@Fiskultura.rs', '--password' => 'dugacka-lozinka-123'])->assertSuccessful();

        $admin = User::where('email', 'admin@fiskultura.rs')->firstOrFail();
        $this->assertSame(User::ADMIN, $admin->role);
        $this->assertNotNull($admin->email_verified_at);

        $this->postJson('/api/auth/login', ['email' => 'admin@fiskultura.rs', 'password' => 'dugacka-lozinka-123'])->assertOk();
    }

    public function test_promotes_existing_user_and_rejects_short_password(): void
    {
        User::factory()->create(['email' => 'kolega@skola.rs', 'role' => User::USER]);

        $this->artisan('app:admin', ['email' => 'kolega@skola.rs', '--password' => 'kratko'])->assertFailed();
        $this->assertSame(User::USER, User::where('email', 'kolega@skola.rs')->value('role'));

        $this->artisan('app:admin', ['email' => 'kolega@skola.rs', '--password' => 'dugacka-lozinka-123'])->assertSuccessful();
        $this->assertSame(User::ADMIN, User::where('email', 'kolega@skola.rs')->value('role'));
    }

    public function test_production_seed_creates_no_demo_accounts(): void
    {
        $this->app['env'] = 'production';
        $this->artisan('db:seed', ['--force' => true])->assertSuccessful();

        $this->assertSame(0, User::count());
    }
}

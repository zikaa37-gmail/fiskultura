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

    public function test_user_command_sets_role_and_password_for_new_and_existing_accounts(): void
    {
        User::factory()->create(['email' => 'urednik@skola.rs', 'role' => User::ADMIN, 'name' => 'Pera']);

        $this->artisan('app:user', ['email' => 'urednik@skola.rs', 'role' => 'editor', '--password' => 'Lozinka2026'])->assertSuccessful();
        $this->artisan('app:user', ['email' => 'Novi@Skola.rs', 'role' => 'user', '--password' => 'Lozinka2026', '--name' => 'Mika'])->assertSuccessful();
        $this->artisan('app:user', ['email' => 'neko@skola.rs', 'role' => 'gazda', '--password' => 'Lozinka2026'])->assertFailed();
        $this->artisan('app:user', ['email' => 'neko@skola.rs', 'role' => 'user', '--password' => 'kratko'])->assertFailed();

        $editor = User::where('email', 'urednik@skola.rs')->firstOrFail();
        $this->assertSame([User::EDITOR, 'Pera'], [$editor->role, $editor->name]);
        $this->assertSame('Mika', User::where('email', 'novi@skola.rs')->value('name'));
        $this->assertNull(User::where('email', 'neko@skola.rs')->first());

        $this->postJson('/api/auth/login', ['email' => 'novi@skola.rs', 'password' => 'Lozinka2026'])->assertOk();
    }

    public function test_production_seed_creates_no_demo_accounts(): void
    {
        $this->app['env'] = 'production';
        $this->artisan('db:seed', ['--force' => true])->assertSuccessful();

        $this->assertSame(0, User::count());
    }
}

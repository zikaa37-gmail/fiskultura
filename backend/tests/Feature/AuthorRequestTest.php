<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserNotification;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class AuthorRequestTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $admin;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        $this->admin = User::where('email', 'admin@fiskultura.test')->firstOrFail();
        $this->user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
    }

    public function test_user_applies_to_write_and_admin_is_notified_once(): void
    {
        $this->postJson('/api/author-request', [])->assertUnauthorized();
        $this->withJwt($this->user)->postJson('/api/author-request', ['byline' => 'profesor FV'])->assertUnprocessable()->assertJsonValidationErrors('note');

        $payload = ['byline' => 'profesor FV, instruktor skijanja, Kopaonik', 'bio' => 'Deset sezona u ski školi.', 'note' => 'Kako se postaje instruktor skijanja i koliko traje sezona.'];
        $this->withJwt($this->user)->postJson('/api/author-request', $payload)
            ->assertOk()
            ->assertJsonPath('byline', $payload['byline'])
            ->assertJsonPath('is_author', false);
        $this->withJwt($this->user)->postJson('/api/author-request', [...$payload, 'note' => 'Dopuna: pisao bih i o letnjim kampovima.'])->assertOk();

        $this->assertSame(1, UserNotification::where('user_id', $this->admin->id)->where('kind', 'author_request')->count());
        $this->withJwt($this->user)->getJson('/api/author-request')->assertOk()->assertJsonPath('note', 'Dopuna: pisao bih i o letnjim kampovima.');

        $this->withJwt($this->admin)->postJson('/api/admin/users/list', ['author_requests' => true])
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.author_request.byline', $payload['byline']);
    }

    public function test_granting_author_role_notifies_user_and_clears_request_list(): void
    {
        $this->user->forceFill(['author_requested_at' => now(), 'byline' => 'trener', 'author_request_note' => 'O borilačkim veštinama.'])->save();

        $this->withJwt($this->admin)->patchJson("/api/admin/users/{$this->user->id}", ['role' => User::AUTHOR])->assertOk();

        $this->assertDatabaseHas('user_notifications', ['user_id' => $this->user->id, 'kind' => 'author_granted']);
        $this->withJwt($this->admin)->postJson('/api/admin/users/list', ['author_requests' => true])->assertOk()->assertJsonPath('meta.total', 0);
        $this->withJwt($this->user->fresh())->postJson('/api/author-request', ['byline' => 'trener', 'note' => 'Još jedna prijava.'])->assertUnprocessable();
    }

    public function test_promotion_to_editor_still_requires_password(): void
    {
        $this->admin->forceFill(['password' => Hash::make('lozinka123')])->save();
        $this->withJwt($this->admin)->patchJson("/api/admin/users/{$this->user->id}", ['role' => User::EDITOR])->assertUnprocessable();
    }
}

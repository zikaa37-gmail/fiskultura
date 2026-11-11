<?php

namespace Tests\Feature;

use App\Mail\DebatePostMail;
use App\Mail\DebateReopenDecisionMail;
use App\Mail\DebateReopenRequestMail;
use App\Mail\NoticeMail;
use App\Models\Debate;
use App\Models\DebateModeratorLog;
use App\Models\DebateReopenRequest;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserNotification;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class ModerationTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $admin;

    private User $editor;

    private User $author;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->seed(UserSeeder::class);
        $this->admin = User::where('email', 'admin@fiskultura.test')->firstOrFail();
        $this->editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $this->author = User::where('email', 'autor@fiskultura.test')->firstOrFail();
        $this->user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
    }

    private function debate(string $status = Debate::OPEN): Debate
    {
        return Debate::create(['slug' => 'administracija', 'title' => 'Koliko nam administracija oduzima vremena?', 'status' => $status, 'moderator_id' => $this->editor->id, 'closed_at' => $status === Debate::CLOSED ? now() : null]);
    }

    public function test_admin_manages_moderator_rotation_and_assignments_are_logged(): void
    {
        $this->withJwt($this->editor)->getJson('/api/admin/moderators')->assertForbidden();
        $this->withJwt($this->admin)->patchJson("/api/admin/moderators/{$this->author->id}", ['in_pool' => true])->assertOk()->assertJsonPath('in_pool', true);

        $this->withJwt($this->admin)->getJson('/api/admin/moderators')
            ->assertOk()
            ->assertJsonPath('next.id', $this->author->id)
            ->assertJsonPath('pool_size', 1);

        $this->withJwt($this->user)->postJson('/api/debates', ['title' => 'Oprema u seoskim školama', 'description' => 'Kako da dođemo do opreme bez budžeta?'])
            ->assertCreated()->assertJsonPath('moderator.id', $this->author->id);
        $debate = Debate::firstOrFail();
        $this->withJwt($this->admin)->patchJson("/api/admin/debates/{$debate->id}", ['moderator_id' => $this->editor->id])->assertOk();

        $this->withJwt($this->admin)->getJson('/api/admin/moderators/log')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.reason', DebateModeratorLog::MANUAL)
            ->assertJsonPath('0.moderator', $this->editor->name)
            ->assertJsonPath('0.previous', $this->author->name)
            ->assertJsonPath('0.assigned_by', $this->admin->name)
            ->assertJsonPath('1.reason', DebateModeratorLog::AUTO);

        $row = collect($this->withJwt($this->admin)->getJson('/api/admin/moderators')->json('data'))->firstWhere('id', $this->editor->id);
        $this->assertSame(0, $row['open']);
        $this->assertSame(1, $row['proposed']);
    }

    public function test_closed_debate_is_frozen(): void
    {
        $debate = $this->debate();
        $post = $debate->posts()->create(['user_id' => $this->user->id, 'kind' => 'statement', 'body' => 'Previše papira.']);
        $debate->update(['status' => Debate::CLOSED]);

        $this->withJwt($this->author)->postJson("/api/debate-posts/{$post->id}/like")->assertUnprocessable();
        $this->withJwt($this->editor)->patchJson("/api/debate-posts/{$post->id}", ['highlighted' => true])->assertUnprocessable();
        $this->withJwt($this->editor)->postJson("/api/debates/{$debate->slug}/analysis")->assertUnprocessable();
        $this->withJwt($this->user)->postJson("/api/debates/{$debate->slug}/posts", ['kind' => 'statement', 'body' => 'Još nešto.'])->assertUnprocessable();
    }

    public function test_member_asks_to_reopen_and_moderator_decides_with_mail_and_inbox(): void
    {
        $debate = $this->debate(Debate::CLOSED);
        $payload = ['kind' => 'suggestion', 'body' => 'Predlažem jedinstven obrazac izveštaja za sve škole.'];

        $this->withJwt($this->user)->postJson("/api/debates/{$debate->slug}/reopen-requests", $payload)->assertCreated()->assertJsonPath('status', 'pending');
        $this->withJwt($this->user)->postJson("/api/debates/{$debate->slug}/reopen-requests", $payload)->assertUnprocessable();
        Mail::assertSent(DebateReopenRequestMail::class, fn ($mail) => $mail->hasTo($this->editor->email) && str_contains($mail->render(), 'jedinstven obrazac'));
        $this->assertSame(1, UserNotification::where('user_id', $this->editor->id)->where('kind', 'debate_reopen_request')->count());

        $this->withJwt($this->editor)->getJson("/api/debates/{$debate->slug}")->assertJsonCount(1, 'reopen_requests');
        $this->withJwt($this->user)->getJson("/api/debates/{$debate->slug}")->assertJsonPath('my_reopen_request.status', 'pending')->assertJsonMissingPath('reopen_requests');
        $reopen = DebateReopenRequest::firstOrFail();

        $this->withJwt($this->author)->postJson("/api/debate-reopen-requests/{$reopen->id}/decision", ['approve' => true])->assertForbidden();
        $this->withJwt($this->editor)->postJson("/api/debate-reopen-requests/{$reopen->id}/decision", ['approve' => true])->assertOk();

        $debate->refresh();
        $this->assertSame(Debate::OPEN, $debate->status);
        $this->assertSame(1, $debate->posts_count);
        $this->assertSame('Predlažem jedinstven obrazac izveštaja za sve škole.', $debate->posts()->value('body'));
        Mail::assertSent(DebateReopenDecisionMail::class, fn ($mail) => $mail->hasTo($this->user->email) && str_contains($mail->render(), 'ponovo otvorena'));
        $this->assertSame(1, UserNotification::where('user_id', $this->user->id)->where('kind', 'debate_reopen_decision')->count());
        $this->withJwt($this->editor)->postJson("/api/debate-reopen-requests/{$reopen->id}/decision", ['approve' => true])->assertUnprocessable();
    }

    public function test_rejected_reopen_keeps_debate_closed(): void
    {
        $debate = $this->debate(Debate::CLOSED);
        $this->withJwt($this->user)->postJson("/api/debates/{$debate->slug}/reopen-requests", ['kind' => 'question', 'body' => 'Da li je neko pitao ministarstvo?'])->assertCreated();
        $reopen = DebateReopenRequest::firstOrFail();

        $this->withJwt($this->editor)->postJson("/api/debate-reopen-requests/{$reopen->id}/decision", ['approve' => false, 'note' => 'Nastavljamo u novoj temi.'])->assertOk();

        $this->assertSame(Debate::CLOSED, $debate->fresh()->status);
        $this->assertSame(0, $debate->posts()->count());
        Mail::assertSent(DebateReopenDecisionMail::class, fn ($mail) => str_contains($mail->render(), 'Nastavljamo u novoj temi.'));
    }

    public function test_every_mail_to_a_member_lands_in_notifications(): void
    {
        $debate = $this->debate();
        $this->withJwt($this->user)->postJson("/api/debates/{$debate->slug}/posts", ['kind' => 'criticism', 'body' => 'Dnevnik vodim duplo.'])->assertCreated();
        Mail::assertSent(DebatePostMail::class);

        Subscription::query()->delete();
        Subscription::forceCreate(['email' => $this->author->email, 'user_id' => $this->author->id, 'frequency' => Subscription::INSTANT, 'channel' => 'mail', 'confirmed_at' => now()]);
        $this->withJwt($this->admin)->postJson("/api/admin/debates/{$debate->id}/promotions", ['message' => 'Kolege, recite koliko vam administracija oduzima vremena.'])->assertCreated();
        $this->artisan('notifications:send')->assertSuccessful();
        Mail::assertSent(NoticeMail::class);

        $this->withJwt($this->editor)->getJson('/api/me/notifications/unread')->assertOk()->assertJsonPath('unread', 1);
        $this->withJwt($this->editor)->getJson('/api/me/notifications')
            ->assertOk()
            ->assertJsonPath('data.0.kind', 'debate_post')
            ->assertJsonPath('data.0.url', '/debate/administracija')
            ->assertJsonPath('data.0.channels', ['mail'])
            ->assertJsonPath('data.0.read', false);
        $this->withJwt($this->author)->getJson('/api/me/notifications')
            ->assertJsonPath('data.0.kind', 'debate_invitation')
            ->assertJsonPath('data.0.url', '/debate/administracija');

        $this->withJwt($this->editor)->postJson('/api/me/notifications/read', ['all' => true])->assertOk()->assertJsonPath('unread', 0);
        $this->withJwt($this->user)->getJson('/api/me/notifications')->assertJsonPath('meta.total', 0);
        $this->assertSame(0, UserNotification::where('user_id', $this->user->id)->count());
    }
}

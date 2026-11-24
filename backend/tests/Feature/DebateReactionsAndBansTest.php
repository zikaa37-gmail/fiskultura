<?php

namespace Tests\Feature;

use App\Mail\DebateBanMail;
use App\Models\Debate;
use App\Models\DebateBan;
use App\Models\User;
use App\Models\UserNotification;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class DebateReactionsAndBansTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $admin;

    private User $editor;

    private User $author;

    private User $user;

    private Debate $debate;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->seed(UserSeeder::class);
        $this->admin = User::where('email', 'admin@fiskultura.test')->firstOrFail();
        $this->editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $this->author = User::where('email', 'autor@fiskultura.test')->firstOrFail();
        $this->user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $this->debate = Debate::create(['slug' => 'administracija', 'title' => 'Administracija u nastavi', 'status' => Debate::OPEN, 'moderator_id' => $this->editor->id]);
    }

    public function test_reactions_switch_toggle_and_notify_author_on_site(): void
    {
        $post = $this->debate->posts()->create(['user_id' => $this->user->id, 'kind' => 'suggestion', 'body' => 'Jedan obrazac za sve škole.']);

        $this->withJwt($this->user)->postJson("/api/debate-posts/{$post->id}/react", ['type' => 'agree'])->assertUnprocessable();
        $this->withJwt($this->author)->postJson("/api/debate-posts/{$post->id}/react", ['type' => 'wow'])->assertUnprocessable();

        $this->withJwt($this->author)->postJson("/api/debate-posts/{$post->id}/react", ['type' => 'agree'])
            ->assertOk()->assertJsonPath('reaction', 'agree')->assertJsonPath('reactions.agree', 1);
        $this->withJwt($this->editor)->postJson("/api/debate-posts/{$post->id}/react", ['type' => 'useful'])->assertOk();
        $this->withJwt($this->author)->postJson("/api/debate-posts/{$post->id}/react", ['type' => 'disagree'])
            ->assertOk()->assertJsonPath('reaction', 'disagree')->assertJsonPath('likes_count', 2);
        $this->withJwt($this->author)->postJson("/api/debate-posts/{$post->id}/react", ['type' => 'disagree'])
            ->assertOk()->assertJsonPath('reaction', null)->assertJsonPath('likes_count', 1);

        $this->withJwt($this->editor)->getJson("/api/debates/{$this->debate->slug}/posts")
            ->assertJsonPath('data.0.reaction', 'useful')
            ->assertJsonPath('data.0.reactions.useful', 1);

        $notices = UserNotification::where('user_id', $this->user->id)->where('kind', 'debate_reaction')->get();
        $this->assertCount(3, $notices);
        $this->assertSame(['site'], $notices->first()->channels);
    }

    public function test_moderator_bans_author_from_writing_and_lifts_it(): void
    {
        $post = $this->debate->posts()->create(['user_id' => $this->user->id, 'kind' => 'criticism', 'body' => 'Uvredljiv prilog.']);
        $other = Debate::create(['slug' => 'oprema', 'title' => 'Oprema', 'status' => Debate::OPEN, 'moderator_id' => $this->editor->id]);
        $payload = ['reason' => 'Lični napad na kolegu.', 'days' => 7, 'scope' => 'debate', 'hide_post' => true];

        $this->withJwt($this->author)->postJson("/api/debate-posts/{$post->id}/ban", $payload)->assertForbidden();
        $this->withJwt($this->editor)->postJson("/api/debate-posts/{$post->id}/ban", ['scope' => 'debate'])->assertUnprocessable()->assertJsonValidationErrors('reason');
        $this->withJwt($this->editor)->postJson("/api/debate-posts/{$post->id}/ban", $payload)->assertCreated()->assertJsonPath('scope', 'debate');

        $this->assertNotNull($post->fresh()->hidden_at);
        Mail::assertSent(DebateBanMail::class, fn ($mail) => $mail->hasTo($this->user->email) && str_contains($mail->render(), 'Lični napad na kolegu.'));
        $this->assertSame(1, UserNotification::where('user_id', $this->user->id)->where('kind', 'debate_ban')->count());

        $this->withJwt($this->user)->postJson("/api/debates/{$this->debate->slug}/posts", ['kind' => 'statement', 'body' => 'Opet ja.'])
            ->assertForbidden()->assertJsonPath('message', DebateBan::firstOrFail()->message());
        $this->withJwt($this->user)->getJson("/api/debates/{$this->debate->slug}")->assertJsonPath('my_ban.reason', 'Lični napad na kolegu.');
        $this->withJwt($this->user)->postJson("/api/debates/{$other->slug}/posts", ['kind' => 'statement', 'body' => 'U drugoj temi može.'])->assertCreated();

        $this->withJwt($this->editor)->getJson("/api/debates/{$this->debate->slug}/bans")->assertJsonCount(1)->assertJsonPath('0.user.name', $this->user->name);
        $ban = DebateBan::firstOrFail();
        $this->withJwt($this->author)->deleteJson("/api/debate-bans/{$ban->id}")->assertForbidden();
        $this->withJwt($this->editor)->deleteJson("/api/debate-bans/{$ban->id}")->assertOk();
        $this->withJwt($this->user)->postJson("/api/debates/{$this->debate->slug}/posts", ['kind' => 'statement', 'body' => 'Posle ukidanja.'])->assertCreated();
    }

    public function test_global_ban_blocks_all_topics_and_proposals_but_not_reactions_and_expires(): void
    {
        $post = $this->debate->posts()->create(['user_id' => $this->user->id, 'kind' => 'statement', 'body' => 'Nerelevantno.']);
        $mine = $this->debate->posts()->create(['user_id' => $this->author->id, 'kind' => 'statement', 'body' => 'Prilog autora.']);

        $this->withJwt($this->editor)->postJson("/api/debate-posts/{$mine->id}/ban", ['reason' => 'Test zabrane uredniku', 'scope' => 'all'])->assertCreated();
        $adminPost = $this->debate->posts()->create(['user_id' => $this->admin->id, 'kind' => 'statement', 'body' => 'Admin piše.']);
        $this->withJwt($this->editor)->postJson("/api/debate-posts/{$adminPost->id}/ban", ['reason' => 'Ne može adminu', 'scope' => 'all'])->assertUnprocessable();

        $this->withJwt($this->editor)->postJson("/api/debate-posts/{$post->id}/ban", ['reason' => 'Nerelevantni prilozi.', 'days' => 1, 'scope' => 'all'])->assertCreated();
        $this->withJwt($this->user)->postJson('/api/debates', ['title' => 'Nova tema za razgovor', 'description' => 'Opis nove teme za razgovor.'])->assertForbidden();
        $this->withJwt($this->user)->postJson("/api/debate-posts/{$mine->id}/react", ['type' => 'agree'])->assertOk();

        $this->travel(2)->days();
        $this->withJwt($this->user)->postJson("/api/debates/{$this->debate->slug}/posts", ['kind' => 'statement', 'body' => 'Zabrana je istekla.'])->assertCreated();
    }
}

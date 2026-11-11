<?php

namespace Tests\Feature;

use App\Mail\DebateIntroReadyMail;
use App\Models\Debate;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\Ai\Assistant;
use App\Services\Ai\ClaudeAssistant;
use App\Services\Ai\DebateIntroWriter;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class DebateIntroTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $editor;

    private User $user;

    private FakeAssistant $ai;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->seed(UserSeeder::class);
        $this->editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $this->user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $this->ai = new FakeAssistant;
        $this->app->instance(Assistant::class, $this->ai);
    }

    public function test_opening_a_topic_writes_intro_draft_that_members_see_after_approval(): void
    {
        $this->withJwt($this->editor)->postJson('/api/admin/debates', ['title' => 'Administracija u nastavi FV', 'description' => 'Koliko vremena oduzima?'])->assertCreated();
        $debate = Debate::firstOrFail();

        $this->assertSame(DebateIntroWriter::DRAFT, $debate->intro_status);
        $this->assertSame(1, $this->ai->researchCalls);
        $this->assertStringContainsString('<tema>Administracija u nastavi FV</tema>', $this->ai->prompt);
        Mail::assertSent(DebateIntroReadyMail::class, fn ($mail) => $mail->hasTo($this->editor->email));
        $this->assertSame(1, UserNotification::where('user_id', $this->editor->id)->where('kind', 'debate_intro')->count());

        $this->withJwt($this->user)->getJson("/api/debates/{$debate->slug}")->assertJsonPath('intro', null)->assertJsonMissingPath('intro_draft');
        $this->withJwt($this->editor)->getJson("/api/debates/{$debate->slug}")
            ->assertJsonPath('intro_status', 'draft')
            ->assertJsonPath('intro_draft.sources.0.url', 'https://primer.rs/es-dnevnik');

        $this->withJwt($this->user)->postJson("/api/debates/{$debate->slug}/intro/approve")->assertForbidden();
        $this->withJwt($this->editor)->postJson("/api/debates/{$debate->slug}/intro/approve")->assertOk();
        $this->withJwt($this->user)->getJson("/api/debates/{$debate->slug}")
            ->assertJsonPath('intro.text', 'Nastavnici se najčešće žale na dupli unos podataka.')
            ->assertJsonPath('intro.sources.0.title', 'Sindikat');
    }

    public function test_member_proposal_gets_intro_only_after_approval_and_moderator_can_regenerate_with_guidance(): void
    {
        $this->withJwt($this->user)->postJson('/api/debates', ['title' => 'Oprema za fizičko u seoskim školama', 'description' => 'Kako da dođemo do opreme bez budžeta?'])->assertCreated();
        $debate = Debate::firstOrFail();
        $this->assertNull($debate->intro_status);
        $this->assertSame(0, $this->ai->researchCalls);

        $this->withJwt($this->editor)->patchJson("/api/admin/debates/{$debate->id}", ['status' => Debate::OPEN])->assertOk();
        $this->assertSame(DebateIntroWriter::DRAFT, $debate->fresh()->intro_status);

        $this->withJwt($this->user)->postJson("/api/debates/{$debate->slug}/intro")->assertForbidden();
        $this->withJwt($this->editor)->postJson("/api/debates/{$debate->slug}/intro", ['guidance' => 'Potraži po vestima na šta se žale nastavnici.'])
            ->assertStatus(202);
        $this->assertSame(2, $this->ai->researchCalls);
        $this->assertStringContainsString('<smernice_moderatora>Potraži po vestima na šta se žale nastavnici.</smernice_moderatora>', $this->ai->prompt);

        $debate->update(['status' => Debate::CLOSED]);
        $this->withJwt($this->editor)->postJson("/api/debates/{$debate->slug}/intro")->assertUnprocessable();
    }

    public function test_without_ai_key_intro_fails_with_message_and_command_retries_pending(): void
    {
        $this->app->instance(Assistant::class, new ClaudeAssistant(null));
        $this->withJwt($this->editor)->postJson('/api/admin/debates', ['title' => 'Ocenjivanje oslobođenih učenika'])->assertCreated();
        $debate = Debate::firstOrFail();

        $this->assertSame(DebateIntroWriter::FAILED, $debate->intro_status);
        $this->assertSame('AI nije podešen na serveru (nedostaje ANTHROPIC_API_KEY).', $debate->intro_error);

        $this->app->instance(Assistant::class, $this->ai);
        $debate->update(['intro_status' => DebateIntroWriter::PENDING]);
        $this->artisan('debates:intros')->expectsOutput('Uvodni pregledi: obrađeno 1.')->assertExitCode(0);
        $this->assertSame(DebateIntroWriter::DRAFT, $debate->fresh()->intro_status);
    }
}

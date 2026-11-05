<?php

namespace Tests\Feature;

use App\Mail\QuestionAnsweredMail;
use App\Models\Question;
use App\Models\User;
use Database\Seeders\ContentSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class QuestionTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $user;

    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([UserSeeder::class, ContentSeeder::class]);
        $this->user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $this->editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        Mail::fake();
    }

    public function test_seeded_answers_are_public_with_existing_regulations_and_import_is_idempotent(): void
    {
        $rows = json_decode(file_get_contents(database_path('data/questions.json')), true);
        $this->assertSame(count($rows), Question::visible()->count());

        $this->seed(ContentSeeder::class);
        $this->assertSame(count($rows), Question::count());

        foreach ($rows as $row) {
            $detail = $this->getJson("/api/questions/{$row['slug']}")->assertOk()->json();
            $this->assertCount(count($row['regulations']), $detail['regulations'], $row['slug']);
            $this->assertNotEmpty($detail['valid_on']);
        }

        $grading = count(array_filter($rows, fn ($row) => $row['category'] === 'ocenjivanje'));
        $this->getJson('/api/questions?category=ocenjivanje')->assertOk()->assertJsonCount($grading)->assertJsonMissingPath('0.answer');
        $mentions = count(array_filter($rows, fn ($row) => stripos($row['title'].' '.($row['body'] ?? '').' '.$row['answer'], 'direktor') !== false));
        $this->assertGreaterThan(0, $mentions);
        $this->getJson('/api/questions?q=direktor')->assertOk()->assertJsonCount($mentions);
    }

    public function test_user_asks_editor_answers_and_asker_gets_one_mail_without_public_name(): void
    {
        $this->postJson('/api/questions', ['category' => 'norma', 'title' => 'Da li se sekcija računa u normu?'])->assertUnauthorized();

        $asked = $this->withJwt($this->user)->postJson('/api/questions', [
            'category' => 'norma', 'title' => 'Da li se sekcija računa u normu?', 'body' => 'Radim u OŠ Vuk, imam dve sekcije.',
        ])->assertCreated()->assertJsonPath('status', 'pending')->assertJsonPath('slug', null);
        $id = $asked->json('id');

        $this->getJson('/api/questions?q=Vuk')->assertJsonCount(0);
        $this->withJwt($this->user)->getJson('/api/me/questions')->assertOk()->assertJsonPath('0.status', 'pending');
        $this->withJwt($this->user)->getJson("/api/admin/questions/{$id}")->assertForbidden();

        $payload = [
            'category' => 'norma', 'title' => 'Da li se sekcija računa u normu?', 'body' => 'Imam dve sekcije.',
            'answer' => '', 'regulation_keys' => ['norma-os'], 'valid_on' => null, 'status' => 'published',
        ];
        $this->withJwt($this->editor)->patchJson("/api/admin/questions/{$id}", $payload)->assertUnprocessable()->assertJsonValidationErrors(['answer', 'valid_on']);
        $this->withJwt($this->editor)->patchJson("/api/admin/questions/{$id}", [...$payload, 'regulation_keys' => ['ne-postoji']])->assertUnprocessable();

        $payload = [...$payload, 'answer' => 'Da, u okviru 24 časa neposrednog rada.', 'valid_on' => '2026-11-05'];
        $this->withJwt($this->editor)->patchJson("/api/admin/questions/{$id}", $payload)->assertOk()
            ->assertJsonPath('original', "Da li se sekcija računa u normu?\n\nRadim u OŠ Vuk, imam dve sekcije.");
        $this->withJwt($this->editor)->patchJson("/api/admin/questions/{$id}", $payload)->assertOk();

        Mail::assertSent(QuestionAnsweredMail::class, 1);
        Mail::assertSent(QuestionAnsweredMail::class, fn (QuestionAnsweredMail $mail) => $mail->hasTo($this->user->email));

        $public = $this->getJson('/api/questions/'.Question::find($id)->slug)->assertOk()
            ->assertJsonPath('regulations.0.key', 'norma-os')->json();
        $this->assertStringNotContainsString('Vuk', json_encode($public));
        $this->assertArrayNotHasKey('original', $public);
        $this->withJwt($this->user)->getJson('/api/me/questions')->assertJsonPath('0.status', 'published');
    }

    public function test_pending_limit_per_user(): void
    {
        foreach (range(1, 5) as $i) {
            Question::create(['slug' => "p-{$i}", 'category' => 'ostalo', 'title' => "Pitanje {$i}", 'asked_by' => $this->user->id]);
        }

        $this->withJwt($this->user)->postJson('/api/questions', ['category' => 'ostalo', 'title' => 'Još jedno dugačko pitanje?'])
            ->assertUnprocessable()->assertJsonValidationErrors('title');
    }

    public function test_editor_lists_pending_first_and_only_admin_deletes(): void
    {
        $pending = Question::create(['slug' => 'na-cekanju', 'category' => 'ostalo', 'title' => 'Na čekanju', 'asked_by' => $this->user->id]);

        $this->withJwt($this->editor)->postJson('/api/admin/questions/list', [])->assertOk()
            ->assertJsonPath('data.0.id', $pending->id)->assertJsonPath('pending', 1)->assertJsonPath('data.0.asker.email', $this->user->email);
        $this->withJwt($this->editor)->deleteJson("/api/admin/questions/{$pending->id}")->assertForbidden();

        $admin = User::where('email', 'admin@fiskultura.test')->firstOrFail();
        $this->withJwt($admin)->deleteJson("/api/admin/questions/{$pending->id}")->assertOk();
        $this->assertNull(Question::find($pending->id));
    }
}

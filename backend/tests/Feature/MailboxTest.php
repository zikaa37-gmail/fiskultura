<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Mailbox\ImapMailbox;
use App\Services\Mailbox\Mailbox;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class MailboxTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $admin;

    private FakeMailbox $mailbox;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        $this->admin = User::where('email', 'admin@fiskultura.test')->firstOrFail();
        $this->mailbox = new FakeMailbox;
        $this->app->instance(Mailbox::class, $this->mailbox);
    }

    public function test_only_admin_reaches_the_mailbox(): void
    {
        $editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();

        $this->getJson('/api/admin/mailbox/folders')->assertUnauthorized();
        $this->withJwt($editor)->getJson('/api/admin/mailbox/folders')->assertForbidden();
        $this->withJwt($this->admin)->getJson('/api/admin/mailbox/folders')
            ->assertOk()
            ->assertJsonPath('address', 'admin@fiskultura.rs')
            ->assertJsonPath('folders.0.path', 'INBOX');
    }

    public function test_lists_reads_and_downloads_attachment(): void
    {
        $this->withJwt($this->admin)->getJson('/api/admin/mailbox/messages?folder=INBOX&page=2&q=seminar')->assertOk()->assertJsonPath('meta.total', 1);
        $this->assertSame(['INBOX', 2, 25, 'seminar'], $this->mailbox->calls['messages']);

        $this->withJwt($this->admin)->getJson('/api/admin/mailbox/messages/7?folder=INBOX')->assertOk()->assertJsonPath('subject', 'Prijava za seminar');

        $this->withJwt($this->admin)->get('/api/admin/mailbox/messages/7/attachments/0?folder=INBOX')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/octet-stream')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertDownload('raspored.pdf');
    }

    public function test_sends_with_reply_headers_and_validates_addresses(): void
    {
        $this->withJwt($this->admin)->postJson('/api/admin/mailbox/send', ['to' => ['nije-mejl'], 'subject' => 'x', 'body' => 'y'])
            ->assertUnprocessable()->assertJsonValidationErrors('to.0');

        $this->withJwt($this->admin)->postJson('/api/admin/mailbox/send', [
            'to' => ['ana@primer.rs'],
            'cc' => ['marko@primer.rs'],
            'subject' => 'Re: Prijava za seminar',
            'body' => 'Hvala, prijava je primljena.',
            'in_reply_to' => '<abc@primer.rs>',
        ])->assertCreated()->assertJsonPath('message', 'Mejl je poslat.');

        $this->assertSame([['ana@primer.rs'], ['marko@primer.rs'], 'Re: Prijava za seminar', 'Hvala, prijava je primljena.', '<abc@primer.rs>', null], $this->mailbox->calls['send']);
    }

    public function test_message_actions_are_validated_and_forwarded(): void
    {
        $this->withJwt($this->admin)->postJson('/api/admin/mailbox/messages/7/action', ['folder' => 'INBOX', 'action' => 'archive'])
            ->assertOk()->assertJsonPath('message', 'Mejl je arhiviran.');
        $this->assertSame(['INBOX', 7, 'archive', null], $this->mailbox->calls['act']);

        $this->withJwt($this->admin)->postJson('/api/admin/mailbox/messages/7/action', ['action' => 'move'])->assertUnprocessable()->assertJsonValidationErrors('target');
        $this->withJwt($this->admin)->postJson('/api/admin/mailbox/messages/7/action', ['action' => 'nuke'])->assertUnprocessable();
        $this->withJwt($this->admin)->postJson('/api/admin/mailbox/messages/7/action', ['action' => 'move', 'target' => 'INBOX.Projekti'])->assertOk();
        $this->assertSame(['INBOX', 7, 'move', 'INBOX.Projekti'], $this->mailbox->calls['act']);
    }

    public function test_check_command_reports_imap_and_smtp(): void
    {
        $this->artisan('mailbox:check')
            ->expectsOutput('Nalog: admin@fiskultura.rs')
            ->expectsOutput('IMAP: radi, foldera 5, nepročitano u INBOX 2, Sent: INBOX.Sent')
            ->expectsOutput('SMTP: prijava radi')
            ->assertExitCode(0);

        $this->mailbox->checkResult = ['imap' => false, 'imap_error' => 'AUTHENTICATIONFAILED', 'folders' => 0, 'inbox_unread' => null, 'sent_folder' => null, 'smtp' => true];
        $this->artisan('mailbox:check')->expectsOutput('IMAP: NE RADI: AUTHENTICATIONFAILED')->assertExitCode(1);

        $this->app->instance(Mailbox::class, new ImapMailbox(['host' => null, 'username' => null, 'password' => null]));
        $this->artisan('mailbox:check')->expectsOutput('Pošta nije podešena na serveru (MAILBOX_HOST, MAILBOX_USERNAME, MAILBOX_PASSWORD u .env).')->assertExitCode(0);
    }

    public function test_missing_configuration_gives_clear_message(): void
    {
        $this->app->instance(Mailbox::class, new ImapMailbox(['host' => null, 'username' => null, 'password' => null]));

        $this->withJwt($this->admin)->getJson('/api/admin/mailbox/folders')
            ->assertStatus(503)
            ->assertJsonPath('message', 'Pošta nije podešena na serveru (MAILBOX_HOST, MAILBOX_USERNAME, MAILBOX_PASSWORD u .env).');
    }
}

class FakeMailbox implements Mailbox
{
    public array $calls = [];

    public function address(): string
    {
        return 'admin@fiskultura.rs';
    }

    public array $checkResult = ['imap' => true, 'folders' => 5, 'inbox_unread' => 2, 'sent_folder' => 'INBOX.Sent', 'smtp' => true];

    public function check(): array
    {
        return $this->checkResult;
    }

    public function folders(): array
    {
        return [['path' => 'INBOX', 'name' => 'INBOX', 'total' => 1, 'unread' => 1]];
    }

    public function messages(string $folder, int $page, int $perPage, ?string $search = null): array
    {
        $this->calls['messages'] = [$folder, $page, $perPage, $search];

        return ['data' => [['uid' => 7, 'subject' => 'Prijava za seminar', 'from' => ['name' => 'Ana', 'email' => 'ana@primer.rs'], 'to' => [], 'date' => null, 'seen' => false]], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 1]];
    }

    public function message(string $folder, int $uid): array
    {
        return ['uid' => $uid, 'subject' => 'Prijava za seminar', 'text' => 'Zdravo', 'html' => null, 'attachments' => [['index' => 0, 'name' => 'raspored.pdf', 'type' => 'application/pdf', 'size' => 4]]];
    }

    public function attachment(string $folder, int $uid, int $index): array
    {
        return ['name' => 'raspored.pdf', 'type' => 'application/pdf', 'content' => '%PDF'];
    }

    public function markSeen(string $folder, int $uid, bool $seen): void {}

    public function act(string $folder, int $uid, string $action, ?string $target = null): string
    {
        $this->calls['act'] = [$folder, $uid, $action, $target];

        return 'Mejl je arhiviran.';
    }

    public function send(array $to, array $cc, string $subject, string $body, ?string $inReplyTo = null, ?string $references = null): void
    {
        $this->calls['send'] = [$to, $cc, $subject, $body, $inReplyTo, $references];
    }
}

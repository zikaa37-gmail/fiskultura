<?php

namespace App\Services\Mailbox;

use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Address as MimeAddress;
use Symfony\Component\Mime\Email;
use Throwable;
use Webklex\PHPIMAP\Address;
use Webklex\PHPIMAP\Attachment;
use Webklex\PHPIMAP\Client;
use Webklex\PHPIMAP\ClientManager;
use Webklex\PHPIMAP\Folder;
use Webklex\PHPIMAP\Message;

class ImapMailbox implements Mailbox
{
    private const SENT_FOLDERS = ['INBOX.Sent', 'Sent', 'INBOX.Sent Messages', 'Sent Messages', 'INBOX.Sent Items', 'Sent Items'];

    private const ROLE_NAMES = [
        'sent' => ['sent', 'sent messages', 'sent items'],
        'trash' => ['trash', 'deleted', 'deleted messages', 'deleted items'],
        'archive' => ['archive', 'archives'],
        'junk' => ['junk', 'spam'],
        'drafts' => ['drafts'],
    ];

    private const ROLE_DEFAULTS = ['trash' => 'INBOX.Trash', 'archive' => 'INBOX.Archive', 'junk' => 'INBOX.Junk'];

    public const ACTIONS = ['delete', 'archive', 'spam', 'inbox', 'move'];

    private ?Client $client = null;

    public function __construct(private readonly array $config) {}

    public function address(): string
    {
        return (string) ($this->config['username'] ?? '');
    }

    public function check(): array
    {
        $this->ensureConfigured();
        $result = ['imap' => false, 'folders' => 0, 'inbox_unread' => null, 'sent_folder' => null, 'smtp' => false];

        try {
            $folders = $this->client()->getFolders(false);
            $result['imap'] = true;
            $result['folders'] = $folders->count();
            $result['inbox_unread'] = $this->folder('INBOX')->query()->whereUnseen()->setFetchBody(false)->leaveUnread()->count();
            $result['sent_folder'] = $this->sentFolder()?->path;
        } catch (Throwable $error) {
            $result['imap_error'] = $error->getMessage();
        }

        try {
            $transport = Transport::fromDsn($this->smtpDsn());
            if (method_exists($transport, 'start')) {
                $transport->start();
                $transport->stop();
            }
            $result['smtp'] = true;
        } catch (Throwable $error) {
            $result['smtp_error'] = $error->getMessage();
        }

        return $result;
    }

    public function folders(): array
    {
        return $this->guard(function () {
            $folders = [];
            foreach ($this->client()->getFolders(false) as $folder) {
                $status = $folder->examine();
                $folders[] = [
                    'path' => $folder->path,
                    'name' => $folder->name,
                    'role' => $this->role($folder),
                    'total' => (int) ($status['exists'] ?? 0),
                    'unread' => $folder->path === 'INBOX' ? $folder->query()->whereUnseen()->setFetchBody(false)->leaveUnread()->count() : null,
                ];
            }
            usort($folders, fn (array $a, array $b) => [$a['path'] !== 'INBOX', $a['path']] <=> [$b['path'] !== 'INBOX', $b['path']]);

            return $folders;
        });
    }

    public function messages(string $folder, int $page, int $perPage, ?string $search = null): array
    {
        return $this->guard(function () use ($folder, $page, $perPage, $search) {
            $query = $this->folder($folder)->query()->setFetchBody(false)->leaveUnread()->setFetchOrder('desc');
            $query = $search ? $query->whereText($search) : $query->all();
            $paginator = $query->paginate($perPage, $page);

            return [
                'data' => collect($paginator->items())->map(fn (Message $message) => $this->summary($message))->sortByDesc('uid')->values()->all(),
                'meta' => ['current_page' => $paginator->currentPage(), 'last_page' => max(1, $paginator->lastPage()), 'total' => $paginator->total()],
            ];
        });
    }

    public function message(string $folder, int $uid): array
    {
        return $this->guard(function () use ($folder, $uid) {
            $message = $this->folder($folder)->query()->leaveUnread()->getMessageByUid($uid);
            if (! $this->isSeen($message)) {
                $message->setFlag('Seen');
            }

            return [
                ...$this->summary($message),
                'seen' => true,
                'cc' => $this->addresses($message->getCc()),
                'reply_to' => $this->addresses($message->getReplyTo()),
                'message_id' => $this->header($message, 'message_id'),
                'references' => $this->header($message, 'references'),
                'text' => $message->hasTextBody() ? $message->getTextBody() : null,
                'html' => $message->hasHTMLBody() ? $message->getHTMLBody() : null,
                'attachments' => $message->getAttachments()->values()->map(fn (Attachment $attachment, int $index) => [
                    'index' => $index,
                    'name' => $attachment->getName() ?: 'prilog-'.($index + 1),
                    'type' => $attachment->getMimeType() ?? 'application/octet-stream',
                    'size' => (int) $attachment->size,
                ])->all(),
            ];
        });
    }

    public function attachment(string $folder, int $uid, int $index): array
    {
        return $this->guard(function () use ($folder, $uid, $index) {
            $attachment = $this->folder($folder)->query()->leaveUnread()->getMessageByUid($uid)->getAttachments()->values()->get($index)
                ?? throw new MailboxUnavailableException('Prilog ne postoji.');

            return [
                'name' => $attachment->getName() ?: 'prilog-'.($index + 1),
                'type' => $attachment->getMimeType() ?? 'application/octet-stream',
                'content' => $attachment->getContent(),
            ];
        });
    }

    public function markSeen(string $folder, int $uid, bool $seen): void
    {
        $this->guard(function () use ($folder, $uid, $seen) {
            $message = $this->folder($folder)->query()->setFetchBody(false)->leaveUnread()->getMessageByUid($uid);
            $seen ? $message->setFlag('Seen') : $message->unsetFlag('Seen');
        });
    }

    public function act(string $folder, int $uid, string $action, ?string $target = null): string
    {
        return $this->guard(function () use ($folder, $uid, $action, $target) {
            $source = $this->folder($folder);
            $message = $source->query()->setFetchBody(false)->leaveUnread()->getMessageByUid($uid);
            $sourceRole = $this->role($source);

            if ($action === 'delete' && $sourceRole === 'trash') {
                $message->delete(true);

                return 'Mejl je trajno obrisan.';
            }

            $destination = match ($action) {
                'delete' => $this->roleFolder('trash'),
                'archive' => $this->roleFolder('archive'),
                'spam' => $this->roleFolder('junk'),
                'inbox' => $this->folder('INBOX'),
                'move' => $this->folder((string) $target),
                default => throw new MailboxUnavailableException('Nepoznata radnja.'),
            };
            if ($destination->path === $source->path) {
                throw new MailboxUnavailableException('Mejl je već u tom folderu.');
            }
            $message->move($destination->path);

            return match ($action) {
                'delete' => 'Mejl je premešten u Otpad.',
                'archive' => 'Mejl je arhiviran.',
                'spam' => 'Mejl je premešten u Neželjeno.',
                'inbox' => 'Mejl je vraćen u Primljeno.',
                default => "Mejl je premešten u {$destination->name}.",
            };
        });
    }

    public function send(array $to, array $cc, string $subject, string $body, ?string $inReplyTo = null, ?string $references = null): void
    {
        $this->ensureConfigured();
        $email = (new Email)
            ->from(new MimeAddress($this->address(), (string) ($this->config['from_name'] ?? 'Fiskultura')))
            ->to(...$to)
            ->subject($subject)
            ->text($body);
        if ($cc) {
            $email->cc(...$cc);
        }
        if ($inReplyTo) {
            $email->getHeaders()->addIdHeader('In-Reply-To', trim($inReplyTo, '<> '));
            $email->getHeaders()->addTextHeader('References', trim(($references ? $references.' ' : '').'<'.trim($inReplyTo, '<> ').'>'));
        }

        try {
            (new Mailer(Transport::fromDsn($this->smtpDsn())))->send($email);
        } catch (Throwable $error) {
            report($error);
            throw new MailboxUnavailableException('Slanje nije uspelo: SMTP server nije prihvatio poruku. Proverite adresu primaoca i podešavanja naloga.');
        }

        try {
            $this->sentFolder()?->appendMessage($email->toString(), ['\\Seen']);
        } catch (Throwable $error) {
            report($error);
        }
    }

    private function smtpDsn(): string
    {
        return sprintf('smtps://%s:%s@%s:%d', rawurlencode($this->address()), rawurlencode((string) $this->config['password']), $this->config['host'], (int) ($this->config['smtp_port'] ?? 465));
    }

    private function summary(Message $message): array
    {
        $from = $this->addresses($message->getFrom());

        return [
            'uid' => (int) $message->getUid(),
            'subject' => trim($this->decoded((string) $message->getSubject()->toString())) ?: '(bez naslova)',
            'from' => $from[0] ?? null,
            'to' => $this->addresses($message->getTo()),
            'date' => $this->date($message),
            'seen' => $this->isSeen($message),
        ];
    }

    private function addresses(mixed $attribute): array
    {
        $items = $attribute && method_exists($attribute, 'all') ? $attribute->all() : [];

        return collect($items)
            ->filter(fn ($item) => $item instanceof Address && $item->mail)
            ->map(fn (Address $address) => ['name' => $address->personal ? $this->decoded($address->personal) : null, 'email' => $address->mail])
            ->values()
            ->all();
    }

    private function date(Message $message): ?string
    {
        try {
            return $message->getDate()->toDate()->toIso8601String();
        } catch (Throwable) {
            return null;
        }
    }

    private function header(Message $message, string $name): ?string
    {
        try {
            $value = $message->get($name);

            return $value ? trim((string) $value->toString()) ?: null : null;
        } catch (Throwable) {
            return null;
        }
    }

    private function isSeen(Message $message): bool
    {
        return $message->getFlags()->has('seen');
    }

    private function folder(string $path): Folder
    {
        $folder = $this->client()->getFolderByPath($path) ?? throw new MailboxUnavailableException('Folder ne postoji.');
        $this->client()->openFolder($folder->path, true);

        return $folder;
    }

    private function decoded(string $value): string
    {
        if (! str_contains($value, '=?')) {
            return $value;
        }
        $decoded = @iconv_mime_decode($value, ICONV_MIME_DECODE_CONTINUE_ON_ERROR, 'UTF-8');

        return $decoded !== false && $decoded !== '' ? $decoded : mb_decode_mimeheader($value);
    }

    private function role(Folder $folder): ?string
    {
        if ($folder->path === 'INBOX') {
            return 'inbox';
        }
        $name = mb_strtolower($folder->name);
        foreach (self::ROLE_NAMES as $role => $names) {
            if (in_array($name, $names, true)) {
                return $role;
            }
        }

        return null;
    }

    private function roleFolder(string $role): Folder
    {
        foreach ($this->client()->getFolders(false) as $folder) {
            if ($this->role($folder) === $role) {
                return $folder;
            }
        }

        return $this->client()->createFolder(self::ROLE_DEFAULTS[$role], false);
    }

    private function sentFolder(): ?Folder
    {
        foreach (self::SENT_FOLDERS as $path) {
            $folder = $this->client()->getFolderByPath($path, false, true);
            if ($folder) {
                return $folder;
            }
        }

        return null;
    }

    private function client(): Client
    {
        $this->ensureConfigured();
        if (! $this->client) {
            $this->client = (new ClientManager(['decoding' => ['options' => ['header' => 'iconv', 'message' => 'utf-8', 'attachment' => 'utf-8']]]))->make([
                'host' => $this->config['host'],
                'port' => (int) ($this->config['imap_port'] ?? 993),
                'protocol' => 'imap',
                'encryption' => 'ssl',
                'validate_cert' => true,
                'username' => $this->address(),
                'password' => (string) $this->config['password'],
                'authentication' => null,
                'timeout' => 20,
            ]);
            $this->client->connect();
        }

        return $this->client;
    }

    private function ensureConfigured(): void
    {
        if (! ($this->config['host'] ?? null) || ! $this->address() || ! ($this->config['password'] ?? null)) {
            throw new MailboxUnavailableException('Pošta nije podešena na serveru (MAILBOX_HOST, MAILBOX_USERNAME, MAILBOX_PASSWORD u .env).');
        }
    }

    private function guard(callable $callback): mixed
    {
        try {
            return $callback();
        } catch (MailboxUnavailableException $error) {
            throw $error;
        } catch (Throwable $error) {
            report($error);
            throw new MailboxUnavailableException('Veza sa poštanskim serverom nije uspela. Proverite lozinku i podešavanja u .env.');
        }
    }
}

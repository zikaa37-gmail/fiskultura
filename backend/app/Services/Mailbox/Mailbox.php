<?php

namespace App\Services\Mailbox;

interface Mailbox
{
    public function address(): string;

    public function check(): array;

    public function folders(): array;

    public function messages(string $folder, int $page, int $perPage, ?string $search = null): array;

    public function message(string $folder, int $uid): array;

    public function attachment(string $folder, int $uid, int $index): array;

    public function markSeen(string $folder, int $uid, bool $seen): void;

    public function act(string $folder, int $uid, string $action, ?string $target = null): string;

    public function send(array $to, array $cc, string $subject, string $body, ?string $inReplyTo = null, ?string $references = null): void;
}

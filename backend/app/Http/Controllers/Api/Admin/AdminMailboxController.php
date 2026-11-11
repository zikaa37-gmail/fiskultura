<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Mailbox\Mailbox;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminMailboxController extends Controller
{
    public function __construct(private readonly Mailbox $mailbox) {}

    public function folders()
    {
        return response()->json(['address' => $this->mailbox->address(), 'folders' => $this->mailbox->folders()]);
    }

    public function messages(Request $request)
    {
        $data = $request->validate([
            'folder' => ['nullable', 'string', 'max:200'],
            'page' => ['nullable', 'integer', 'min:1'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        return response()->json($this->mailbox->messages($data['folder'] ?? 'INBOX', $data['page'] ?? 1, 25, trim((string) ($data['q'] ?? '')) ?: null));
    }

    public function show(Request $request, int $uid)
    {
        $folder = $request->validate(['folder' => ['nullable', 'string', 'max:200']])['folder'] ?? 'INBOX';

        return response()->json($this->mailbox->message($folder, $uid));
    }

    public function seen(Request $request, int $uid)
    {
        $data = $request->validate(['folder' => ['nullable', 'string', 'max:200'], 'seen' => ['required', 'boolean']]);
        $this->mailbox->markSeen($data['folder'] ?? 'INBOX', $uid, $data['seen']);

        return response()->json(['seen' => $data['seen']]);
    }

    public function attachment(Request $request, int $uid, int $index)
    {
        $folder = $request->validate(['folder' => ['nullable', 'string', 'max:200']])['folder'] ?? 'INBOX';
        $file = $this->mailbox->attachment($folder, $uid, $index);
        $name = Str::ascii($file['name']) ?: 'prilog';

        return response($file['content'], 200, [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="'.str_replace('"', '', $name).'"; filename*=UTF-8\'\''.rawurlencode($file['name']),
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function send(Request $request)
    {
        $data = $request->validate([
            'to' => ['required', 'array', 'min:1', 'max:20'],
            'to.*' => ['required', 'email:rfc'],
            'cc' => ['nullable', 'array', 'max:20'],
            'cc.*' => ['email:rfc'],
            'subject' => ['required', 'string', 'max:250'],
            'body' => ['required', 'string', 'max:50000'],
            'in_reply_to' => ['nullable', 'string', 'max:500'],
            'references' => ['nullable', 'string', 'max:5000'],
        ], [
            'to.required' => 'Unesite bar jednu adresu primaoca.',
            'to.*.email' => 'Adresa primaoca nije ispravna.',
            'cc.*.email' => 'Adresa u kopiji nije ispravna.',
        ]);

        $this->mailbox->send($data['to'], $data['cc'] ?? [], $data['subject'], $data['body'], $data['in_reply_to'] ?? null, $data['references'] ?? null);

        return response()->json(['message' => 'Mejl je poslat.'], 201);
    }
}

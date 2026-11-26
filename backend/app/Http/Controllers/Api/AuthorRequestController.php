<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Inbox;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthorRequestController extends Controller
{
    public function __construct(private readonly Inbox $inbox) {}

    public function show(Request $request)
    {
        return response()->json($this->present($request->user()));
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_if($user->hasRole(User::AUTHOR, User::EDITOR, User::ADMIN), 422, 'Već imaš ulogu autora: tekst pišeš u adminu.');

        $data = $request->validate([
            'byline' => ['required', 'string', 'min:3', 'max:160'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'note' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $first = $user->author_requested_at === null;
        $user->forceFill([
            'byline' => $data['byline'],
            'bio' => $data['bio'] ?? null,
            'author_request_note' => $data['note'],
            'author_requested_at' => now(),
        ])->save();

        if ($first) {
            $admins = User::where('role', User::ADMIN)->whereNull('blocked_at')->get();
            $this->inbox->record($admins, 'author_request', "Prijava za autora: {$user->name}", $data['byline'].' · '.Str::limit($data['note'], 160), '/admin/korisnici?prijave=1', ['site']);
        }

        return response()->json([
            ...$this->present($user),
            'message' => 'Prijava je poslata. Kad ti uredništvo dodeli ulogu autora, dobićeš obaveštenje i moći ćeš da pišeš.',
        ]);
    }

    private function present(User $user): array
    {
        return [
            'is_author' => $user->hasRole(User::AUTHOR, User::EDITOR, User::ADMIN),
            'requested_at' => $user->author_requested_at?->toIso8601String(),
            'byline' => $user->byline,
            'bio' => $user->bio,
            'note' => $user->author_request_note,
        ];
    }
}

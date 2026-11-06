<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class ContactController extends Controller
{
    public const TOPICS = ['pitanje', 'greska', 'predlog', 'saradnja', 'drugo'];

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email', 'max:190'],
            'topic' => ['required', Rule::in(self::TOPICS)],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'website' => ['nullable', 'max:0'],
        ], [
            'website.max' => 'Poruka nije poslata.',
        ]);
        unset($data['website']);

        $recipients = User::query()->whereIn('role', [User::EDITOR, User::ADMIN])->whereNull('blocked_at')->whereNotNull('email_verified_at')->pluck('email');
        if ($recipients->isEmpty()) {
            Log::warning('Poruka uredništvu bez primaoca', $data);
        } else {
            Mail::to($recipients->all())->send(new ContactMessageMail($data));
        }

        return response()->json(['message' => 'Poruka je poslata uredništvu. Odgovaramo na mejl koji ste naveli.'], 201);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewsSuggestionMail;
use App\Models\NewsSuggestion;
use App\Models\User;
use App\Services\Inbox;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class NewsSuggestionController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'sender_name' => ['required', 'string', 'min:2', 'max:120'],
            'sender_email' => ['required', 'email', 'max:190'],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'sender_organization' => ['required_without:organization_id', 'nullable', 'string', 'max:190'],
            'title' => ['required', 'string', 'min:5', 'max:250'],
            'url' => ['nullable', 'url:http,https', 'max:500'],
            'excerpt' => ['required_without:url', 'nullable', 'string', 'max:3000'],
            'website' => ['nullable', 'max:0'],
        ], [
            'sender_organization.required_without' => 'Izaberite organizaciju ili upišite njen naziv.',
            'excerpt.required_without' => 'Pošaljite link na objavu ili ukratko opišite o čemu je reč.',
            'website.max' => 'Objava nije poslata.',
        ]);
        unset($data['website']);

        $hash = NewsSuggestion::hashUrl($data['url'] ?? null);
        if ($hash && NewsSuggestion::where('url_hash', $hash)->exists()) {
            return response()->json(['message' => 'Ova objava je već kod uredništva. Hvala!']);
        }

        $suggestion = NewsSuggestion::create([
            ...$data,
            'sender_email' => Str::lower($data['sender_email']),
            'origin' => NewsSuggestion::FORM,
            'url_hash' => $hash,
        ]);

        $recipients = User::query()->whereIn('role', [User::EDITOR, User::ADMIN])->whereNull('blocked_at')->whereNotNull('email_verified_at')->pluck('email');
        if ($recipients->isEmpty()) {
            Log::warning('Predlog vesti bez primaoca', ['id' => $suggestion->id]);
        } else {
            Mail::to($recipients->all())->send(new NewsSuggestionMail($suggestion->load('organization')));
            app(Inbox::class)->recordForEmails($recipients, 'news_suggestion', "Poslata objava: {$suggestion->title}", $suggestion->organization?->name ?? $suggestion->sender_organization, '/admin/predlozi');
        }

        return response()->json(['message' => 'Objava je poslata uredništvu. Urednik je pregleda i, ako je za portal, objavljuje kratku vest sa linkom na vaš izvor.'], 201);
    }
}

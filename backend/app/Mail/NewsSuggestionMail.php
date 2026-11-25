<?php

namespace App\Mail;

use App\Models\NewsSuggestion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Str;

class NewsSuggestionMail extends Mailable
{
    use Queueable;

    public function __construct(public NewsSuggestion $suggestion) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address($this->suggestion->sender_email, $this->suggestion->sender_name)],
            subject: 'Poslata objava: '.Str::limit($this->suggestion->title, 80),
        );
    }

    public function content(): Content
    {
        $suggestion = $this->suggestion;
        $organization = $suggestion->organization?->name ?? $suggestion->sender_organization;

        return new Content(view: 'mail.action', with: [
            'heading' => 'Nova objava za portal',
            'greeting' => 'Uredništvu,',
            'lines' => array_values(array_filter([
                "{$suggestion->sender_name} ({$organization}) šalje objavu „{$suggestion->title}”.",
                $suggestion->url ? "Link: {$suggestion->url}" : null,
                $suggestion->excerpt,
                'Predlog čeka u redu za urednika. Na mejl pošiljaoca možete odgovoriti direktno.',
            ])),
            'actionLabel' => 'Otvori predloge',
            'actionUrl' => rtrim((string) config('app.frontend_url'), '/').'/admin/predlozi',
            'footnote' => 'Vest se piše svojim rečima, uz link na izvor.',
        ]);
    }
}

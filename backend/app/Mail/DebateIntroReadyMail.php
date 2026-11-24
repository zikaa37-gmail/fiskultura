<?php

namespace App\Mail;

use App\Models\Debate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class DebateIntroReadyMail extends Mailable
{
    use Queueable;

    public function __construct(public Debate $debate) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Uvodni pregled je spreman: {$this->debate->title}");
    }

    public function content(): Content
    {
        $sources = count($this->debate->intro_draft['sources'] ?? []);

        return new Content(view: 'mail.action', with: [
            'heading' => 'Uvodni pregled teme čeka odobrenje',
            'greeting' => "Zdravo {$this->debate->moderator?->name},",
            'lines' => [
                "AI je pretražio internet i napisao uvodni pregled za temu „{$this->debate->title}“ ({$sources} izvora).",
                'Pročitajte ga i proverite izvore. Članovi ga vide tek kad ga odobrite; ako treba, napišite smernice i tražite novu verziju.',
            ],
            'actionLabel' => 'Pročitaj i odobri',
            'actionUrl' => rtrim((string) config('app.frontend_url'), '/')."/debate/{$this->debate->slug}",
            'footnote' => 'Ovaj mejl stiže jer ste moderator teme.',
        ]);
    }
}

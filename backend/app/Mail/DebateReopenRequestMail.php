<?php

namespace App\Mail;

use App\Models\DebateReopenRequest;
use App\Services\Ai\DebateAnalyst;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Str;

class DebateReopenRequestMail extends Mailable
{
    use Queueable;

    public function __construct(public DebateReopenRequest $reopen) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Zahtev da se ponovo otvori tema: {$this->reopen->debate->title}");
    }

    public function content(): Content
    {
        $debate = $this->reopen->debate;
        $kind = ucfirst(DebateAnalyst::KIND_LABELS[$this->reopen->kind] ?? $this->reopen->kind);

        return new Content(view: 'mail.action', with: [
            'heading' => 'Član traži da se tema ponovo otvori',
            'greeting' => "Zdravo {$debate->moderator?->name},",
            'lines' => [
                "Zahtev od: {$this->reopen->user?->name}. Tema „{$debate->title}“ je zatvorena, a član želi da kaže ({$kind}):",
                '„'.Str::limit($this->reopen->body, 1500).'“',
                'Ako odobrite, tema se ponovo otvara i ovaj prilog se objavljuje. Član dobija mejl u oba slučaja.',
            ],
            'actionLabel' => 'Pogledaj zahtev',
            'actionUrl' => rtrim((string) config('app.frontend_url'), '/')."/debate/{$debate->slug}",
            'footnote' => 'Ovaj mejl stiže jer ste moderator teme.',
        ]);
    }
}

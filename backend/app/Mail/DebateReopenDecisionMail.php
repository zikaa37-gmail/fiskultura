<?php

namespace App\Mail;

use App\Models\DebateReopenRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class DebateReopenDecisionMail extends Mailable
{
    use Queueable;

    public function __construct(public DebateReopenRequest $reopen) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->approved() ? "Tema je ponovo otvorena: {$this->reopen->debate->title}" : "Zahtev za temu „{$this->reopen->debate->title}“ nije odobren");
    }

    public function content(): Content
    {
        $debate = $this->reopen->debate;
        $lines = $this->approved()
            ? ['Moderator je odobrio vaš zahtev. Tema je ponovo otvorena, a vaš prilog je objavljen.']
            : ['Moderator je pročitao vaš zahtev, ali tema za sada ostaje zatvorena. Sažetak i zaključci rasprave ostaju kakvi jesu.'];
        if ($this->reopen->decision_note) {
            $lines[] = "Poruka moderatora: „{$this->reopen->decision_note}“";
        }

        return new Content(view: 'mail.action', with: [
            'heading' => $this->approved() ? 'Tema je ponovo otvorena' : 'Tema ostaje zatvorena',
            'greeting' => "Zdravo {$this->reopen->user?->name},",
            'lines' => $lines,
            'actionLabel' => 'Otvori temu',
            'actionUrl' => rtrim((string) config('app.frontend_url'), '/')."/debate/{$debate->slug}",
            'footnote' => 'Ovaj mejl stiže jer ste tražili da se tema ponovo otvori.',
        ]);
    }

    private function approved(): bool
    {
        return $this->reopen->status === DebateReopenRequest::APPROVED;
    }
}

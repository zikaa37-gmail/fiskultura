<?php

namespace App\Mail;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class SubscriptionMail extends Mailable
{
    use Queueable;

    public function __construct(public Subscription $subscription, public string $purpose) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->purpose === Subscription::CONFIRM
            ? 'Potvrdi prijavu na obaveštenja portala Fiskultura'
            : 'Podešavanja obaveštenja portala Fiskultura');
    }

    public function content(): Content
    {
        if ($this->purpose === Subscription::CONFIRM) {
            return new Content(view: 'mail.action', with: [
                'heading' => 'Potvrdite prijavu na obaveštenja',
                'greeting' => 'Zdravo,',
                'lines' => [
                    'Neko (verovatno vi) je ovu adresu prijavio na obaveštenja portala Fiskultura o vestima, seminarima i takmičenjima.',
                    'Obaveštenja počinju da stižu tek kada potvrdite prijavu.',
                ],
                'actionLabel' => 'Potvrdi prijavu',
                'actionUrl' => $this->subscription->link('obavestenja/potvrda', Subscription::CONFIRM),
                'footnote' => 'Ako se niste vi prijavili, zanemarite ovaj mejl — bez potvrde vam ništa nećemo slati.',
            ]);
        }

        return new Content(view: 'mail.action', with: [
            'heading' => 'Već ste prijavljeni na obaveštenja',
            'greeting' => 'Zdravo,',
            'lines' => ['Ova adresa već prima obaveštenja portala Fiskultura. Šta pratite i koliko često, menjate na stranici podešavanja.'],
            'actionLabel' => 'Podešavanja obaveštenja',
            'actionUrl' => $this->subscription->link('obavestenja', Subscription::MANAGE),
            'footnote' => 'Ako niste vi tražili ovaj mejl, zanemarite ga — ništa se ne menja.',
        ]);
    }
}

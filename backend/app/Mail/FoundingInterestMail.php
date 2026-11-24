<?php

namespace App\Mail;

use App\Models\FoundingInterest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class FoundingInterestMail extends Mailable
{
    use Queueable;

    public function __construct(public FoundingInterest $interest) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Potvrdite interesovanje za društvo pedagoga u mestu '.$this->interest->city);
    }

    public function content(): Content
    {
        return new Content(view: 'mail.action', with: [
            'heading' => 'Potvrdite interesovanje',
            'greeting' => "Zdravo, {$this->interest->name},",
            'lines' => [
                "Prijavili ste interesovanje za društvo pedagoga fizičke kulture u mestu {$this->interest->city} ({$this->interest->district} okrug).",
                'Kada se prijave bar '.FoundingInterest::THRESHOLD.' kolege iz istog mesta, javićemo svima i Srpskom savezu profesora fizičkog vaspitanja i sporta (SSPFVS), uz imena i mejlove, da možete da se dogovorite.',
                'Prijava se računa tek kada je potvrdite.',
            ],
            'actionLabel' => 'Potvrdi interesovanje',
            'actionUrl' => $this->interest->confirmLink(),
            'footnote' => 'Ako se niste vi prijavili, zanemarite ovaj mejl: bez potvrde vaša adresa se nigde ne prikazuje.',
        ]);
    }
}

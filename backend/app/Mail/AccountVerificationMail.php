<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class AccountVerificationMail extends Mailable
{
    use Queueable;

    public function __construct(public User $user, public string $url) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Potvrdi nalog na portalu Fiskultura');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.action', with: [
            'heading' => 'Dobro došli na Fiskulturu',
            'greeting' => "Zdravo {$this->user->name},",
            'lines' => ['Hvala što ste napravili nalog. Potvrdite mejl adresu klikom na dugme ispod.', 'Link važi 48 sati.'],
            'actionLabel' => 'Potvrdi nalog',
            'actionUrl' => $this->url,
            'footnote' => 'Ako niste vi napravili nalog, slobodno zanemarite ovaj mejl.',
        ]);
    }
}

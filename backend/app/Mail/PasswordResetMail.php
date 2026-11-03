<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class PasswordResetMail extends Mailable
{
    use Queueable;

    public function __construct(public User $user, public string $url) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Nova lozinka za portal Fiskultura');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.action', with: [
            'heading' => 'Postavljanje nove lozinke',
            'greeting' => "Zdravo {$this->user->name},",
            'lines' => ['Primili smo zahtev za novu lozinku za vaš nalog.', 'Link važi 60 minuta.'],
            'actionLabel' => 'Postavi novu lozinku',
            'actionUrl' => $this->url,
            'footnote' => 'Ako niste vi tražili novu lozinku, zanemarite ovaj mejl — stara lozinka i dalje važi.',
        ]);
    }
}

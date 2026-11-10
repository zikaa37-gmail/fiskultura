<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Str;

class UserInvitationMail extends Mailable
{
    use Queueable;

    public function __construct(public User $user, public string $url) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "{$this->firstName()}, pozivamo vas na portal Fiskultura");
    }

    public function content(): Content
    {
        $intro = $this->user->school
            ? "Pišemo baš vama, kao kolegi iz kolektiva {$this->user->school}, jer Fiskulturu pravimo za nastavnike fizičkog vaspitanja u Srbiji."
            : 'Pišemo baš vama jer Fiskulturu pravimo za nastavnike fizičkog vaspitanja u Srbiji i voleli bismo da budete deo nje.';

        return new Content(view: 'mail.action', with: [
            'heading' => 'Lični poziv na portal Fiskultura',
            'greeting' => "Zdravo {$this->firstName()},",
            'lines' => [
                $intro,
                'Na jednom mestu su propisi i njihove izmene objašnjeni jednostavnim rečima, pravila sportova, stručna pitanja i odgovori i vesti strukovnih udruženja.',
                "Nalog na adresi {$this->user->email} je već pripremljen. Ostalo je samo da proverite podatke i postavite lozinku.",
                'Link važi 14 dana i napravljen je samo za vas, pa ga nemojte prosleđivati.',
            ],
            'actionLabel' => 'Završi registraciju',
            'actionUrl' => $this->url,
            'footnote' => 'Ako ne želite nalog, zanemarite ovaj mejl. Obaveštenja vam nećemo slati dok ne završite registraciju.',
        ]);
    }

    private function firstName(): string
    {
        return Str::before(trim($this->user->name), ' ');
    }
}

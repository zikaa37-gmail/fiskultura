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
        return new Envelope(subject: "{$this->firstName()}, završite registraciju na portalu Fiskultura");
    }

    public function content(): Content
    {
        return new Content(view: 'mail.action', with: [
            'heading' => 'Pozivamo vas na portal Fiskultura',
            'greeting' => "Zdravo {$this->firstName()},",
            'lines' => [
                'Fiskulturu pravimo za nastavnike fizičkog vaspitanja u Srbiji i voleli bismo da budete deo nje.',
                'Na jednom mestu su vesti strukovnih udruženja, propisi i njihove izmene objašnjeni jednostavnim rečima, pravila sportova sa uputstvima, stručna pitanja i odgovori i stručne debate kolega.',
                'Ceo sadržaj je besplatan i slobodan za korišćenje, bez plaćanja i pretplate. Dostupan je članovima, pa je potreban nalog.',
                'Registracija nam je potrebna da bismo imali kontakt sa kolegama i mogli da vas obavestimo o seminarima, akcijama koje organizujemo i važnim temama za našu struku.',
                "Nalog na adresi {$this->user->email} je već pripremljen. Ostalo je samo da proverite podatke i postavite lozinku, za to vam treba minut.",
                'Link važi 14 dana i napravljen je samo za vas, pa ga nemojte prosleđivati.',
            ],
            'actionLabel' => 'Završi registraciju',
            'actionUrl' => $this->url,
            'socialsTitle' => 'Pratite Fiskulturu i na mrežama',
            'socials' => [
                ['label' => 'Instagram @fiskultura_rs', 'url' => config('social.links.instagram')],
                ['label' => 'Facebook', 'url' => config('social.links.facebook')],
            ],
            'footnote' => 'Ako ne želite nalog, samo zanemarite ovaj mejl. Dok ne završite registraciju, ništa vam nećemo slati.',
        ]);
    }

    private function firstName(): string
    {
        return Str::before(trim($this->user->name), ' ');
    }
}

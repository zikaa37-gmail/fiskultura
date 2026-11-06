<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class RegulationChangesMail extends Mailable
{
    use Queueable;

    public function __construct(public array $lines) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Propisi za proveru na portalu Fiskultura');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.action', with: [
            'heading' => 'Promene u propisima',
            'greeting' => 'Zdravo,',
            'lines' => [
                'Nedeljna provera Pravno-informacionog sistema našla je izmene propisa koje portal navodi. Pročitajte izmenu, ažurirajte sažetak, teme i pitanja koja se na propis pozivaju, pa označite propis kao proveren.',
                ...$this->lines,
            ],
            'actionLabel' => 'Otvori propise za proveru',
            'actionUrl' => rtrim((string) config('app.frontend_url'), '/').'/admin/propisi',
            'footnote' => 'Ništa se ne menja na portalu samo od sebe; urednik pregleda i odobri svaku izmenu.',
        ]);
    }
}

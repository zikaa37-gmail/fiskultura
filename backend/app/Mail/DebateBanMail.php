<?php

namespace App\Mail;

use App\Models\DebateBan;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class DebateBanMail extends Mailable
{
    use Queueable;

    public function __construct(public DebateBan $ban) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Zabrana pisanja u stručnim debatama na portalu Fiskultura');
    }

    public function content(): Content
    {
        $debate = $this->ban->debate;

        return new Content(view: 'mail.action', with: [
            'heading' => 'Privremeno ne možete da pišete priloge',
            'greeting' => "Zdravo {$this->ban->user?->name},",
            'lines' => [
                $this->ban->message(),
                'I dalje možete da čitate teme i reagujete na priloge. Ako mislite da je odluka pogrešna, odgovorite na ovaj mejl ili pišite uredništvu preko stranice Kontakt.',
            ],
            'actionLabel' => $debate ? 'Otvori temu' : 'Stručne debate',
            'actionUrl' => rtrim((string) config('app.frontend_url'), '/').($debate ? "/debate/{$debate->slug}" : '/debate'),
            'footnote' => 'Pravila: pišite o temi, bez ličnih napada i uvreda.',
        ]);
    }
}

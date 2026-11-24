<?php

namespace App\Mail;

use App\Models\FoundingInterest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Collection;

class FoundingGroupMail extends Mailable
{
    use Queueable;

    public function __construct(public Collection $group, public bool $forFederation) {}

    public function envelope(): Envelope
    {
        $first = $this->group->first();

        return new Envelope(subject: $this->forFederation
            ? "Kolege iz mesta {$first->city} žele da osnuju društvo pedagoga"
            : "Kolege iz mesta {$first->city} su se javile: možete da osnujete društvo");
    }

    public function content(): Content
    {
        $first = $this->group->first();
        $people = $this->group->map(fn (FoundingInterest $interest) => '• '.$interest->name.' — '.$interest->email.($interest->school ? ' ('.$interest->school.')' : ''))->all();

        $intro = $this->forFederation
            ? [
                "Preko portala Fiskultura {$this->group->count()} nastavnika fizičkog vaspitanja iz mesta {$first->city} ({$first->district} okrug) prijavilo je i mejlom potvrdilo da žele da osnuju društvo pedagoga fizičke kulture.",
                'Saglasni su da im se javite. Kontakti:',
            ]
            : [
                "Za društvo pedagoga fizičke kulture u mestu {$first->city} sada je prijavljeno {$this->group->count()} kolega. Svi su saglasni da se kontakti podele, pa možete direktno da se dogovorite:",
            ];

        $outro = $this->forFederation
            ? ['Kolege su dobile isti spisak i uputstvo za osnivanje.']
            : ['Istu poruku je dobio i Srpski savez profesora fizičkog vaspitanja i sporta (SSPFVS), koji može da pomogne oko statuta i učlanjenja. Koraci, primer statuta i APR obrasci su na portalu.'];

        return new Content(view: 'mail.action', with: [
            'heading' => $this->forFederation ? 'Nova inicijativa za društvo pedagoga' : 'Možete da osnujete društvo',
            'greeting' => 'Zdravo,',
            'lines' => [...$intro, ...$people, ...$outro],
            'actionLabel' => 'Kako se osniva društvo',
            'actionUrl' => rtrim((string) config('app.frontend_url'), '/').'/udruzenja/osnivanje',
            'footnote' => 'Poruka je poslata jer je u mestu skupljeno bar '.FoundingInterest::THRESHOLD.' potvrđene prijave na portalu Fiskultura.',
        ]);
    }
}

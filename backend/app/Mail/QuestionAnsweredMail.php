<?php

namespace App\Mail;

use App\Models\Question;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class QuestionAnsweredMail extends Mailable
{
    use Queueable;

    public function __construct(public Question $question) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Odgovor na vaše pitanje na portalu Fiskultura');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.action', with: [
            'heading' => 'Objavljen je odgovor na vaše pitanje',
            'greeting' => "Zdravo {$this->question->asker?->name},",
            'lines' => [
                "Urednik je odgovorio na pitanje „{$this->question->title}“. Odgovor je objavljen bez vašeg imena, da pomogne i drugim kolegama.",
            ],
            'actionLabel' => 'Pročitaj odgovor',
            'actionUrl' => rtrim((string) config('app.frontend_url'), '/')."/pitanja/{$this->question->slug}",
            'footnote' => 'Odgovor je informacija o propisima na dan objave, a ne pravni savet. Za konkretan slučaj obratite se sekretaru škole ili sindikatu.',
        ]);
    }
}

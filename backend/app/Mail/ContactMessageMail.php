<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class ContactMessageMail extends Mailable
{
    use Queueable;

    private const TOPICS = [
        'pitanje' => 'Pitanje',
        'greska' => 'Greška na portalu',
        'predlog' => 'Predlog',
        'saradnja' => 'Saradnja',
        'drugo' => 'Drugo',
    ];

    public function __construct(public array $data) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address($this->data['email'], $this->data['name'])],
            subject: 'Poruka uredništvu: '.(self::TOPICS[$this->data['topic']] ?? 'Drugo'),
        );
    }

    public function content(): Content
    {
        return new Content(view: 'mail.contact', with: [
            'heading' => 'Nova poruka uredništvu',
            'topic' => self::TOPICS[$this->data['topic']] ?? 'Drugo',
            'name' => $this->data['name'],
            'email' => $this->data['email'],
            'body' => $this->data['message'],
        ]);
    }
}

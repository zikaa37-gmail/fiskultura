<?php

namespace App\Mail;

use App\Services\Notifications\Notice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;

class NoticeMail extends Mailable
{
    use Queueable;

    public function __construct(public Notice $notice) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->notice->subject);
    }

    public function headers(): Headers
    {
        return new Headers(text: [
            'List-Unsubscribe' => "<{$this->notice->oneClickUnsubscribeUrl}>",
            'List-Unsubscribe-Post' => 'List-Unsubscribe=One-Click',
        ]);
    }

    public function content(): Content
    {
        return new Content(view: 'mail.notice', with: ['notice' => $this->notice, 'heading' => $this->notice->heading]);
    }
}

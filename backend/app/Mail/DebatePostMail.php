<?php

namespace App\Mail;

use App\Models\DebatePost;
use App\Services\Ai\DebateAnalyst;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Str;

class DebatePostMail extends Mailable
{
    use Queueable;

    public function __construct(public DebatePost $post) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Novi prilog u debati: {$this->post->debate->title}");
    }

    public function content(): Content
    {
        $debate = $this->post->debate;
        $kind = ucfirst(DebateAnalyst::KIND_LABELS[$this->post->kind] ?? $this->post->kind);

        return new Content(view: 'mail.action', with: [
            'heading' => 'Novi prilog u vašoj temi',
            'greeting' => "Zdravo {$debate->moderator?->name},",
            'lines' => [
                "Novi prilog od: {$this->post->author?->name}, u temi „{$debate->title}“ ({$kind}):",
                '„'.Str::limit($this->post->body, 1200).'“',
                "Tema sada ima {$debate->posts_count} priloga.",
            ],
            'actionLabel' => 'Otvori temu',
            'actionUrl' => rtrim((string) config('app.frontend_url'), '/')."/debate/{$debate->slug}",
            'footnote' => 'Ovaj mejl stiže jer ste moderator teme. Neprimeren prilog možete da sakrijete iz menija pored priloga.',
        ]);
    }
}

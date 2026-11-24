<?php

namespace App\Mail;

use App\Models\FacilitySubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class FacilitySubmissionReviewedMail extends Mailable
{
    use Queueable;

    public function __construct(public FacilitySubmission $submission) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->approved() ? 'Vaši podaci o školi su objavljeni' : 'Vaš predlog podataka o školi nije prihvaćen');
    }

    public function content(): Content
    {
        $school = $this->submission->institution?->name ?? 'škola';

        return new Content(view: 'mail.action', with: [
            'heading' => $this->approved() ? 'Hvala, podaci su objavljeni' : 'Predlog nije prihvaćen',
            'greeting' => "Zdravo {$this->submission->user?->name},",
            'lines' => array_values(array_filter([
                $this->approved()
                    ? "Urednik je proverio i objavio podatke o infrastrukturi za {$school}. Sada ih vide sve kolege u Imeniku i ulaze u izveštaje."
                    : "Urednik nije prihvatio predlog podataka o infrastrukturi za {$school}.",
                $this->submission->review_note ? "Napomena urednika: {$this->submission->review_note}" : null,
            ])),
            'actionLabel' => 'Otvori Imenik',
            'actionUrl' => rtrim((string) config('app.frontend_url'), '/').'/imenik/'.($this->submission->institution?->type === 'srednja' ? 'srednje-skole' : 'osnovne-skole'),
            'footnote' => 'Podatke možete dopuniti kad god se nešto promeni.',
        ]);
    }

    private function approved(): bool
    {
        return $this->submission->status === FacilitySubmission::APPROVED;
    }
}

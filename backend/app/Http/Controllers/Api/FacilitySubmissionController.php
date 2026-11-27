<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\FacilitySubmissionReviewedMail;
use App\Models\FacilitySubmission;
use App\Models\Institution;
use App\Models\User;
use App\Services\Facilities\FacilityCatalog;
use App\Services\Inbox;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Throwable;

class FacilitySubmissionController extends Controller
{
    public function __construct(private readonly FacilityCatalog $catalog, private readonly Inbox $inbox) {}

    public function store(Request $request, Institution $institution)
    {
        $user = $request->user();
        abort_unless($user->email_verified_at, 403, 'Potvrdite mejl pre slanja podataka.');
        abort_unless($user->hasRole(User::EDITOR, User::ADMIN) || $user->worksAt($institution), 403, 'Podatke možete upisati samo za školu u kojoj radite. Dodajte je u profil.');
        $data = $request->validate(['facilities' => ['required', 'array']]);
        $facilities = $this->catalog->normalize($data['facilities']);
        abort_if($facilities === [], 422, 'Upišite bar jedan podatak.');

        $submission = FacilitySubmission::updateOrCreate(
            ['institution_id' => $institution->id, 'user_id' => $user->id, 'status' => FacilitySubmission::PENDING],
            ['facilities' => $facilities],
        );

        if ($submission->wasRecentlyCreated) {
            $editors = User::whereIn('role', [User::EDITOR, User::ADMIN])->whereNull('blocked_at')->get();
            $this->inbox->record($editors, 'facility_submission', "Novi podaci o infrastrukturi: {$institution->name}", "Poslao/la: {$user->name}", '/admin/infrastruktura', ['site']);
        }

        return response()->json([
            'message' => 'Hvala! Podaci su poslati uredništvu. Videćete ih u Imeniku kad urednik proveri.',
            'submission' => $submission->load('institution', 'user')->present(),
        ], 201);
    }

    public function index(Request $request)
    {
        $data = $request->validate(['status' => ['nullable', Rule::in([FacilitySubmission::PENDING, FacilitySubmission::APPROVED, FacilitySubmission::REJECTED])]]);

        $page = FacilitySubmission::with('institution', 'user', 'reviewer')
            ->where('status', $data['status'] ?? FacilitySubmission::PENDING)
            ->latest('id')
            ->paginate(30);

        return response()->json([
            'data' => $page->getCollection()->map(fn (FacilitySubmission $submission) => $submission->present())->values(),
            'meta' => ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()],
        ]);
    }

    public function approve(Request $request, FacilitySubmission $submission)
    {
        abort_unless($submission->status === FacilitySubmission::PENDING, 422, 'Predlog je već obrađen.');
        $data = $request->validate(['note' => ['nullable', 'string', 'max:500']]);

        $reviewer = $request->user();
        $submission->institution->applyFacilities($submission->facilities, 'provereno', "Kolega {$submission->user?->name}, proverio/la {$reviewer->name}", $reviewer);
        $submission->update(['status' => FacilitySubmission::APPROVED, 'review_note' => $data['note'] ?? null, 'reviewed_by' => $reviewer->id, 'reviewed_at' => now()]);
        $this->notify($submission);

        return response()->json($submission->fresh(['institution', 'user', 'reviewer'])->present());
    }

    public function reject(Request $request, FacilitySubmission $submission)
    {
        abort_unless($submission->status === FacilitySubmission::PENDING, 422, 'Predlog je već obrađen.');
        $data = $request->validate(['note' => ['required', 'string', 'min:5', 'max:500']], ['note.required' => 'Napišite razlog, kolega ga dobija mejlom.']);
        $submission->update(['status' => FacilitySubmission::REJECTED, 'review_note' => $data['note'], 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()]);
        $this->notify($submission);

        return response()->json($submission->fresh(['institution', 'user', 'reviewer'])->present());
    }

    private function notify(FacilitySubmission $submission): void
    {
        $user = $submission->user;
        if (! $user || $user->isBlocked()) {
            return;
        }
        try {
            Mail::to($user->email)->send(new FacilitySubmissionReviewedMail($submission));
        } catch (Throwable $error) {
            report($error);
        }
        $approved = $submission->status === FacilitySubmission::APPROVED;
        $school = $submission->institution?->name;
        $this->inbox->record(
            $user,
            'facility_review',
            $approved ? "Objavljeni podaci: {$school}" : "Predlog nije prihvaćen: {$school}",
            $submission->review_note,
            '/imenik/'.($submission->institution?->type === 'srednja' ? 'srednje-skole' : 'osnovne-skole'),
        );
    }
}

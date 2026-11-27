<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\FoundingGroupMail;
use App\Mail\FoundingInterestMail;
use App\Models\FoundingInterest;
use App\Models\Organization;
use App\Support\Districts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class FoundingController extends Controller
{
    private const RESEND_AFTER_MINUTES = 5;

    private const LOCAL_LEVELS = ['okružni', 'gradski', 'opštinski'];

    public function coverage()
    {
        $organizations = Organization::where('type', 'strukovno-udruzenje')
            ->whereIn('level', self::LOCAL_LEVELS)
            ->whereNotNull('district')
            ->orderBy('name')
            ->get(['slug', 'name', 'short_name', 'city', 'district', 'status'])
            ->groupBy('district');

        $interests = FoundingInterest::confirmed()
            ->select('district', 'city_key', DB::raw('MIN(city) as city'), DB::raw('COUNT(*) as people'))
            ->groupBy('district', 'city_key')
            ->get()
            ->groupBy('district');

        return response()->json([
            'threshold' => FoundingInterest::THRESHOLD,
            'districts' => collect(Districts::ALL)->map(function (string $district) use ($organizations, $interests) {
                $local = $organizations->get($district, collect());

                return [
                    'district' => $district,
                    'status' => $local->contains('status', 'aktivno') ? 'aktivno' : ($local->isNotEmpty() ? 'nepoznato' : 'nema'),
                    'organizations' => $local->map(fn (Organization $organization) => [
                        'slug' => $organization->slug,
                        'name' => $organization->short_name ?: $organization->name,
                        'city' => $organization->city,
                        'status' => $organization->status,
                    ])->values(),
                    'interest' => $interests->get($district, collect())
                        ->map(fn ($row) => ['city' => $row->city, 'people' => (int) $row->people])
                        ->sortByDesc('people')
                        ->values(),
                ];
            })->values(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'district' => ['required', Rule::in(Districts::ALL)],
            'city' => ['required', 'string', 'min:2', 'max:120'],
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'school' => ['nullable', 'string', 'max:190'],
            'consent' => ['accepted'],
        ], [
            'consent.accepted' => 'Potrebna je saglasnost da kolege i SSPFVS dobiju vaše ime i mejl.',
        ]);

        $city = trim($data['city']);
        $interest = FoundingInterest::firstOrNew([
            'email' => Str::lower($data['email']),
            'city_key' => FoundingInterest::cityKey($city),
        ]);

        if ($interest->exists && $interest->confirmed_at) {
            return response()->json(['message' => "Već ste prijavljeni za mesto {$interest->city}. Javićemo vam kada se skupi dovoljno kolega."]);
        }

        $interest->fill([
            'district' => $data['district'],
            'city' => $city,
            'name' => trim($data['name']),
            'school' => isset($data['school']) ? trim($data['school']) : null,
        ])->save();

        $this->sendConfirmation($interest);

        return response()->json(['message' => 'Proverite mejl: prijava se računa tek kada je potvrdite linkom iz poruke.']);
    }

    public function confirm(Request $request)
    {
        $id = $request->input('id');
        $interest = is_numeric($id) ? FoundingInterest::find((int) $id) : null;
        $token = $request->input('token');
        abort_unless($interest && $interest->hasToken(is_string($token) ? $token : null), 404, 'Link nije ispravan ili prijava više ne postoji.');

        if (! $interest->confirmed_at) {
            $interest->forceFill(['confirmed_at' => now()])->save();
            $this->notifyGroup($interest);
        }

        $people = FoundingInterest::confirmed()->where('city_key', $interest->city_key)->count();

        return response()->json([
            'city' => $interest->city,
            'district' => $interest->district,
            'people' => $people,
            'threshold' => FoundingInterest::THRESHOLD,
        ]);
    }

    private function sendConfirmation(FoundingInterest $interest): void
    {
        if ($interest->confirmation_sent_at?->gt(now()->subMinutes(self::RESEND_AFTER_MINUTES))) {
            return;
        }

        $interest->forceFill(['confirmation_sent_at' => now()])->save();
        try {
            Mail::to($interest->email)->send(new FoundingInterestMail($interest));
        } catch (Throwable $exception) {
            Log::warning('Founding interest confirmation failed', ['id' => $interest->id, 'error' => $exception->getMessage()]);
        }
    }

    private function notifyGroup(FoundingInterest $interest): void
    {
        $group = FoundingInterest::confirmed()->where('city_key', $interest->city_key)->orderBy('confirmed_at')->get();
        $waiting = $group->whereNull('notified_at');

        if ($group->count() < FoundingInterest::THRESHOLD || $waiting->isEmpty()) {
            return;
        }

        try {
            foreach ($waiting as $member) {
                Mail::to($member->email)->send(new FoundingGroupMail($group, false));
            }
            $federation = Organization::where('slug', 'sspfvs')->value('email');
            if ($federation) {
                Mail::to($federation)->send(new FoundingGroupMail($group, true));
            }
            FoundingInterest::whereIn('id', $waiting->pluck('id'))->update(['notified_at' => now()]);
        } catch (Throwable $exception) {
            Log::warning('Founding group notification failed', ['city' => $interest->city_key, 'error' => $exception->getMessage()]);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserToken;
use App\Rules\PhoneNumber;
use App\Services\UserTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class InvitationController extends Controller
{
    public function __construct(private UserTokenService $tokens) {}

    public function show(Request $request)
    {
        $data = $request->validate(['token' => ['required', 'string']]);
        $user = $this->tokens->peek($data['token'], UserToken::INVITATION);

        if (! $user || $user->isBlocked()) {
            $this->fail();
        }

        return response()->json($user->only(['name', 'email', 'phone', 'member_status', 'school', 'municipality', 'district']));
    }

    public function complete(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:40', new PhoneNumber],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
            'member_status' => ['nullable', Rule::in(User::MEMBER_STATUSES)],
            'school' => ['nullable', 'string', 'max:190'],
            'municipality' => ['nullable', 'string', 'max:120'],
            'district' => ['nullable', 'string', 'max:120'],
            'directory_consent' => ['sometimes', 'boolean'],
            'surveys_consent' => ['sometimes', 'boolean'],
        ]);

        $pending = $this->tokens->peek($data['token'], UserToken::INVITATION);

        if (! $pending || $pending->isBlocked()) {
            $this->fail();
        }

        DB::transaction(function () use ($data) {
            $user = $this->tokens->consume($data['token'], UserToken::INVITATION);
            $user->fill(array_intersect_key($data, array_flip(['name', 'phone', 'member_status', 'school', 'municipality', 'district'])));
            $user->forceFill([
                'password' => $data['password'],
                'email_verified_at' => $user->email_verified_at ?? now(),
                'directory_consent_at' => ($data['directory_consent'] ?? true) ? now() : null,
                'surveys_consent_at' => ($data['surveys_consent'] ?? true) ? now() : null,
            ])->save();
            Subscription::ensureFor($user);
        });

        return response()->json(['message' => 'Registracija je završena. Prijavite se svojom lozinkom.']);
    }

    private function fail(): never
    {
        throw ValidationException::withMessages(['token' => ['Poziv je istekao ili je već iskorišćen. Zatražite novi od uredništva.']]);
    }
}

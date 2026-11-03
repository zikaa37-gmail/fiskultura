<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AccountVerificationMail;
use App\Mail\PasswordResetMail;
use App\Models\RefreshToken;
use App\Models\User;
use App\Models\UserToken;
use App\Services\JwtService;
use App\Services\UserTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const VERIFY_TTL_MINUTES = 2880;

    private const RESET_TTL_MINUTES = 60;

    public function __construct(private JwtService $jwt, private UserTokenService $tokens) {}

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
            'school' => ['nullable', 'string', 'max:190'],
            'municipality' => ['nullable', 'string', 'max:120'],
            'district' => ['nullable', 'string', 'max:120'],
        ]);

        $user = User::create([...$data, 'email' => Str::lower($data['email']), 'role' => User::TEACHER]);

        $this->sendVerification($user);

        return response()->json(['message' => 'Nalog je napravljen. Proverite mejl i potvrdite adresu.'], 201);
    }

    public function verifyEmail(Request $request)
    {
        $data = $request->validate(['token' => ['required', 'string']]);

        $user = $this->tokens->consume($data['token'], UserToken::VERIFY_EMAIL);

        if (! $user) {
            throw ValidationException::withMessages(['token' => ['Link za potvrdu je istekao ili je već iskorišćen.']]);
        }

        if (! $user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        return response()->json($this->tokensFor($user));
    }

    public function resendVerification(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', Str::lower($data['email']))->first();

        if ($user && ! $user->email_verified_at) {
            $this->sendVerification($user);
        }

        return response()->json(['message' => 'Ako nalog postoji i nije potvrđen, poslali smo novi link.']);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', Str::lower($credentials['email']))->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Pogrešan mejl ili lozinka.']]);
        }

        if ($user->isBlocked()) {
            throw ValidationException::withMessages(['email' => ['Nalog je blokiran. Javite se administratoru.']]);
        }

        if (! $user->email_verified_at) {
            throw ValidationException::withMessages(['email' => ['Mejl adresa još nije potvrđena. Proverite poštu ili zatražite novi link.']]);
        }

        return response()->json($this->tokensFor($user));
    }

    public function refresh(Request $request)
    {
        $data = $request->validate(['refresh_token' => ['required', 'string']]);

        $stored = RefreshToken::where('token_hash', hash('sha256', $data['refresh_token']))->first();

        if (! $stored || ! $stored->isValid() || $stored->user->isBlocked()) {
            throw ValidationException::withMessages(['refresh_token' => ['Sesija je istekla. Potrebna je ponovna prijava.']]);
        }

        $stored->update(['revoked_at' => now()]);

        return response()->json($this->tokensFor($stored->user));
    }

    public function logout(Request $request)
    {
        $data = $request->validate(['refresh_token' => ['sometimes', 'nullable', 'string']]);

        if (! empty($data['refresh_token'])) {
            RefreshToken::where('token_hash', hash('sha256', $data['refresh_token']))->update(['revoked_at' => now()]);
        }

        return response()->json(['message' => 'Odjavljeni ste.']);
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', Str::lower($data['email']))->first();

        if ($user && ! $user->isBlocked()) {
            $token = $this->tokens->issue($user, UserToken::RESET_PASSWORD, self::RESET_TTL_MINUTES);
            Mail::to($user->email)->send(new PasswordResetMail($user, $this->frontendUrl('nova-lozinka', $token)));
        }

        return response()->json(['message' => 'Ako nalog postoji, poslali smo link za novu lozinku.']);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ]);

        $user = $this->tokens->consume($data['token'], UserToken::RESET_PASSWORD);

        if (! $user) {
            throw ValidationException::withMessages(['token' => ['Link za novu lozinku je istekao ili je već iskorišćen.']]);
        }

        $user->forceFill([
            'password' => $data['password'],
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();
        $user->refreshTokens()->update(['revoked_at' => now()]);

        return response()->json(['message' => 'Lozinka je promenjena. Prijavite se novom lozinkom.']);
    }

    public function me(Request $request)
    {
        return response()->json($this->presentUser($request->user()));
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'school' => ['nullable', 'string', 'max:190'],
            'municipality' => ['nullable', 'string', 'max:120'],
            'district' => ['nullable', 'string', 'max:120'],
        ]);

        $user = $request->user();
        $user->update($data);

        return response()->json($this->presentUser($user));
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages(['current_password' => ['Trenutna lozinka nije tačna.']]);
        }

        $user->forceFill(['password' => $data['password']])->save();
        $user->refreshTokens()->update(['revoked_at' => now()]);

        return response()->json(['message' => 'Lozinka je promenjena. Prijavite se ponovo.']);
    }

    private function sendVerification(User $user): void
    {
        $token = $this->tokens->issue($user, UserToken::VERIFY_EMAIL, self::VERIFY_TTL_MINUTES);
        Mail::to($user->email)->send(new AccountVerificationMail($user, $this->frontendUrl('potvrda-naloga', $token)));
    }

    private function frontendUrl(string $path, string $token): string
    {
        return rtrim((string) config('app.frontend_url'), '/')."/{$path}?token={$token}";
    }

    private function tokensFor(User $user): array
    {
        $refreshToken = Str::random(80);

        $user->refreshTokens()->create([
            'token_hash' => hash('sha256', $refreshToken),
            'expires_at' => now()->addDays((int) config('auth_jwt.refresh_ttl_days')),
        ]);

        return [
            'access_token' => $this->jwt->issueAccessToken($user),
            'refresh_token' => $refreshToken,
            'user' => $this->presentUser($user),
        ];
    }

    private function presentUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'school' => $user->school,
            'municipality' => $user->municipality,
            'district' => $user->district,
        ];
    }
}

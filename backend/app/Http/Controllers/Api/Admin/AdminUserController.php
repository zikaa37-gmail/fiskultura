<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserInvitationMail;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserToken;
use App\Rules\PhoneNumber;
use App\Services\UserTokenService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class AdminUserController extends Controller
{
    private const INVITE_TTL_MINUTES = 20160;

    public function __construct(private UserTokenService $tokens) {}

    public function list(Request $request)
    {
        $filters = $request->validate([
            'role' => ['nullable', Rule::in(User::ROLES)],
            'pending' => ['nullable', 'boolean'],
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $page = User::query()
            ->when($filters['role'] ?? null, fn (Builder $query, string $role) => $query->where('role', $role))
            ->when($filters['pending'] ?? false, fn (Builder $query) => $query->whereNull('email_verified_at')->whereNull('blocked_at'))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $inner) => $inner
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('school', 'like', "%{$search}%")
                ->orWhere('municipality', 'like', "%{$search}%")))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 50, page: $filters['page'] ?? 1);

        return response()->json([
            'data' => $page->getCollection()->map(fn (User $user) => $this->present($user))->values(),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->lowercaseEmail($request);
        $data = $request->validate([
            ...$this->profileRules(),
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'role' => ['required', Rule::in(User::ROLES)],
            'password' => ['sometimes', 'nullable', 'string'],
        ]);

        if ($this->isPromotionToStaff(User::USER, $data['role']) && ! Hash::check((string) ($data['password'] ?? ''), $request->user()->password)) {
            return $this->wrongPassword();
        }

        $user = DB::transaction(function () use ($data) {
            $user = User::create([...Arr::except($data, ['password']), 'password' => Str::random(40)]);
            $this->sendInvitation($user);

            return $user;
        });

        return response()->json($this->present($user), 201);
    }

    public function invite(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:50'],
            'ids.*' => ['integer', 'distinct'],
        ]);

        $users = User::whereIn('id', $data['ids'])->whereNull('email_verified_at')->whereNull('blocked_at')->get();
        $failed = 0;

        foreach ($users as $user) {
            try {
                $this->sendInvitation($user);
            } catch (Throwable $exception) {
                report($exception);
                $failed++;
            }
        }

        return response()->json(['sent' => $users->count() - $failed, 'failed' => $failed, 'skipped' => count($data['ids']) - $users->count()]);
    }

    public function update(Request $request, User $user)
    {
        $this->lowercaseEmail($request);
        $data = $request->validate([
            ...$this->profileRules(),
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'email' => ['sometimes', 'required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['sometimes', Rule::in(User::ROLES)],
            'blocked' => ['sometimes', 'boolean'],
            'password' => ['sometimes', 'nullable', 'string'],
        ]);

        if ($user->is($request->user())) {
            return response()->json(['message' => 'Svoju ulogu i pristup ne možete menjati sami.', 'errors' => ['role' => ['Svoju ulogu i pristup ne možete menjati sami.']]], 422);
        }

        if (array_key_exists('role', $data) && $this->isPromotionToStaff($user->role, $data['role']) && ! Hash::check((string) ($data['password'] ?? ''), $request->user()->password)) {
            return $this->wrongPassword();
        }

        if (array_key_exists('role', $data)) {
            $user->role = $data['role'];
        }

        $user->fill(Arr::only($data, ['name', 'phone', 'member_status', 'school', 'municipality', 'district']));

        if (array_key_exists('email', $data)) {
            $this->changeEmail($user, $data['email']);
        }

        if (array_key_exists('blocked', $data)) {
            $user->blocked_at = $data['blocked'] ? ($user->blocked_at ?? now()) : null;
            if ($data['blocked']) {
                $user->refreshTokens()->update(['revoked_at' => now()]);
            }
        }

        $user->save();

        return response()->json($this->present($user));
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->is($request->user())) {
            return response()->json(['message' => 'Svoj nalog ne možete obrisati ovde.', 'errors' => ['user' => ['Svoj nalog ne možete obrisati ovde.']]], 422);
        }

        DB::transaction(function () use ($user) {
            Subscription::where('user_id', $user->id)->orWhere('email', $user->email)->delete();
            $user->delete();
        });

        return response()->json(['message' => 'Korisnik je obrisan.']);
    }

    private function lowercaseEmail(Request $request): void
    {
        if (is_string($request->input('email'))) {
            $request->merge(['email' => Str::lower($request->input('email'))]);
        }
    }

    private function sendInvitation(User $user): void
    {
        $token = $this->tokens->issue($user, UserToken::INVITATION, self::INVITE_TTL_MINUTES);
        Mail::to($user->email)->send(new UserInvitationMail($user, rtrim((string) config('app.frontend_url'), '/')."/zavrsi-registraciju?token={$token}"));
        $user->forceFill(['invited_at' => now()])->save();
    }

    private function profileRules(): array
    {
        return [
            'phone' => ['sometimes', 'nullable', 'string', 'max:40', new PhoneNumber],
            'member_status' => ['sometimes', 'nullable', Rule::in(User::MEMBER_STATUSES)],
            'school' => ['sometimes', 'nullable', 'string', 'max:190'],
            'municipality' => ['sometimes', 'nullable', 'string', 'max:120'],
            'district' => ['sometimes', 'nullable', 'string', 'max:120'],
        ];
    }

    private function changeEmail(User $user, string $email): void
    {
        if ($email !== $user->email && ! Subscription::where('email', $email)->exists()) {
            Subscription::where('email', $user->email)->update(['email' => $email]);
        }

        $user->email = $email;
    }

    private function wrongPassword()
    {
        return response()->json(['message' => 'Lozinka nije tačna.', 'errors' => ['password' => ['Lozinka nije tačna.']]], 422);
    }

    private function isPromotionToStaff(string $current, string $new): bool
    {
        return in_array($new, [User::EDITOR, User::ADMIN], true)
            && array_search($new, User::ROLES, true) > array_search($current, User::ROLES, true);
    }

    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'member_status' => $user->member_status,
            'school' => $user->school,
            'municipality' => $user->municipality,
            'district' => $user->district,
            'source' => $user->source,
            'verified' => $user->email_verified_at !== null,
            'blocked' => $user->isBlocked(),
            'invited_at' => $user->invited_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
            'last_active_at' => $user->last_active_at?->toIso8601String(),
        ];
    }
}

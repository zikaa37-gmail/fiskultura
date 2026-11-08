<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function list(Request $request)
    {
        $filters = $request->validate([
            'role' => ['nullable', Rule::in(User::ROLES)],
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $page = User::query()
            ->when($filters['role'] ?? null, fn (Builder $query, string $role) => $query->where('role', $role))
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

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => ['sometimes', Rule::in(User::ROLES)],
            'blocked' => ['sometimes', 'boolean'],
        ]);

        if ($user->is($request->user())) {
            return response()->json(['message' => 'Svoju ulogu i pristup ne možete menjati sami.', 'errors' => ['role' => ['Svoju ulogu i pristup ne možete menjati sami.']]], 422);
        }

        if (array_key_exists('role', $data)) {
            $user->role = $data['role'];
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

    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'member_status' => $user->member_status,
            'school' => $user->school,
            'municipality' => $user->municipality,
            'district' => $user->district,
            'source' => $user->source,
            'verified' => $user->email_verified_at !== null,
            'blocked' => $user->isBlocked(),
            'created_at' => $user->created_at?->toIso8601String(),
            'last_active_at' => $user->last_active_at?->toIso8601String(),
        ];
    }
}

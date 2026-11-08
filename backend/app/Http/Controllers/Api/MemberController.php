<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'member_status' => ['nullable', Rule::in(User::MEMBER_STATUSES)],
            'district' => ['nullable', 'string', 'max:120'],
            'q' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        if (! $request->user()->directory_consent_at) {
            return response()->json(['message' => 'Imenik vide članovi koji su i sami u njemu. Uključite saglasnost u profilu.', 'code' => 'directory_consent_required'], 403);
        }

        $page = User::query()
            ->inDirectory()
            ->when($filters['member_status'] ?? null, fn (Builder $query, string $status) => $query->where('member_status', $status))
            ->when($filters['district'] ?? null, fn (Builder $query, string $district) => $query->where('district', $district))
            ->when($filters['q'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $inner) => $inner
                ->where('name', 'like', "%{$search}%")
                ->orWhere('school', 'like', "%{$search}%")
                ->orWhere('municipality', 'like', "%{$search}%")))
            ->orderBy('name')
            ->paginate(30, page: $filters['page'] ?? 1);

        return response()->json([
            'data' => $page->getCollection()->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'member_status' => $user->member_status,
                'school' => $user->school,
                'municipality' => $user->municipality,
                'district' => $user->district,
            ])->values(),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
        ]);
    }

    public function stats()
    {
        $members = User::query()->whereNotNull('email_verified_at')->whereNull('blocked_at');

        return response()->json([
            'total' => (clone $members)->count(),
            'unverified' => User::whereNull('email_verified_at')->count(),
            'new_7_days' => (clone $members)->where('created_at', '>=', now()->subDays(7))->count(),
            'new_30_days' => (clone $members)->where('created_at', '>=', now()->subDays(30))->count(),
            'active_30_days' => (clone $members)->where('last_active_at', '>=', now()->subDays(30))->count(),
            'in_directory' => (clone $members)->whereNotNull('directory_consent_at')->count(),
            'surveys_consent' => (clone $members)->whereNotNull('surveys_consent_at')->count(),
            'by_status' => $this->countBy(clone $members, 'member_status'),
            'by_district' => $this->countBy(clone $members, 'district'),
            'by_source' => $this->countBy(clone $members, 'source'),
        ]);
    }

    private function countBy(Builder $query, string $column): array
    {
        return $query
            ->selectRaw("{$column} as value, count(*) as total")
            ->groupBy($column)
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['value' => $row->value, 'total' => (int) $row->total])
            ->all();
    }
}

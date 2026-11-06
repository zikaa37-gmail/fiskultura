<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Regulation;
use App\Models\RegulationVersion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class RegulationController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'kind' => ['nullable', Rule::in(Regulation::KINDS)],
            'area' => ['nullable', Rule::in(Regulation::AREAS)],
            'q' => ['nullable', 'string', 'max:100'],
            'updated_since' => ['nullable', 'date'],
        ]);

        $regulations = Regulation::query()
            ->withCount('versions')
            ->when($filters['kind'] ?? null, fn (Builder $query, string $kind) => $query->where('kind', $kind))
            ->when($filters['area'] ?? null, fn (Builder $query, string $area) => $query->where('areas', 'like', '%"'.$area.'"%'))
            ->when($filters['q'] ?? null, fn (Builder $query, string $term) => $query->where(fn (Builder $inner) => $inner
                ->where('title', 'like', "%{$term}%")
                ->orWhere('summary', 'like', "%{$term}%")
                ->orWhere('gazette', 'like', "%{$term}%")))
            ->when($filters['updated_since'] ?? null, fn (Builder $query, string $since) => $query->where('updated_at', '>=', Carbon::parse($since)))
            ->orderBy('sort')
            ->orderBy('title')
            ->get();

        return response()->json($regulations->map(fn (Regulation $regulation) => self::present($regulation))->values());
    }

    public function show(string $key)
    {
        $regulation = Regulation::with('versions.author')->withCount('versions')->where('key', $key)->firstOrFail();

        return response()->json(self::present($regulation, withHistory: true));
    }

    public static function present(Regulation $regulation, bool $withHistory = false): array
    {
        return [
            'id' => $regulation->id,
            'key' => $regulation->key,
            'title' => $regulation->title,
            'kind' => $regulation->kind,
            'areas' => $regulation->areas ?? [],
            'gazette' => $regulation->gazette,
            'url' => $regulation->url,
            'valid_from' => $regulation->valid_from?->toDateString(),
            'valid_to' => $regulation->valid_to?->toDateString(),
            'status' => $regulation->status(),
            'replaced_by' => $regulation->replaced_by ?? [],
            'checked_at' => $regulation->checked_at?->toDateString(),
            'summary' => $regulation->summary,
            'verification' => $regulation->verification,
            'verification_note' => $regulation->verification_note,
            'sort' => $regulation->sort,
            'version' => $regulation->version,
            'versions_count' => $regulation->versions_count ?? null,
            'updated_at' => $regulation->updated_at?->toIso8601String(),
            ...($withHistory ? ['history' => $regulation->versions->map(fn (RegulationVersion $version) => [
                'version' => $version->version,
                'replaced_at' => $version->created_at?->toIso8601String(),
                'replaced_by' => $version->author?->name,
                'note' => $version->note,
                'data' => $version->data,
            ])->values()] : []),
        ];
    }
}

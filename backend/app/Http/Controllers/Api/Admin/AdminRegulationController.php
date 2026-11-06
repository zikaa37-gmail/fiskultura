<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\RegulationController;
use App\Http\Controllers\Controller;
use App\Models\Regulation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminRegulationController extends Controller
{
    public function store(Request $request)
    {
        $data = $this->validated($request);
        unset($data['change_note']);

        $regulation = Regulation::create([...$data, 'sort' => $data['sort'] ?? ((int) Regulation::max('sort') + 1)]);

        return response()->json(RegulationController::present($regulation->load('versions.author')->loadCount('versions'), withHistory: true), 201);
    }

    public function update(Request $request, Regulation $regulation)
    {
        $data = $this->validated($request, $regulation);
        $note = $data['change_note'] ?? null;
        unset($data['change_note']);

        $regulation->revise($data, $request->user(), $note);

        return response()->json(RegulationController::present($regulation->fresh()->load('versions.author')->loadCount('versions'), withHistory: true));
    }

    public function review()
    {
        $stale = now()->subMonths(Regulation::REVIEW_MONTHS);
        $regulations = Regulation::query()
            ->with('checker')
            ->where(fn ($query) => $query->whereNotNull('change_detected_at')->orWhereNull('checked_at')->orWhere('checked_at', '<', $stale))
            ->orderByRaw('change_detected_at is null')
            ->orderBy('checked_at')
            ->orderBy('sort')
            ->get();

        return response()->json($regulations->map(fn (Regulation $regulation) => [
            ...RegulationController::present($regulation),
            'eli' => $regulation->eliPath(),
            'pis_amendments' => $regulation->pis_amendments,
            'pis_checked_at' => $regulation->pis_checked_at?->toIso8601String(),
            'change_detected_at' => $regulation->change_detected_at?->toIso8601String(),
            'change_detail' => $regulation->change_detail,
            'checked_by' => $regulation->checker?->name,
        ])->values());
    }

    public function checked(Request $request, Regulation $regulation)
    {
        $regulation->markChecked($request->user());

        return response()->json(RegulationController::present($regulation->fresh()));
    }

    public function destroy(Regulation $regulation)
    {
        $regulation->delete();

        return response()->json(['message' => 'Propis je obrisan.']);
    }

    private function validated(Request $request, ?Regulation $regulation = null): array
    {
        return $request->validate([
            'key' => ['required', 'string', 'max:120', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/', Rule::unique('regulations', 'key')->ignore($regulation?->id)],
            'title' => ['required', 'string', 'max:500'],
            'kind' => ['required', Rule::in(Regulation::KINDS)],
            'areas' => ['required', 'array', 'min:1'],
            'areas.*' => [Rule::in(Regulation::AREAS)],
            'gazette' => ['nullable', 'string', 'max:500'],
            'url' => ['nullable', 'url', 'max:2048'],
            'valid_from' => ['nullable', 'date'],
            'valid_to' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'replaced_by' => ['nullable', 'array'],
            'replaced_by.*' => ['string', Rule::exists('regulations', 'key')],
            'summary' => ['required', 'string', 'max:20000'],
            'verification' => ['required', Rule::in(Regulation::VERIFICATIONS)],
            'verification_note' => ['nullable', 'string', 'max:1000'],
            'sort' => ['nullable', 'integer', 'min:0'],
            'change_note' => ['nullable', 'string', 'max:500'],
        ], [
            'key.regex' => 'Ključ sme da sadrži samo mala slova bez kvačica, brojeve i crtice.',
        ]);
    }
}

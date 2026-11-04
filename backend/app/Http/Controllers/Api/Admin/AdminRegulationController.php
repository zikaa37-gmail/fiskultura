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

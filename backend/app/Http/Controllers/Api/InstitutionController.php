<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InstitutionController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate(['type' => ['required', Rule::in(Institution::TYPES)]]);

        return response()->json(Institution::where('type', $data['type'])->withCount(['submissions as pending_submissions_count' => fn ($query) => $query->where('status', 'pending')])->orderBy('name')->get()->map(fn (Institution $institution) => $institution->present())->values());
    }

    public function show(Institution $institution)
    {
        return response()->json($institution->loadCount(['submissions as pending_submissions_count' => fn ($query) => $query->where('status', 'pending')])->present());
    }

    public function search(Request $request)
    {
        $text = trim((string) $request->query('q', ''));
        if (mb_strlen($text) < 2) {
            return response()->json([]);
        }

        return response()->json(Institution::matching($text)->orderBy('name')->limit(20)->get()->map(fn (Institution $institution) => $institution->present())->values());
    }
}

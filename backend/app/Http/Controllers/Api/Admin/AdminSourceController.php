<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationSource;
use App\Services\SourceChecker;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminSourceController extends Controller
{
    public function index()
    {
        $sources = OrganizationSource::with('organization')
            ->join('organizations', 'organizations.id', '=', 'organization_sources.organization_id')
            ->orderBy('organizations.name')
            ->orderBy('organization_sources.type')
            ->select('organization_sources.*')
            ->get();

        return response()->json($sources->map(fn (OrganizationSource $source) => $this->present($source))->values());
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $source = OrganizationSource::create($data);

        return response()->json($this->present($source->load('organization')), 201);
    }

    public function update(Request $request, OrganizationSource $source)
    {
        $data = $this->validated($request, $source);
        if ($data['url'] !== $source->url || $data['type'] !== $source->type) {
            $data['feed_url'] = null;
            $source->forceFill(['last_status' => null, 'last_error' => null, 'last_checked_at' => null, 'last_found' => 0]);
        }
        $source->fill($data)->save();

        return response()->json($this->present($source->fresh('organization')));
    }

    public function destroy(OrganizationSource $source)
    {
        $source->delete();

        return response()->json(['message' => 'Izvor je obrisan.']);
    }

    public function check(OrganizationSource $source, SourceChecker $checker)
    {
        $result = $checker->check($source);

        return response()->json([...$this->present($source->fresh('organization')), 'found' => $result['found']]);
    }

    private function validated(Request $request, ?OrganizationSource $source = null): array
    {
        $data = $request->validate([
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'type' => ['required', Rule::in(OrganizationSource::TYPES)],
            'url' => ['required', 'url:http,https', 'max:500', Rule::unique('organization_sources')->where('organization_id', $request->integer('organization_id'))->ignore($source?->id)],
            'mode' => ['required', Rule::in(OrganizationSource::MODES)],
        ], [
            'url.unique' => 'Ovaj izvor je već dodat za organizaciju.',
        ]);

        if ($data['mode'] === OrganizationSource::AUTO && in_array($data['type'], ['facebook', 'instagram'], true)) {
            abort(response()->json(['message' => 'Facebook i Instagram ne dozvoljavaju automatsko čitanje; ovaj izvor se prati ručno.', 'errors' => ['mode' => ['Samo ručno praćenje.']]], 422));
        }

        return $data;
    }

    private function present(OrganizationSource $source): array
    {
        return [
            'id' => $source->id,
            'organization' => ['id' => $source->organization->id, 'slug' => $source->organization->slug, 'name' => $source->organization->short_name ?: $source->organization->name],
            'type' => $source->type,
            'url' => $source->url,
            'feed_url' => $source->feed_url,
            'mode' => $source->mode,
            'last_checked_at' => $source->last_checked_at?->toIso8601String(),
            'last_status' => $source->last_status,
            'last_error' => $source->last_error,
            'last_found' => $source->last_found,
        ];
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FacilityReport;
use App\Models\Institution;
use App\Services\Facilities\FacilityCatalog;
use App\Services\Facilities\FacilityReporter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class FacilityController extends Controller
{
    private const TYPE_LABELS = ['osnovna' => 'Osnovna škola', 'srednja' => 'Srednja škola', 'fakultet' => 'Fakultet / visoka škola'];

    public function __construct(private readonly FacilityCatalog $catalog, private readonly FacilityReporter $reporter) {}

    public function catalog()
    {
        return response()->json(['groups' => $this->catalog->groups(), 'flags' => $this->catalog->flagLabels()]);
    }

    public function institutionPdf(Institution $institution)
    {
        $data = $institution->present();
        $facts = array_filter([
            'Adresa' => implode(', ', array_filter([$data['address'], trim(($data['postal_code'] ?? '').' '.($data['place'] ?? ''))])),
            'Opština' => $data['municipality'],
            'Okrug' => $data['district'],
            'Oblast' => $data['region'] === 'Srbija' ? null : $data['region'],
            'Telefon' => $data['phone'],
            'Faks' => $data['fax'],
            'Mejl' => $data['email'],
            'Sajt' => $data['website'],
            'Direktor / dekan' => $data['director'],
            'PIB' => $data['pib'],
            'Matični broj' => $data['registry_number'],
            'Žiro računi' => implode("\n", $data['bank_accounts']),
            ...collect($institution->extra ?? [])->mapWithKeys(fn ($value, $key) => [Str::ucfirst((string) $key) => (string) $value])->all(),
        ], fn ($value) => $value !== null && $value !== '');

        return Pdf::loadView('pdf.institution', [
            'title' => $data['name'],
            'institution' => $data,
            'typeLabel' => self::TYPE_LABELS[$data['type']] ?? '',
            'facts' => $facts,
            'facilities' => $this->catalog->describe($institution->facilities),
            'note' => $institution->facilities['napomena'] ?? null,
            'updated' => $institution->facilities_updated_at?->timezone('Europe/Belgrade')->format('d.m.Y.'),
            'source' => $institution->facilities_source,
        ])->download(Str::slug($data['name']).'.pdf');
    }

    public function latest(Request $request)
    {
        $scope = $this->reporter->scope($this->validated($request));
        $report = FacilityReport::with('author')->latest('id')->get()->first(fn (FacilityReport $report) => $report->scope == $scope && $report->summary);

        return response()->json($report?->present());
    }

    public function generate(Request $request)
    {
        @set_time_limit(120);
        $scope = $this->reporter->scope($this->validated($request));

        return response()->json($this->reporter->generate($scope, $request->user())->present(), 201);
    }

    public function reportPdf(Request $request)
    {
        $data = $this->validated($request) + $request->validate(['report' => ['nullable', 'integer']]);
        $scope = $this->reporter->scope($data);
        $report = isset($data['report']) ? FacilityReport::find($data['report']) : null;
        $stats = $report?->scope == $scope ? $report->stats : $this->reporter->stats($scope);

        return Pdf::loadView('pdf.facility-report', [
            'title' => 'Infrastruktura za fizičko vaspitanje',
            'scope' => $this->reporter->describeScope($scope),
            'stats' => $stats,
            'summary' => $report?->scope == $scope ? $report->summary : null,
        ])->download('infrastruktura-'.Str::slug($this->reporter->describeScope($scope)).'.pdf');
    }

    public function update(Request $request, Institution $institution)
    {
        $data = $request->validate(['facilities' => ['present', 'array'], 'source' => ['nullable', 'string', 'max:120']]);
        $facilities = $this->catalog->normalize($data['facilities']);
        $institution->forceFill(['facilities' => null, 'facilities_origin' => null]);
        $institution->applyFacilities($facilities, 'provereno', $data['source'] ?? $request->user()->name, $request->user());

        return response()->json($institution->fresh()->present());
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'type' => ['nullable', Rule::in(Institution::TYPES)],
            'region' => ['nullable', Rule::in(Institution::REGIONS)],
            'district' => ['nullable', 'string', 'max:120'],
            'municipality' => ['nullable', 'string', 'max:120'],
        ]);
    }
}

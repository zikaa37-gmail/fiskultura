<?php

namespace App\Services;

use App\Models\Institution;
use App\Support\SerbianText;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MpnSchoolImporter
{
    public const BASE = 'https://opendata.mpn.gov.rs/srv';

    public const SOURCE = 'Ministarstvo prosvete, otvoreni podaci (CC BY)';

    private const DATASETS = ['osnovna' => 'Oo', 'srednja' => 'So'];

    public function __construct(private readonly InstitutionImporter $importer) {}

    public function import(?string $directory = null): array
    {
        $result = [];
        foreach (self::DATASETS as $type => $code) {
            $contacts = $this->read($directory, $code, 'kontaktPodaciJSON', 'KontaktPodaci');
            $locations = $this->read($directory, $code, 'PodaciOLOPJSON', 'PodaciLokacije');
            $result[$type] = $this->importer->import($this->rows($contacts, $locations), $type, self::SOURCE);
        }

        return $result;
    }

    public function rows(array $contacts, array $locations): array
    {
        $byKey = [];
        foreach ($locations as $location) {
            $byKey[$this->key($location)][] = $location;
        }
        $duplicates = array_count_values(array_map(fn (array $contact) => $this->key($contact), $contacts));

        $rows = [];
        foreach ($contacts as $contact) {
            $key = $this->key($contact);
            $own = $duplicates[$key] === 1 ? ($byKey[$key] ?? []) : [];
            $seat = collect($own)->first(fn (array $location) => SerbianText::fold($location['sedisteRadnaJedinica'] ?? '') === 'da') ?? ($own[0] ?? null);
            $halls = array_sum(array_map(fn (array $location) => (int) ($location['brojFiskulturnihSala'] ?? 0), $own));
            $area = array_sum(array_map(fn (array $location) => (float) ($location['povrsinaFiskulturnihSala'] ?? 0), $own));
            $classrooms = array_sum(array_map(fn (array $location) => (int) ($location['brojUcionica'] ?? 0), $own));

            $rows[] = array_filter([
                'name' => SerbianText::quotes(SerbianText::latin($contact['nazivUstanove'] ?? '')),
                'place' => $this->place($contact['mesto'] ?? ''),
                'municipality' => SerbianText::title($contact['opstina'] ?? ''),
                'district' => $this->district($contact['okrug'] ?? ''),
                'region' => 'Srbija',
                'registry_number' => trim((string) ($contact['maticniBroj'] ?? '')),
                'pib' => trim((string) ($contact['PIB'] ?? '')),
                'address' => $seat ? SerbianText::title($seat['ulica'] ?? '') : null,
                'osnivač' => SerbianText::latin($contact['vrstaOsnivacaPoUstanovi'] ?? ''),
                'broj lokacija (sa izdvojenim odeljenjima)' => count($own) > 1 ? (string) count($own) : null,
                'facilities' => $classrooms > 0 ? ['sala' => array_filter(['ima' => $halls > 0, 'broj' => $halls ?: null, 'povrsina' => $area ?: null], fn ($value) => $value !== null)] : null,
                'facilities_source' => $classrooms > 0 ? self::SOURCE : null,
            ], fn ($value) => $value !== null && $value !== '' && $value !== []);
        }

        return $rows;
    }

    private function read(?string $directory, string $code, string $endpoint, string $root): array
    {
        if ($directory) {
            $file = rtrim($directory, '/\\').'/'.strtolower($code).($endpoint === 'PodaciOLOPJSON' ? '_lop' : '').'.json';
            $data = json_decode((string) @file_get_contents($file), true);
        } else {
            $response = Http::timeout(120)->retry(2, 2000)->get(self::BASE."/{$code}/{$endpoint}");
            $data = $response->successful() ? $response->json() : null;
        }
        if (! is_array($data[$root] ?? null)) {
            throw new RuntimeException("Podaci Ministarstva ({$code}/{$endpoint}) nisu preuzeti.");
        }

        return $data[$root];
    }

    private function key(array $row): string
    {
        return SerbianText::fold(($row['nazivUstanove'] ?? '').'|'.($row['opstina'] ?? '').'|'.($row['okrug'] ?? ''));
    }

    private function place(string $value): string
    {
        return SerbianText::title(trim(preg_replace('/\s*\(.*\)\s*$/u', '', $value) ?? $value));
    }

    private function district(string $value): ?string
    {
        $folded = SerbianText::fold(preg_replace('/\s+(upravni\s+|upr\.\s*)?okrug$/iu', '', SerbianText::latin($value)));
        foreach (config('districts') as $district) {
            if (SerbianText::fold($district) === $folded) {
                return $district;
            }
        }

        return SerbianText::title($value) ?: null;
    }
}

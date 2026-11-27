<?php

namespace App\Services;

use App\Models\Institution;
use App\Services\Facilities\FacilityCatalog;
use App\Support\SerbianText;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class InstitutionImporter
{
    private const FIELDS = ['municipality', 'district', 'address', 'postal_code', 'phone', 'email', 'website', 'fax', 'director', 'pib', 'registry_number', 'bank_accounts'];

    private const ALIASES = [
        'oblast' => 'region', 'entitet' => 'region', 'adresa' => 'address', 'opstina' => 'municipality', 'opština' => 'municipality', 'okrug' => 'district', 'postanski_broj' => 'postal_code', 'poštanski broj' => 'postal_code',
        'telefon' => 'phone', 'telefoni' => 'phone', 'mejl' => 'email', 'e-mail' => 'email', 'sajt' => 'website', 'direktor' => 'director', 'faks' => 'fax',
        'mb' => 'registry_number', 'maticni_broj' => 'registry_number', 'matični broj' => 'registry_number', 'ziro_racun' => 'bank_accounts', 'žiro račun' => 'bank_accounts', 'racuni' => 'bank_accounts', 'tekući račun' => 'bank_accounts',
    ];

    private const KNOWN = ['facilities', 'facilities_source', 'facilities_origin', 'type', 'vrsta', 'name', 'naziv', 'place', 'mesto', 'grad', 'source_url', 'region'];

    private const TYPE_ALIASES = [
        'os' => Institution::PRIMARY, 'oš' => Institution::PRIMARY, 'osnovna' => Institution::PRIMARY, 'osnovna škola' => Institution::PRIMARY,
        'ss' => Institution::SECONDARY, 'sš' => Institution::SECONDARY, 'srednja' => Institution::SECONDARY, 'srednja škola' => Institution::SECONDARY,
        'fakultet' => Institution::FACULTY, 'visoka' => Institution::FACULTY, 'visoka škola' => Institution::FACULTY,
    ];

    public function importFile(string $path, ?string $type = null, ?string $source = null): array
    {
        if (! is_file($path)) {
            throw new InvalidArgumentException("Fajl {$path} ne postoji.");
        }

        $rows = str_ends_with(strtolower($path), '.json')
            ? json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR)
            : $this->readCsv($path);

        return $this->import($rows, $type, $source);
    }

    public function import(array $rows, ?string $type = null, ?string $source = null): array
    {
        $counts = ['created' => 0, 'updated' => 0, 'skipped' => 0];

        DB::transaction(function () use ($rows, $type, $source, &$counts) {
            foreach ($rows as $row) {
                $row = $this->normalize($row);
                $name = SerbianText::latin($row['name'] ?? $row['naziv'] ?? null);
                $kind = $this->type($row['type'] ?? $row['vrsta'] ?? $type, $name);
                if ($name === '' || ! $kind) {
                    $counts['skipped']++;

                    continue;
                }
                $place = SerbianText::latin($row['place'] ?? $row['mesto'] ?? $row['grad'] ?? null) ?: null;

                $registry = trim((string) ($row['registry_number'] ?? ''));
                $institution = ($registry !== '' ? Institution::where('type', $kind)->where('registry_number', $registry)->first() : null)
                    ?? Institution::where(['type' => $kind, 'name' => $name, 'place' => $place])->when($registry !== '', fn ($query) => $query->whereNull('registry_number'))->first()
                    ?? new Institution(['type' => $kind, 'name' => $name, 'place' => $place]);
                $values = ['source' => $institution->source ?? $source];
                $region = $this->region($row['region'] ?? null);
                if ($region || ! $institution->exists) {
                    $values['region'] = $region ?? 'Srbija';
                }
                foreach (self::FIELDS as $field) {
                    $value = trim((string) ($row[$field] ?? ''));
                    if ($value !== '') {
                        $values[$field] = in_array($field, ['email', 'website'], true) ? $value : SerbianText::latin($value);
                    }
                }
                if (is_array($row['facilities'] ?? null) && $row['facilities']) {
                    $normalized = app(FacilityCatalog::class)->normalize($row['facilities']);
                    $values['facilities'] = [...($institution->facilities ?? []), ...$normalized];
                    $values['facilities_origin'] = [...($institution->facilities_origin ?? []), ...array_fill_keys(array_keys(array_diff_key($normalized, ['napomena' => true])), $row['facilities_origin'] ?? 'zvanicno')];
                    $values['facilities_source'] = $row['facilities_source'] ?? $source;
                    $values['facilities_updated_at'] = now();
                }
                $extra = array_filter(array_diff_key($row, array_flip([...self::FIELDS, ...self::KNOWN])), fn ($value) => trim((string) $value) !== '');
                if ($extra) {
                    $values['extra'] = [...($institution->extra ?? []), ...array_map(fn ($value) => SerbianText::latin((string) $value), $extra)];
                }
                $counts[$institution->exists ? 'updated' : 'created']++;
                $institution->fill($values)->save();
            }
        });

        return $counts;
    }

    private function region(?string $value): ?string
    {
        $folded = SerbianText::fold($value);

        return match (true) {
            $folded === '' => null,
            str_contains($folded, 'srpska') || $folded === 'rs' || $folded === 'bih' => 'Republika Srpska',
            default => 'Srbija',
        };
    }

    private function normalize(array $row): array
    {
        $result = [];
        foreach ($row as $key => $value) {
            $key = mb_strtolower(trim((string) $key));
            $field = self::ALIASES[$key] ?? $key;
            $value = is_array($value) && $field !== 'facilities' ? implode(', ', $value) : $value;
            $result[$field] = isset($result[$field]) && trim((string) $result[$field]) !== '' && trim((string) $value) !== '' ? $result[$field].', '.$value : $value;
        }

        return $result;
    }

    private function type(?string $value, string $name): ?string
    {
        $value = mb_strtolower(trim((string) $value));
        if (in_array($value, Institution::TYPES, true)) {
            return $value;
        }
        if (isset(self::TYPE_ALIASES[$value])) {
            return self::TYPE_ALIASES[$value];
        }
        $folded = SerbianText::fold($name);

        return match (true) {
            str_starts_with($folded, 'os ') || str_contains($folded, 'osnovna skola') => Institution::PRIMARY,
            str_contains($folded, 'fakultet') || str_contains($folded, 'visoka') => Institution::FACULTY,
            str_contains($folded, 'gimnazija') || str_contains($folded, 'srednja') || str_contains($folded, 'tehnicka skola') || str_contains($folded, 'strucna skola') => Institution::SECONDARY,
            default => null,
        };
    }

    private function readCsv(string $path): array
    {
        $handle = fopen($path, 'r');
        $first = (string) fgets($handle);
        $delimiter = substr_count($first, ';') > substr_count($first, ',') ? ';' : ',';
        $header = array_map(fn ($cell) => mb_strtolower(trim(preg_replace('/^\xEF\xBB\xBF/', '', $cell))), str_getcsv($first, $delimiter));
        $rows = [];
        while (($cells = fgetcsv($handle, null, $delimiter)) !== false) {
            if (count(array_filter($cells, fn ($cell) => trim((string) $cell) !== '')) === 0) {
                continue;
            }
            $rows[] = array_combine($header, array_pad(array_slice($cells, 0, count($header)), count($header), null));
        }
        fclose($handle);

        return $rows;
    }
}

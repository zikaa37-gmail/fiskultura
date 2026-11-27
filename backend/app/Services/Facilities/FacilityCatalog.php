<?php

namespace App\Services\Facilities;

use App\Models\Institution;
use Illuminate\Support\Collection;

class FacilityCatalog
{
    public function groups(): array
    {
        return config('facilities.groups');
    }

    public function flagLabels(): array
    {
        return config('facilities.flags');
    }

    public function normalize(array $input): array
    {
        if (is_array($input['jama'] ?? null) && array_key_exists('ima', $input['jama']) && ! isset($input['staza']['jama'])) {
            $input['staza'] = [...(is_array($input['staza'] ?? null) ? $input['staza'] : []), 'jama' => $input['jama']['ima']];
        }
        $result = [];
        foreach ($this->groups() as $group => $definition) {
            $values = is_array($input[$group] ?? null) ? $input[$group] : [];
            $clean = $this->fields($definition['fields'], $values);
            if ($list = $definition['list'] ?? null) {
                $entries = $values[$list['key']] ?? null;
                if (! is_array($entries) || ! array_is_list($entries)) {
                    $entries = array_intersect_key($values, $list['fields']) ? [$values] : [];
                }
                $entries = array_values(array_filter(array_map(fn ($entry) => is_array($entry) ? $this->fields($list['fields'], $entry) : [], array_slice($entries, 0, 20))));
                if ($entries) {
                    $clean[$list['key']] = $entries;
                    $clean['ima'] ??= true;
                    if (isset($definition['fields']['broj'])) {
                        $clean['broj'] = max($clean['broj'] ?? 0, count($entries));
                    }
                }
            }
            if ($clean) {
                $result[$group] = $clean;
            }
        }
        if (isset($input['napomena']) && trim((string) $input['napomena']) !== '') {
            $result['napomena'] = mb_substr(trim((string) $input['napomena']), 0, 2000);
        }

        return $result;
    }

    private function fields(array $fields, array $values): array
    {
        $result = [];
        foreach ($fields as $field => $spec) {
            if (! array_key_exists($field, $values)) {
                continue;
            }
            $value = $values[$field];
            $value = match ($spec['type']) {
                'bool' => $this->bool($value),
                'integer' => is_numeric($value) && (float) $value >= 0 && floor((float) $value) == (float) $value ? (int) $value : null,
                'number' => is_numeric($value) && (float) $value >= 0 ? round((float) $value, 2) : null,
                'select' => in_array($value, $spec['options'], true) ? $value : null,
                default => null,
            };
            if ($value !== null) {
                $result[$field] = $value;
            }
        }

        return $result;
    }

    private function bool(mixed $value): ?bool
    {
        if (is_bool($value) || $value === null) {
            return $value;
        }
        $text = mb_strtolower(trim((string) $value));

        return match (true) {
            in_array($text, ['da', 'ima', 'postoji', 'yes', '1', 'true'], true) => true,
            in_array($text, ['ne', 'nema', 'ne postoji', 'no', '0', 'false'], true) => false,
            default => null,
        };
    }

    public function flags(?array $facilities): array
    {
        if (! $facilities) {
            return [];
        }
        $hall = $facilities['sala'] ?? [];
        $hasHall = ($hall['ima'] ?? false) === true;
        $halls = $hall['sale'] ?? [];
        $fits = fn (float $length, float $width) => collect($halls)->contains(fn (array $entry) => (float) ($entry['duzina'] ?? 0) >= $length && (float) ($entry['sirina'] ?? 0) >= $width);
        $measured = collect($halls)->contains(fn (array $entry) => isset($entry['duzina'], $entry['sirina']));
        $largestArea = max([(int) ($hall['broj'] ?? 1) <= 1 ? (float) ($hall['povrsina'] ?? 0) : 0, ...array_map(fn (array $entry) => (float) ($entry['povrsina'] ?? 0), $halls)]);
        $rooms = $facilities['svlacionice'] ?? [];
        $courts = $facilities['teren']['tereni'] ?? [];
        $stands = collect([...$halls, ...$courts, ...($facilities['bazen']['bazeni'] ?? [])])->contains(fn (array $entry) => ($entry['tribine'] ?? false) === true || ($entry['tribine_mesta'] ?? 0) > 0);
        $equipment = $facilities['rekviziti'] ?? [];

        return array_keys(array_filter([
            'podaci' => true,
            'sala' => $hasHall,
            'sala_kosarka' => $hasHall && ($measured ? $fits(28, 15) : $largestArea >= 540),
            'sala_rukomet' => $hasHall && $fits(40, 20),
            'bez_sale' => ($hall['ima'] ?? null) === false,
            'svlacionice' => ($rooms['ima'] ?? false) === true,
            'tusevi' => collect($rooms['prostorije'] ?? [])->contains(fn (array $entry) => ($entry['tusevi'] ?? false) === true),
            'teren' => ($facilities['teren']['ima'] ?? false) === true,
            'teren_kosarka' => collect($courts)->contains(fn (array $entry) => ($entry['kosarka'] ?? false) === true && ($entry['kosevi'] ?? false) === true),
            'tribine' => $stands,
            'bazen' => ($facilities['bazen']['ima'] ?? false) === true,
            'staza' => ($facilities['staza']['ima'] ?? false) === true,
            'jama' => ($facilities['staza']['jama'] ?? false) === true,
            'gimnastika' => ($equipment['strunjace'] ?? false) && ($equipment['svedski_sanduk'] ?? false),
        ]));
    }

    public function known(?array $facilities): array
    {
        if (! $facilities) {
            return [];
        }
        $hall = $facilities['sala'] ?? [];
        $halls = $hall['sale'] ?? [];
        $hallKnown = array_key_exists('ima', $hall) || $halls;
        $measured = collect($halls)->contains(fn (array $entry) => isset($entry['duzina'], $entry['sirina']));
        $sizeKnown = $measured || ((int) ($hall['broj'] ?? 1) <= 1 && isset($hall['povrsina'])) || collect($halls)->contains(fn (array $entry) => isset($entry['povrsina']));
        $has = fn (string $group) => ! empty($facilities[$group]);

        return array_keys(array_filter([
            'sala' => $hallKnown,
            'sala_kosarka' => ($hall['ima'] ?? null) === false || $sizeKnown,
            'sala_rukomet' => ($hall['ima'] ?? null) === false || $measured,
            'bez_sale' => $hallKnown,
            'svlacionice' => $has('svlacionice'),
            'tusevi' => ($facilities['svlacionice']['ima'] ?? null) === false || ! empty($facilities['svlacionice']['prostorije']),
            'teren' => $has('teren'),
            'teren_kosarka' => ($facilities['teren']['ima'] ?? null) === false || ! empty($facilities['teren']['tereni']),
            'tribine' => $halls || ! empty($facilities['teren']['tereni']) || ! empty($facilities['bazen']['bazeni']),
            'bazen' => $has('bazen'),
            'staza' => array_key_exists('ima', $facilities['staza'] ?? []),
            'jama' => array_key_exists('jama', $facilities['staza'] ?? []),
            'gimnastika' => $has('rekviziti'),
        ]));
    }

    public function stats(Collection $institutions): array
    {
        $total = $institutions->count();
        $withData = $institutions->filter(fn (Institution $institution) => ! empty($institution->facilities));
        $counts = array_fill_keys(array_keys($this->flagLabels()), 0);
        $known = $counts;
        foreach ($withData as $institution) {
            $flags = $this->flags($institution->facilities);
            foreach ($this->known($institution->facilities) as $flag) {
                $known[$flag]++;
                $counts[$flag] += in_array($flag, $flags, true) ? 1 : 0;
            }
        }

        return [
            'total' => $total,
            'with_data' => $withData->count(),
            'rows' => collect($this->flagLabels())->except('podaci')->map(fn (string $label, string $flag) => [
                'flag' => $flag,
                'label' => $label,
                'known' => $known[$flag],
                'count' => $known[$flag] ? $counts[$flag] : null,
                'share' => $known[$flag] ? (int) round($counts[$flag] / $known[$flag] * 100) : null,
            ])->values()->all(),
        ];
    }

    public function describe(?array $facilities): array
    {
        $rows = [];
        foreach ($this->groups() as $group => $definition) {
            $values = $facilities[$group] ?? [];
            if (! $values) {
                continue;
            }
            $items = $this->items($definition['fields'], $values);
            if ($list = $definition['list'] ?? null) {
                foreach (array_values($values[$list['key']] ?? []) as $index => $entry) {
                    $details = array_map(fn (array $item) => "{$item['label']}: {$item['value']}", $this->items($list['fields'], $entry));
                    $items[] = ['label' => $list['label'].' '.($index + 1), 'value' => implode(', ', $details)];
                }
            }
            if ($items) {
                $rows[] = ['label' => $definition['label'], 'items' => $items];
            }
        }

        return $rows;
    }

    private function items(array $fields, array $values): array
    {
        $items = [];
        $sections = [];
        foreach ($fields as $field => $spec) {
            if (! array_key_exists($field, $values)) {
                continue;
            }
            $value = $values[$field];
            if (isset($spec['section'])) {
                if ($value !== false) {
                    $sections[$spec['section']][] = is_bool($value) ? $spec['label'] : "{$spec['label']}: {$value}";
                }

                continue;
            }
            $items[] = ['label' => $spec['label'], 'value' => is_bool($value) ? ($value ? 'da' : 'ne') : (string) $value];
        }
        foreach ($sections as $section => $labels) {
            $items[] = ['label' => $section, 'value' => implode(', ', $labels)];
        }

        return $items;
    }
}

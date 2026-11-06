<?php

namespace App\Services;

use App\Models\Regulation;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PisChecker
{
    public const ELI_API = 'https://slgl.pravno-informacioni-sistem.rs/api/prins/eli/';

    public const ACT_API = 'https://reg.pravno-informacioni-sistem.rs/api/GetLawActViewByLawAdActGuid';

    private const USER_AGENT = 'Mozilla/5.0 (compatible; FiskulturaBot/1.0; +https://fiskultura.rs)';

    public function amendments(string $eliPath): string
    {
        $info = $this->get(self::ELI_API.$eliPath.'/reg');
        $guid = $info['lawAdActGuid'] ?? null;
        if (! $guid) {
            throw new RuntimeException("PIS ne poznaje ELI {$eliPath}.");
        }

        $act = $this->get(self::ACT_API, ['guid' => $guid, 'lawAdActGuid' => $guid, 'eliUrl' => '/eli/'.$eliPath]);
        $title = (string) ($act['title'] ?? '');
        $position = mb_strrpos($title, ': ');
        if ($position === false) {
            throw new RuntimeException("PIS nije vratio spisak izmena za {$eliPath}.");
        }

        return trim(mb_substr($title, $position + 2));
    }

    public function check(Regulation $regulation): array
    {
        $path = $regulation->eliPath();
        if (! $path) {
            return ['status' => 'skipped', 'detail' => null];
        }

        $current = $this->amendments($path);
        $previous = $regulation->pis_amendments;
        $changed = $previous !== null && $previous !== $current;
        $detail = $changed ? self::describe($previous, $current) : null;

        $regulation->forceFill([
            'pis_amendments' => mb_substr($current, 0, 2000),
            'pis_checked_at' => now(),
            ...($changed ? ['change_detected_at' => now(), 'change_detail' => mb_substr($detail, 0, 2000)] : []),
        ]);
        $regulation->timestamps = false;
        $regulation->save();
        $regulation->timestamps = true;

        return ['status' => $previous === null ? 'baseline' : ($changed ? 'changed' : 'same'), 'detail' => $detail];
    }

    public static function describe(string $previous, string $current): string
    {
        $before = array_map('trim', explode(',', $previous));
        $added = array_values(array_filter(array_map('trim', explode(',', $current)), fn (string $item) => ! in_array($item, $before, true)));

        return $added ? 'Nove izmene u PIS-u: '.implode(', ', $added) : "Promenjen spisak izmena u PIS-u: {$current}";
    }

    private function get(string $url, array $query = []): array
    {
        $response = Http::withUserAgent(self::USER_AGENT)->acceptJson()->timeout(30)->retry(2, 2000, throw: false)->get($url, $query);
        if (! $response->successful()) {
            throw new RuntimeException("PIS je vratio HTTP {$response->status()}.");
        }

        return (array) json_decode(ltrim($response->body(), "\u{FEFF}"), true);
    }
}

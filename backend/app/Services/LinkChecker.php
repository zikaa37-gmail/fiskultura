<?php

namespace App\Services;

use App\Models\Organization;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Throwable;

class LinkChecker
{
    public const OK = 'ok';

    public const BROKEN = 'broken';

    public const UNKNOWN = 'unknown';

    private const USER_AGENT = 'Mozilla/5.0 (compatible; FiskulturaLinkCheck/1.0; +https://fiskultura.rs)';

    public function check(string $url): array
    {
        try {
            $response = Http::withHeaders(['User-Agent' => self::USER_AGENT, 'Accept' => 'text/html,*/*;q=0.8'])
                ->timeout(20)
                ->connectTimeout(10)
                ->withOptions(['allow_redirects' => ['max' => 6]])
                ->get($url);

            $status = $this->classify($response->status());

            return ['status' => self::unverifiable($url) && $status === self::OK ? self::UNKNOWN : $status, 'code' => $response->status()];
        } catch (ConnectionException) {
            return ['status' => self::BROKEN, 'code' => null];
        } catch (Throwable) {
            return ['status' => self::UNKNOWN, 'code' => null];
        }
    }

    public function checkOrganization(Organization $organization): array
    {
        $previous = $organization->link_checks ?? [];
        $checks = [];
        foreach (self::links($organization) as $field => $url) {
            $result = [...$this->check($url), 'url' => $url, 'checked_at' => now()->toIso8601String()];
            $manual = $previous[$field] ?? null;
            $keepManual = $manual && ($manual['manual'] ?? false) && ($manual['url'] ?? null) === $url && $result['status'] === self::UNKNOWN;
            $checks[$field] = $keepManual ? [...$manual, 'checked_at' => $result['checked_at'], 'code' => $result['code']] : $result;
        }

        $organization->forceFill(['link_checks' => $checks ?: null])->saveQuietly();

        return $checks;
    }

    public static function markBroken(Organization $organization, array $fields): void
    {
        $links = self::links($organization);
        $checks = $organization->link_checks ?? [];

        foreach ($links as $field => $url) {
            $isManual = ($checks[$field]['manual'] ?? false) && ($checks[$field]['url'] ?? null) === $url;
            if (in_array($field, $fields, true)) {
                $checks[$field] = ['status' => self::BROKEN, 'code' => null, 'url' => $url, 'checked_at' => now()->toIso8601String(), 'manual' => true];
            } elseif ($isManual) {
                unset($checks[$field]);
            }
        }

        $organization->forceFill(['link_checks' => array_intersect_key($checks, $links) ?: null])->saveQuietly();
    }

    public static function manuallyBroken(Organization $organization): array
    {
        $links = self::links($organization);

        return array_values(array_keys(array_filter(
            $organization->link_checks ?? [],
            fn (array $check, string $field) => ($check['manual'] ?? false) && ($check['url'] ?? null) === ($links[$field] ?? false),
            ARRAY_FILTER_USE_BOTH,
        )));
    }

    public static function links(Organization $organization): array
    {
        return array_filter([
            'website' => $organization->website,
            'facebook' => $organization->social['facebook'] ?? null,
            'instagram' => $organization->social['instagram'] ?? null,
            'youtube' => $organization->social['youtube'] ?? null,
            'member_source' => $organization->member_source,
        ]);
    }

    public static function statusFor(Organization $organization, string $field): ?string
    {
        $url = self::links($organization)[$field] ?? null;
        if (! $url) {
            return null;
        }

        $check = $organization->link_checks[$field] ?? null;

        return $check && ($check['url'] ?? null) === $url ? $check['status'] : self::UNKNOWN;
    }

    public static function unverifiable(string $url): bool
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        return (bool) preg_match('/(^|\.)(facebook\.com|fb\.com|instagram\.com)$/', $host);
    }

    private function classify(int $code): string
    {
        return match (true) {
            $code < 400 => self::OK,
            in_array($code, [404, 410], true), $code >= 500 => self::BROKEN,
            default => self::UNKNOWN,
        };
    }
}

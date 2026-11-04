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

            return ['status' => $this->classify($response->status()), 'code' => $response->status()];
        } catch (ConnectionException) {
            return ['status' => self::BROKEN, 'code' => null];
        } catch (Throwable) {
            return ['status' => self::UNKNOWN, 'code' => null];
        }
    }

    public function checkOrganization(Organization $organization): array
    {
        $checks = [];
        foreach (self::links($organization) as $field => $url) {
            $checks[$field] = [...$this->check($url), 'url' => $url, 'checked_at' => now()->toIso8601String()];
        }

        $organization->forceFill(['link_checks' => $checks ?: null])->saveQuietly();

        return $checks;
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

    private function classify(int $code): string
    {
        return match (true) {
            $code < 400 => self::OK,
            in_array($code, [404, 410], true), $code >= 500 => self::BROKEN,
            default => self::UNKNOWN,
        };
    }
}

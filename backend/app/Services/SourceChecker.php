<?php

namespace App\Services;

use App\Models\NewsSuggestion;
use App\Models\OrganizationSource;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use SimpleXMLElement;
use Throwable;

class SourceChecker
{
    public const OK = 'ok';

    public const NO_FEED = 'no_feed';

    public const BLOCKED = 'blocked';

    public const ERROR = 'error';

    public const MAX_AGE_DAYS = 45;

    public const MAX_PER_RUN = 10;

    private const USER_AGENT = 'Mozilla/5.0 (compatible; FiskulturaSources/1.0; +https://fiskultura.rs)';

    private array $known = [];

    private array $robots = [];

    private bool $loaded = false;

    public function check(OrganizationSource $source): array
    {
        if (! $this->loaded) {
            $this->known = NewsSuggestion::knownHashes();
            $this->loaded = true;
        }

        $found = 0;
        $error = null;

        try {
            $feed = $source->feed_url ?: ($source->type === 'rss' ? $source->url : $this->discover($source->url));
            if (! $feed) {
                $status = self::NO_FEED;
            } elseif (! $this->allowed($feed)) {
                $status = self::BLOCKED;
            } else {
                $found = $this->collect($source, $this->items($this->fetch($feed)));
                $status = self::OK;
                $source->feed_url = $source->type === 'rss' ? null : $feed;
            }
        } catch (Throwable $exception) {
            $status = self::ERROR;
            $error = Str::limit($exception->getMessage(), 250);
        }

        $source->forceFill([
            'last_checked_at' => now(),
            'last_status' => $status,
            'last_error' => $error,
            'last_found' => $found,
        ])->save();

        return ['status' => $status, 'found' => $found];
    }

    public function items(string $xml): array
    {
        $previous = libxml_use_internal_errors(true);
        $document = simplexml_load_string($xml, SimpleXMLElement::class, LIBXML_NONET | LIBXML_NOCDATA);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if (! $document) {
            throw new \RuntimeException('Fid nije ispravan XML.');
        }

        $items = [];
        if (isset($document->channel)) {
            foreach ($document->channel->item as $item) {
                $items[] = [
                    'title' => (string) $item->title,
                    'url' => trim((string) $item->link),
                    'date' => (string) $item->pubDate,
                    'excerpt' => (string) $item->description,
                ];
            }
        } else {
            foreach ($document->entry as $entry) {
                $link = null;
                foreach ($entry->link as $candidate) {
                    $rel = (string) $candidate['rel'];
                    if ($rel === '' || $rel === 'alternate') {
                        $link = (string) $candidate['href'];
                        break;
                    }
                }
                $items[] = [
                    'title' => (string) $entry->title,
                    'url' => trim((string) $link),
                    'date' => (string) ($entry->published ?: $entry->updated),
                    'excerpt' => (string) ($entry->summary ?: $entry->content),
                ];
            }
        }

        return array_values(array_filter($items, fn (array $item) => trim($item['title']) !== '' && filter_var($item['url'], FILTER_VALIDATE_URL)));
    }

    public function discover(string $url): ?string
    {
        $response = $this->get($url);
        $body = $response->body();
        if ($this->looksLikeFeed($body)) {
            return $url;
        }

        if (preg_match_all('~<link\b[^>]*>~i', $body, $tags)) {
            foreach ($tags[0] as $tag) {
                if (preg_match('~type=["\']application/(rss|atom)\+xml["\']~i', $tag) && preg_match('~href=["\']([^"\']+)["\']~i', $tag, $href) && ! str_contains(strtolower($href[1]), 'comments')) {
                    return $this->absolute(html_entity_decode($href[1]), (string) $response->effectiveUri() ?: $url);
                }
            }
        }

        $guess = rtrim($url, '/').'/feed/';
        try {
            $candidate = $this->get($guess);

            return $candidate->successful() && $this->looksLikeFeed($candidate->body()) ? $guess : null;
        } catch (Throwable) {
            return null;
        }
    }

    public function allowed(string $url): bool
    {
        $parts = parse_url($url);
        $origin = ($parts['scheme'] ?? 'https').'://'.($parts['host'] ?? '');
        if (! array_key_exists($origin, $this->robots)) {
            try {
                $response = $this->get($origin.'/robots.txt');
                $this->robots[$origin] = $response->successful() ? $this->disallowed($response->body()) : [];
            } catch (Throwable) {
                $this->robots[$origin] = [];
            }
        }

        $path = ($parts['path'] ?? '/').(isset($parts['query']) ? '?'.$parts['query'] : '');
        foreach ($this->robots[$origin] as $rule) {
            $pattern = '~^'.str_replace(['\*', '\$'], ['.*', '$'], preg_quote($rule, '~')).'~';
            if (preg_match($pattern, $path)) {
                return false;
            }
        }

        return true;
    }

    private function collect(OrganizationSource $source, array $items): int
    {
        $limit = now()->subDays(self::MAX_AGE_DAYS)->startOfDay();
        $fresh = collect($items)
            ->map(fn (array $item) => [...$item, 'date' => $this->date($item['date'])])
            ->filter(fn (array $item) => ! $item['date'] || $item['date']->greaterThanOrEqualTo($limit))
            ->sortByDesc(fn (array $item) => $item['date']?->timestamp ?? 0)
            ->take(self::MAX_PER_RUN);

        $created = 0;
        foreach ($fresh as $item) {
            $hash = NewsSuggestion::hashUrl($item['url']);
            if (isset($this->known[$hash])) {
                continue;
            }
            $this->known[$hash] = true;

            NewsSuggestion::create([
                'organization_id' => $source->organization_id,
                'organization_source_id' => $source->id,
                'origin' => NewsSuggestion::FEED,
                'title' => Str::limit(trim(html_entity_decode(strip_tags($item['title']))), 250),
                'url' => Str::limit($item['url'], 500, ''),
                'url_hash' => $hash,
                'published_on' => $item['date']?->toDateString(),
                'excerpt' => $this->excerpt($item['excerpt']),
            ]);
            $created++;
        }

        return $created;
    }

    private function excerpt(string $html): ?string
    {
        $text = trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5)));

        return $text === '' ? null : Str::limit($text, 500);
    }

    private function date(string $value): ?Carbon
    {
        try {
            return trim($value) === '' ? null : Carbon::parse($value);
        } catch (Throwable) {
            return null;
        }
    }

    private function fetch(string $url): string
    {
        $response = $this->get($url);
        if (! $response->successful()) {
            throw new \RuntimeException("Fid vraća {$response->status()}.");
        }

        return $response->body();
    }

    private function get(string $url)
    {
        return Http::withHeaders(['User-Agent' => self::USER_AGENT, 'Accept' => 'application/rss+xml, application/atom+xml, application/xml, text/html;q=0.8, */*;q=0.5'])
            ->timeout(20)
            ->connectTimeout(10)
            ->withOptions(['allow_redirects' => ['max' => 6]])
            ->get($url);
    }

    private function looksLikeFeed(string $body): bool
    {
        $head = ltrim(substr($body, 0, 600));

        return (bool) preg_match('~<(rss|feed)\b~i', $head);
    }

    private function absolute(string $href, string $base): string
    {
        if (preg_match('~^https?://~i', $href)) {
            return $href;
        }
        $parts = parse_url($base);
        $origin = ($parts['scheme'] ?? 'https').'://'.($parts['host'] ?? '');
        if (str_starts_with($href, '//')) {
            return ($parts['scheme'] ?? 'https').':'.$href;
        }

        return str_starts_with($href, '/') ? $origin.$href : rtrim($origin.dirname($parts['path'] ?? '/').'/', '/').'/'.$href;
    }

    private function disallowed(string $robots): array
    {
        $rules = [];
        $applies = false;
        $inGroup = false;
        foreach (preg_split('/\r\n|\r|\n/', $robots) as $line) {
            $line = trim(Str::before($line, '#'));
            if ($line === '' || ! str_contains($line, ':')) {
                continue;
            }
            [$field, $value] = array_map('trim', explode(':', $line, 2));
            $field = strtolower($field);
            if ($field === 'user-agent') {
                if (! $inGroup) {
                    $applies = false;
                }
                $inGroup = true;
                $applies = $applies || $value === '*' || stripos($value, 'fiskultura') !== false;
            } else {
                $inGroup = false;
                if ($applies && $field === 'disallow' && $value !== '') {
                    $rules[] = $value;
                }
            }
        }

        return $rules;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['organization_id', 'organization_source_id', 'origin', 'title', 'url', 'url_hash', 'published_on', 'excerpt', 'sender_name', 'sender_email', 'sender_organization'])]
class NewsSuggestion extends Model
{
    public const FEED = 'feed';

    public const FORM = 'form';

    public const NEW = 'new';

    public const ACCEPTED = 'accepted';

    public const DISMISSED = 'dismissed';

    public const STATUSES = [self::NEW, self::ACCEPTED, self::DISMISSED];

    protected function casts(): array
    {
        return ['published_on' => 'date', 'reviewed_at' => 'datetime'];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(OrganizationSource::class, 'organization_source_id');
    }

    public function news(): BelongsTo
    {
        return $this->belongsTo(News::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public static function hashUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $parts = parse_url(trim($url));
        $host = strtolower(preg_replace('/^www\./i', '', $parts['host'] ?? ''));
        $path = rtrim($parts['path'] ?? '', '/');
        $query = $parts['query'] ?? '';

        return sha1($host.$path.($query !== '' ? '?'.$query : ''));
    }

    public static function knownHashes(): array
    {
        $news = News::whereNotNull('source_url')->pluck('source_url')->map(fn (string $url) => self::hashUrl($url));

        return array_fill_keys([...self::whereNotNull('url_hash')->pluck('url_hash')->all(), ...$news->all()], true);
    }
}

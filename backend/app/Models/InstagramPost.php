<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Fillable(['kind', 'caption', 'image', 'token', 'status', 'scheduled_at', 'published_at', 'media_id', 'permalink', 'error', 'networks', 'facebook_status', 'facebook_post_id', 'facebook_permalink', 'facebook_error', 'source_type', 'source_id', 'created_by'])]
#[Hidden(['image', 'token'])]
class InstagramPost extends Model
{
    public const MAX_IMAGE_LENGTH = 8_000_000;

    public const KIND_POST = 'post';

    public const KIND_STORY = 'story';

    public const KINDS = [self::KIND_POST, self::KIND_STORY];

    public const SCHEDULED = 'scheduled';

    public const PUBLISHING = 'publishing';

    public const PUBLISHED = 'published';

    public const FAILED = 'failed';

    public const SOURCES = ['news', 'debate', 'question'];

    public const NETWORKS = ['instagram', 'facebook'];

    protected static function booted(): void
    {
        static::creating(fn (InstagramPost $post) => $post->token ??= Str::random(40));
    }

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'published_at' => 'datetime',
            'networks' => 'array',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function imageUrl(): string
    {
        return rtrim((string) config('app.url'), '/').'/api/public/instagram-media/'.$this->token.'.jpg';
    }

    public function imageBytes(): ?string
    {
        if (! $this->image || ! preg_match('/^data:image\/jpeg;base64,(.+)$/s', $this->image, $match)) {
            return null;
        }

        return base64_decode($match[1], true) ?: null;
    }

    public function wants(string $network): bool
    {
        return in_array($network, $this->networks ?? ['instagram'], true);
    }

    public function present(): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind,
            'caption' => $this->caption,
            'networks' => $this->networks ?? ['instagram'],
            'status' => $this->status,
            'facebook_status' => $this->facebook_status,
            'facebook_permalink' => $this->facebook_permalink,
            'facebook_error' => $this->facebook_error,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'published_at' => $this->published_at?->toIso8601String(),
            'permalink' => $this->permalink,
            'error' => $this->error,
            'source_type' => $this->source_type,
            'source_id' => $this->source_id,
            'author' => $this->author?->name,
            'image_url' => $this->image ? $this->imageUrl() : null,
        ];
    }
}

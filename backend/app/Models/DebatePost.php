<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['debate_id', 'user_id', 'kind', 'body', 'likes_count', 'highlighted_at', 'hidden_at'])]
class DebatePost extends Model
{
    public const KINDS = ['question', 'criticism', 'statement', 'suggestion'];

    public const REACTIONS = ['like', 'agree', 'disagree', 'useful'];

    protected function casts(): array
    {
        return [
            'highlighted_at' => 'datetime',
            'hidden_at' => 'datetime',
        ];
    }

    public function debate(): BelongsTo
    {
        return $this->belongsTo(Debate::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function likers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'debate_post_likes', 'debate_post_id', 'user_id')->withPivot('type');
    }
}

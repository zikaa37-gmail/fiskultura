<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['subscription_id', 'news_id', 'debate_promotion_id', 'kind', 'channel', 'status', 'error', 'created_at'])]
class NotificationLog extends Model
{
    public const UPDATED_AT = null;

    public const SENT = 'sent';

    public const FAILED = 'failed';

    protected $table = 'notification_log';

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }
}

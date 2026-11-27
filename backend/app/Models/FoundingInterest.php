<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable(['district', 'city', 'city_key', 'name', 'email', 'school'])]
class FoundingInterest extends Model
{
    public const THRESHOLD = 3;

    protected function casts(): array
    {
        return [
            'confirmation_sent_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'notified_at' => 'datetime',
        ];
    }

    public static function cityKey(string $city): string
    {
        return Str::limit(Str::slug(Str::ascii(trim($city))), 50, '');
    }

    public function scopeConfirmed(Builder $query): Builder
    {
        return $query->whereNotNull('confirmed_at');
    }

    public function token(): string
    {
        return hash_hmac('sha256', "founding-interest|{$this->id}|{$this->email}", (string) config('app.key'));
    }

    public function hasToken(?string $token): bool
    {
        return $token !== null && hash_equals($this->token(), $token);
    }

    public function confirmLink(): string
    {
        return rtrim((string) config('app.frontend_url'), '/')."/udruzenja/osnivanje/potvrda?id={$this->id}&token={$this->token()}";
    }
}

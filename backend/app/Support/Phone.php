<?php

namespace App\Support;

class Phone
{
    public static function format(?string $value): ?string
    {
        $raw = trim((string) $value);
        if ($raw === '') {
            return null;
        }

        $digits = preg_replace('/\D/', '', $raw);
        $international = str_starts_with($raw, '+') || str_starts_with($raw, '00');
        if (str_starts_with($raw, '00')) {
            $digits = substr($digits, 2);
        }

        if ($international && ! str_starts_with($digits, '381')) {
            return strlen($digits) >= 7 && strlen($digits) <= 15 ? '+'.$digits : null;
        }
        if (str_starts_with($digits, '381') && ($international || strlen($digits) >= 11)) {
            $digits = substr($digits, 3);
        }

        $digits = ltrim($digits, '0');
        if (strlen($digits) < 8 || strlen($digits) > 10) {
            return null;
        }

        return '+381 '.substr($digits, 0, 2).' '.substr($digits, 2);
    }
}

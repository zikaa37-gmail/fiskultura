<?php

namespace App\Rules;

use App\Support\Phone;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PhoneNumber implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || Phone::format($value) === null) {
            $fail('Telefon nije ispravan. Upišite ga kao +381 60 1234567 ili 060 1234567.');
        }
    }
}

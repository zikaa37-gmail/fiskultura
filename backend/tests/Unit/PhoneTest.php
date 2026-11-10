<?php

namespace Tests\Unit;

use App\Support\Phone;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class PhoneTest extends TestCase
{
    public static function numbers(): array
    {
        return [
            ['060 33 555 31', '+381 60 3355531'],
            ['0603355531', '+381 60 3355531'],
            ['381 60 33 555 31', '+381 60 3355531'],
            ['+381 (0)60 33-555-31', '+381 60 3355531'],
            ['00381 64 123 4567', '+381 64 1234567'],
            ['064/123-45-678', '+381 64 12345678'],
            ['011 3613 734', '+381 11 3613734'],
            ['+49 151 2345 6789', '+4915123456789'],
            ['', null],
            ['060123', null],
            ['telefon', null],
        ];
    }

    #[DataProvider('numbers')]
    public function test_formats_phone_as_international(string $input, ?string $expected): void
    {
        $this->assertSame($expected, Phone::format($input));
    }
}

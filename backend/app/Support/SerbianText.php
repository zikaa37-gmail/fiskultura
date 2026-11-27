<?php

namespace App\Support;

use Illuminate\Support\Str;

class SerbianText
{
    private const CYRILLIC = [
        'Љ' => 'Lj', 'Њ' => 'Nj', 'Џ' => 'Dž', 'љ' => 'lj', 'њ' => 'nj', 'џ' => 'dž',
        'А' => 'A', 'Б' => 'B', 'В' => 'V', 'Г' => 'G', 'Д' => 'D', 'Ђ' => 'Đ', 'Е' => 'E', 'Ж' => 'Ž', 'З' => 'Z', 'И' => 'I', 'Ј' => 'J',
        'К' => 'K', 'Л' => 'L', 'М' => 'M', 'Н' => 'N', 'О' => 'O', 'П' => 'P', 'Р' => 'R', 'С' => 'S', 'Т' => 'T', 'Ћ' => 'Ć', 'У' => 'U',
        'Ф' => 'F', 'Х' => 'H', 'Ц' => 'C', 'Ч' => 'Č', 'Ш' => 'Š',
        'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd', 'ђ' => 'đ', 'е' => 'e', 'ж' => 'ž', 'з' => 'z', 'и' => 'i', 'ј' => 'j',
        'к' => 'k', 'л' => 'l', 'м' => 'm', 'н' => 'n', 'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't', 'ћ' => 'ć', 'у' => 'u',
        'ф' => 'f', 'х' => 'h', 'ц' => 'c', 'ч' => 'č', 'ш' => 'š',
    ];

    public static function latin(?string $text): string
    {
        return trim(preg_replace('/\s+/u', ' ', strtr((string) $text, self::CYRILLIC)));
    }

    public static function title(?string $text): string
    {
        $words = explode(' ', mb_convert_case(mb_strtolower(self::latin($text)), MB_CASE_TITLE));
        foreach ($words as $index => $word) {
            if ($index > 0 && in_array(mb_strtolower($word), ['venac', 'grad', 'brdo', 'polje', 'i', 'na', 'kod', 'pri', 'bb'], true)) {
                $words[$index] = mb_strtolower($word);
            }
        }

        return implode(' ', $words);
    }

    public static function quotes(string $text): string
    {
        $quoted = preg_replace('/\s*(?:[„"“”]|,,)\s*([^"“”„]+?)\s*["“”]/u', ' „$1”', $text) ?? $text;

        return trim(preg_replace('/\s{2,}/u', ' ', $quoted) ?? $quoted);
    }

    public static function fold(?string $text): string
    {
        $latin = mb_strtolower(self::latin($text));
        $latin = strtr($latin, ['đ' => 'dj', 'dž' => 'dz', 'č' => 'c', 'ć' => 'c', 'š' => 's', 'ž' => 'z']);

        return trim(preg_replace('/[^a-z0-9]+/', ' ', Str::ascii($latin)));
    }
}

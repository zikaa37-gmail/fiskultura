<?php

namespace App\Services\Ai;

interface Assistant
{
    public function available(): bool;

    public function json(string $system, string $prompt, array $schema): array;
}

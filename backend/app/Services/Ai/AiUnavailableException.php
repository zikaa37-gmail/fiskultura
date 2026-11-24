<?php

namespace App\Services\Ai;

use RuntimeException;

class AiUnavailableException extends RuntimeException
{
    public function render()
    {
        return response()->json(['message' => $this->getMessage()], 503);
    }
}

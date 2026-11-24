<?php

namespace App\Services\Mailbox;

use RuntimeException;

class MailboxUnavailableException extends RuntimeException
{
    public function render()
    {
        return response()->json(['message' => $this->getMessage()], 503);
    }
}

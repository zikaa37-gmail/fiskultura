<?php

namespace App\Services\Ai;

use Anthropic\Client;
use Anthropic\Core\Exceptions\APIConnectionException;
use Anthropic\Core\Exceptions\APIStatusException;
use Anthropic\Core\Exceptions\AuthenticationException;
use Anthropic\Core\Exceptions\RateLimitException;

class ClaudeAssistant implements Assistant
{
    private const MODEL = 'claude-opus-5-5';

    public function __construct(private readonly ?string $apiKey) {}

    public function available(): bool
    {
        return (string) $this->apiKey !== '';
    }

    public function json(string $system, string $prompt, array $schema): array
    {
        if (! $this->available()) {
            throw new AiUnavailableException('AI nije podešen na serveru (nedostaje ANTHROPIC_API_KEY).');
        }

        try {
            $message = (new Client(apiKey: $this->apiKey))->beta->messages->create(
                model: self::MODEL,
                maxTokens: 16000,
                system: $system,
                messages: [['role' => 'user', 'content' => $prompt]],
                outputConfig: [
                    'effort' => 'high',
                    'format' => ['type' => 'json_schema', 'schema' => $schema],
                ],
                fallbacks: 'default',
                betas: ['server-side-fallback-2026-07-01'],
            );
        } catch (AuthenticationException $error) {
            report($error);
            throw new AiUnavailableException('AI ključ na serveru nije ispravan.');
        } catch (RateLimitException $error) {
            throw new AiUnavailableException('AI je trenutno zauzet. Probajte ponovo za minut.');
        } catch (APIStatusException|APIConnectionException $error) {
            report($error);
            throw new AiUnavailableException('AI trenutno nije dostupan. Probajte ponovo kasnije.');
        }

        if ($message->stopReason === 'refusal') {
            throw new AiUnavailableException('AI je odbio da obradi ovaj sadržaj. Uradite sažetak ručno.');
        }
        if ($message->stopReason === 'max_tokens') {
            throw new AiUnavailableException('Sadržaj je predugačak za jednu analizu.');
        }

        foreach ($message->content as $block) {
            if ($block->type === 'text') {
                $data = json_decode($block->text, true);
                if (is_array($data)) {
                    return $data;
                }
            }
        }

        throw new AiUnavailableException('AI nije vratio ispravan odgovor. Probajte ponovo.');
    }
}

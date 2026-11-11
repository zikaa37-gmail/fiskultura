<?php

namespace App\Services\Ai;

use Anthropic\Beta\Messages\BetaWebSearchTool20260209;
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

    public function research(string $system, string $prompt): array
    {
        if (! $this->available()) {
            throw new AiUnavailableException('AI nije podešen na serveru (nedostaje ANTHROPIC_API_KEY).');
        }

        $client = new Client(apiKey: $this->apiKey, requestOptions: ['timeout' => 240]);
        $messages = [['role' => 'user', 'content' => $prompt]];
        $tools = [BetaWebSearchTool20260209::with(maxUses: 8)];

        try {
            for ($round = 0; $round < 4; $round++) {
                $message = $client->beta->messages->create(
                    model: self::MODEL,
                    maxTokens: 16000,
                    system: $system,
                    messages: $messages,
                    tools: $tools,
                    outputConfig: ['effort' => 'medium'],
                    fallbacks: 'default',
                    betas: ['server-side-fallback-2026-07-01'],
                );
                if ($message->stopReason !== 'pause_turn') {
                    break;
                }
                $messages = [['role' => 'user', 'content' => $prompt], ['role' => 'assistant', 'content' => $message->content]];
            }
        } catch (AuthenticationException $error) {
            report($error);
            throw new AiUnavailableException('AI ključ na serveru nije ispravan.');
        } catch (RateLimitException) {
            throw new AiUnavailableException('AI je trenutno zauzet. Probajte ponovo za nekoliko minuta.');
        } catch (APIStatusException|APIConnectionException $error) {
            report($error);
            throw new AiUnavailableException('AI trenutno nije dostupan. Probajte ponovo kasnije.');
        }

        if ($message->stopReason === 'refusal') {
            throw new AiUnavailableException('AI je odbio da obradi ovu temu.');
        }

        $text = '';
        $sources = [];
        foreach ($message->content as $block) {
            if ($block->type !== 'text') {
                continue;
            }
            $text .= $block->text;
            foreach ($block->citations ?? [] as $citation) {
                if (($citation->type ?? null) === 'web_search_result_location' && ! isset($sources[$citation->url])) {
                    $sources[$citation->url] = ['title' => $citation->title ?: parse_url($citation->url, PHP_URL_HOST), 'url' => $citation->url];
                }
            }
        }

        if (trim($text) === '') {
            throw new AiUnavailableException('AI nije vratio pregled. Probajte ponovo.');
        }

        return ['text' => trim($text), 'sources' => array_values($sources)];
    }
}

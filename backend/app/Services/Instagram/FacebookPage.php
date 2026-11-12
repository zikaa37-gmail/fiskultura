<?php

namespace App\Services\Instagram;

use App\Models\InstagramPost;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class FacebookPage
{
    public const API = 'https://graph.facebook.com';

    public function connect(string $pageId, string $token, ?User $by = null): SocialAccount
    {
        $response = Http::timeout(15)->get(self::API."/{$pageId}", ['fields' => 'id,name,access_token', 'access_token' => $token]);
        if (! $response->successful() || ! $response->json('id')) {
            throw ValidationException::withMessages(['token' => ['Facebook nije prihvatio ID stranice i token. Treba token stranice (Page access token) sa dozvolom pages_manage_posts.']]);
        }

        $account = SocialAccount::facebook();
        $account->fill([
            'username' => $response->json('name'),
            'external_id' => (string) $response->json('id'),
            'token' => $response->json('access_token') ?: $token,
            'token_expires_at' => null,
            'connected_by' => $by?->id,
        ])->save();

        return $account->fresh();
    }

    public function disconnect(): SocialAccount
    {
        $account = SocialAccount::facebook();
        if ($account->exists) {
            $account->fill(['username' => null, 'external_id' => null, 'token' => null, 'token_expires_at' => null])->save();
        }

        return $account;
    }

    public function publish(InstagramPost $post): void
    {
        $account = SocialAccount::facebook();

        try {
            if (! $account->connected()) {
                throw new RuntimeException('Facebook stranica nije povezana.');
            }
            $response = Http::asForm()->timeout(60)->post(self::API."/{$account->external_id}/photos", array_filter([
                'url' => $post->imageUrl(),
                'caption' => $post->caption,
                'access_token' => $account->token,
            ]));
            $postId = (string) ($response->json('post_id') ?: $response->json('id'));
            if (! $response->successful() || $postId === '') {
                throw new RuntimeException($response->json('error.error_user_msg') ?? $response->json('error.message') ?? 'Facebook je odbio objavu.');
            }
            $permalink = Http::timeout(15)->get(self::API."/{$postId}", ['fields' => 'permalink_url', 'access_token' => $account->token])->json('permalink_url');

            $post->update(['facebook_status' => InstagramPost::PUBLISHED, 'facebook_post_id' => $postId, 'facebook_permalink' => $permalink ?: "https://www.facebook.com/{$postId}", 'facebook_error' => null]);
        } catch (RuntimeException $error) {
            $post->update(['facebook_status' => InstagramPost::FAILED, 'facebook_error' => $error->getMessage()]);
        } catch (ConnectionException) {
            $post->update(['facebook_status' => InstagramPost::FAILED, 'facebook_error' => 'Facebook trenutno nije dostupan. Pokušajte ponovo za nekoliko minuta.']);
        }
    }
}

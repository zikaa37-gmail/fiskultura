<?php

namespace App\Services\Instagram;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class InstagramAccount
{
    public const API = 'https://graph.instagram.com';

    public function connect(string $token, ?User $by = null, int $expiresIn = 5184000): SocialAccount
    {
        $response = Http::timeout(15)->get(self::API.'/me', ['fields' => 'user_id,username', 'access_token' => $token]);
        if (! $response->successful() || ! $response->json('username')) {
            throw ValidationException::withMessages(['token' => ['Instagram nije prihvatio token. Token mora biti za poslovni (Business / Creator) nalog, napravljen u Meta aplikaciji (Instagram API sa Instagram prijavom).']]);
        }

        $account = SocialAccount::instagram();
        $account->fill([
            'api' => null,
            'username' => $response->json('username'),
            'external_id' => $response->json('user_id') ? (string) $response->json('user_id') : null,
            'token' => $token,
            'token_expires_at' => now()->addSeconds($expiresIn),
            'connected_by' => $by?->id,
        ])->save();

        $this->refresh();

        return $account->fresh();
    }

    public function disconnect(): SocialAccount
    {
        $account = SocialAccount::instagram();
        if ($account->exists) {
            $account->fill(['username' => null, 'external_id' => null, 'token' => null, 'token_expires_at' => null])->save();
        }

        return $account;
    }

    public function refresh(): bool
    {
        $account = SocialAccount::instagram();
        if (! $account->connected() || $account->viaFacebook()) {
            return false;
        }

        $response = Http::timeout(15)->get(self::API.'/refresh_access_token', ['grant_type' => 'ig_refresh_token', 'access_token' => $account->token]);
        if (! $response->successful() || ! $response->json('access_token')) {
            return false;
        }

        $account->fill([
            'token' => $response->json('access_token'),
            'token_expires_at' => now()->addSeconds((int) $response->json('expires_in', 5184000)),
        ])->save();

        return true;
    }
}

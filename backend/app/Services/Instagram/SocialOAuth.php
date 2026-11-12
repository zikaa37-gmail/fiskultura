<?php

namespace App\Services\Instagram;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class SocialOAuth
{
    public const NETWORKS = ['instagram', 'facebook'];

    public function __construct(private readonly InstagramAccount $instagram, private readonly FacebookPage $facebook) {}

    public function available(string $network): bool
    {
        return (bool) config("social.{$network}.app_id") && (bool) config("social.{$network}.app_secret");
    }

    public function authorizeUrl(string $network, User $user): string
    {
        $state = Crypt::encryptString(json_encode(['uid' => $user->id, 'net' => $network, 'exp' => now()->addMinutes(15)->timestamp]));
        $query = [
            'client_id' => config("social.{$network}.app_id"),
            'redirect_uri' => $this->redirectUri($network),
            'response_type' => 'code',
            'scope' => implode(',', config("social.{$network}.scopes")),
            'state' => $state,
        ];

        return $network === 'instagram'
            ? 'https://www.instagram.com/oauth/authorize?'.http_build_query($query + ['enable_fb_login' => 0])
            : 'https://www.facebook.com/'.config('social.facebook.version').'/dialog/oauth?'.http_build_query($query);
    }

    public function redirectUri(string $network): string
    {
        return config("social.{$network}.redirect_uri") ?: rtrim((string) config('app.url'), '/')."/api/public/social/{$network}/callback";
    }

    public function callback(string $network, ?string $code, ?string $state): SocialAccount
    {
        try {
            $payload = json_decode(Crypt::decryptString((string) $state), true);
        } catch (DecryptException) {
            $payload = null;
        }
        $user = $payload && ($payload['net'] ?? null) === $network && ($payload['exp'] ?? 0) >= now()->timestamp ? User::find($payload['uid'] ?? 0) : null;
        if (! $user?->isAdmin() || ! $code) {
            throw ValidationException::withMessages(['oauth' => ['Povezivanje je isteklo ili je otkazano. Pokušajte ponovo.']]);
        }

        return $network === 'instagram' ? $this->instagramCallback($code, $user) : $this->facebookCallback($code, $user);
    }

    private function instagramCallback(string $code, User $user): SocialAccount
    {
        $short = Http::asForm()->timeout(15)->post('https://api.instagram.com/oauth/access_token', [
            'client_id' => config('social.instagram.app_id'),
            'client_secret' => config('social.instagram.app_secret'),
            'grant_type' => 'authorization_code',
            'redirect_uri' => $this->redirectUri('instagram'),
            'code' => $code,
        ]);
        if (! $short->successful() || ! $short->json('access_token')) {
            throw ValidationException::withMessages(['oauth' => ['Instagram nije izdao pristup. Nalog mora biti poslovni (Business / Creator).']]);
        }

        $long = Http::timeout(15)->get(InstagramAccount::API.'/access_token', [
            'grant_type' => 'ig_exchange_token',
            'client_secret' => config('social.instagram.app_secret'),
            'access_token' => $short->json('access_token'),
        ]);
        if (! $long->successful() || ! $long->json('access_token')) {
            throw ValidationException::withMessages(['oauth' => ['Instagram nije izdao dugotrajni pristup. Pokušajte ponovo.']]);
        }

        return $this->instagram->connect($long->json('access_token'), $user, (int) $long->json('expires_in', 5184000));
    }

    private function facebookCallback(string $code, User $user): SocialAccount
    {
        $api = FacebookPage::API.'/'.config('social.facebook.version');
        $short = Http::timeout(15)->get("{$api}/oauth/access_token", [
            'client_id' => config('social.facebook.app_id'),
            'client_secret' => config('social.facebook.app_secret'),
            'redirect_uri' => $this->redirectUri('facebook'),
            'code' => $code,
        ]);
        if (! $short->successful() || ! $short->json('access_token')) {
            throw ValidationException::withMessages(['oauth' => ['Facebook nije izdao pristup. Pokušajte ponovo.']]);
        }

        $long = Http::timeout(15)->get("{$api}/oauth/access_token", [
            'grant_type' => 'fb_exchange_token',
            'client_id' => config('social.facebook.app_id'),
            'client_secret' => config('social.facebook.app_secret'),
            'fb_exchange_token' => $short->json('access_token'),
        ]);
        $userToken = $long->json('access_token') ?: $short->json('access_token');

        $pages = collect(Http::timeout(15)->get("{$api}/me/accounts", ['fields' => 'id,name,access_token', 'limit' => 100, 'access_token' => $userToken])->json('data') ?? []);
        $wanted = (string) config('social.facebook.page_id');
        $page = $pages->firstWhere('id', $wanted) ?? ($pages->count() === 1 ? $pages->first() : null);
        if (! $page || empty($page['access_token'])) {
            $names = $pages->pluck('name')->filter()->implode(', ');
            throw ValidationException::withMessages(['oauth' => [$pages->isEmpty()
                ? 'Facebook nije dao pristup nijednoj stranici. U prozoru za dozvole izaberite stranicu Fiskultura RS.'
                : "Stranica {$wanted} nije među dozvoljenim ({$names}). U prozoru za dozvole izaberite stranicu Fiskultura RS."]]);
        }

        return $this->facebook->connect((string) $page['id'], $userToken, $user);
    }
}

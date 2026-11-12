<?php

namespace App\Services\Instagram;

use App\Models\InstagramPost;
use App\Models\SocialAccount;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class InstagramPublisher
{
    private const API = InstagramAccount::API;

    private const STATUS_CHECKS = 10;

    public function __construct(private readonly int $pollSeconds = 3) {}

    public function available(): bool
    {
        return SocialAccount::instagram()->connected() || SocialAccount::facebook()->connected();
    }

    public function publish(InstagramPost $post): InstagramPost
    {
        @set_time_limit(180);
        $post->update(['status' => InstagramPost::PUBLISHING]);

        if ($post->wants('instagram') && $post->media_id === null) {
            $this->publishInstagram($post);
        }
        if ($post->wants('facebook') && $post->facebook_status !== InstagramPost::PUBLISHED) {
            app(FacebookPage::class)->publish($post);
        }

        $post->refresh();
        $done = (! $post->wants('instagram') || $post->media_id !== null) && (! $post->wants('facebook') || $post->facebook_status === InstagramPost::PUBLISHED);
        $post->update([
            'status' => $done ? InstagramPost::PUBLISHED : InstagramPost::FAILED,
            'published_at' => $done ? now() : $post->published_at,
            'image' => $done ? null : $post->image,
        ]);

        return $post->refresh();
    }

    private function publishInstagram(InstagramPost $post): void
    {
        $account = SocialAccount::instagram();
        $post->update(['error' => null]);

        try {
            if (! $account->connected()) {
                throw new RuntimeException('Instagram nije povezan.');
            }
            $token = $account->token;
            $userId = $this->userId($account);

            $params = ['image_url' => $post->imageUrl(), 'access_token' => $token];
            if ($post->kind === InstagramPost::KIND_STORY) {
                $params['media_type'] = 'STORIES';
            } elseif ($post->caption) {
                $params['caption'] = $post->caption;
            }

            $containerId = $this->expect(Http::asForm()->timeout(60)->post(self::API."/{$userId}/media", $params), 'id');
            $this->waitUntilReady($containerId, $token);
            $mediaId = $this->expect(Http::asForm()->timeout(60)->post(self::API."/{$userId}/media_publish", ['creation_id' => $containerId, 'access_token' => $token]), 'id');
            $permalink = Http::timeout(15)->get(self::API."/{$mediaId}", ['fields' => 'permalink', 'access_token' => $token])->json('permalink');

            $post->update(['media_id' => $mediaId, 'permalink' => $permalink]);
        } catch (RuntimeException $error) {
            $post->update(['error' => $error->getMessage()]);
        } catch (ConnectionException) {
            $post->update(['error' => 'Instagram trenutno nije dostupan. Pokušajte ponovo za nekoliko minuta.']);
        }
    }

    public function publishDue(): int
    {
        if (! $this->available()) {
            return 0;
        }

        $due = InstagramPost::where('status', InstagramPost::SCHEDULED)->where('scheduled_at', '<=', now())->orderBy('scheduled_at')->get();
        $due->each(fn (InstagramPost $post) => $this->publish($post));

        return $due->count();
    }

    private function userId(SocialAccount $account): string
    {
        if ($account->external_id) {
            return $account->external_id;
        }

        $id = (string) Http::timeout(15)->get(self::API.'/me', ['fields' => 'user_id', 'access_token' => $account->token])->json('user_id');
        if ($id === '') {
            throw new RuntimeException('Instagram nije vratio podatke o nalogu. Povežite nalog ponovo.');
        }
        $account->fill(['external_id' => $id])->save();

        return $id;
    }

    private function waitUntilReady(string $containerId, string $token): void
    {
        for ($i = 0; $i < self::STATUS_CHECKS; $i++) {
            $status = Http::timeout(15)->get(self::API."/{$containerId}", ['fields' => 'status_code', 'access_token' => $token])->json('status_code');
            if ($status === 'FINISHED' || $status === null) {
                return;
            }
            if (in_array($status, ['ERROR', 'EXPIRED'], true)) {
                throw new RuntimeException('Instagram nije mogao da obradi sliku. Proverite format (JPEG, razmera 4:5 do 1,91:1 za objavu, 9:16 za story).');
            }
            sleep($this->pollSeconds);
        }

        throw new RuntimeException('Instagram predugo obrađuje sliku. Pokušajte ponovo za nekoliko minuta.');
    }

    private function expect(Response $response, string $key): string
    {
        $value = (string) $response->json($key);
        if (! $response->successful() || $value === '') {
            throw new RuntimeException($response->json('error.error_user_msg') ?? $response->json('error.message') ?? 'Instagram je odbio objavu.');
        }

        return $value;
    }
}

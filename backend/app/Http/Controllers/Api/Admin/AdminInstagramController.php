<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InstagramPost;
use App\Models\SocialAccount;
use App\Services\Instagram\FacebookPage;
use App\Services\Instagram\InstagramAccount;
use App\Services\Instagram\InstagramPublisher;
use App\Services\Instagram\SocialOAuth;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class AdminInstagramController extends Controller
{
    public function __construct(private readonly InstagramPublisher $publisher) {}

    public function state()
    {
        $oauth = app(SocialOAuth::class);
        $facebook = SocialAccount::facebook();

        return response()->json(SocialAccount::instagram()->present() + [
            'facebook' => $facebook->present() + ['page_id' => $facebook->external_id ?: (string) config('social.facebook.page_id')],
            'oauth' => ['instagram' => $oauth->available('instagram'), 'facebook' => $oauth->available('facebook')],
        ]);
    }

    public function authorize(Request $request, SocialOAuth $oauth, string $network)
    {
        abort_unless(in_array($network, SocialOAuth::NETWORKS, true), 404);
        abort_unless($oauth->available($network), 422, 'Povezivanje preko '.($network === 'instagram' ? 'Instagrama' : 'Facebooka').' nije podešeno na serveru (ID i tajna Meta aplikacije u .env).');

        return response()->json(['url' => $oauth->authorizeUrl($network, $request->user())]);
    }

    public function callback(Request $request, SocialOAuth $oauth, string $network)
    {
        abort_unless(in_array($network, SocialOAuth::NETWORKS, true), 404);
        $target = rtrim((string) config('app.frontend_url'), '/').'/admin/drustvene-mreze';
        if ($request->filled('error')) {
            return redirect($target.'?greska='.rawurlencode('Povezivanje je otkazano.'));
        }

        try {
            $oauth->callback($network, $request->query('code'), $request->query('state'));
        } catch (ValidationException $error) {
            return redirect($target.'?greska='.rawurlencode((string) collect($error->errors())->flatten()->first()));
        }

        return redirect($target.'?povezano='.$network);
    }

    public function connectFacebook(Request $request, FacebookPage $page)
    {
        $data = $request->validate([
            'page_id' => ['required', 'string', 'regex:/^\d{5,30}$/'],
            'token' => ['required', 'string', 'min:20', 'max:1000'],
        ], ['page_id.required' => 'Upišite ID stranice.', 'page_id.regex' => 'ID stranice je broj (Podešavanja stranice → O stranici).', 'token.required' => 'Nalepite token.', 'token.min' => 'Token je prekratak.']);

        return response()->json($page->connect($data['page_id'], trim($data['token']), $request->user())->present());
    }

    public function disconnectFacebook(FacebookPage $page)
    {
        return response()->json($page->disconnect()->present());
    }

    public function connect(Request $request, InstagramAccount $account)
    {
        $data = $request->validate(['token' => ['required', 'string', 'min:20', 'max:1000']], ['token.required' => 'Nalepite token.', 'token.min' => 'Token je prekratak.']);

        return response()->json($account->connect(trim($data['token']), $request->user())->present());
    }

    public function disconnect(InstagramAccount $account)
    {
        return response()->json($account->disconnect()->present());
    }

    public function index()
    {
        return response()->json(InstagramPost::with('author')->orderByDesc('scheduled_at')->orderByDesc('id')->limit(50)->get()
            ->map(fn (InstagramPost $post) => $post->present())->values());
    }

    public function store(Request $request)
    {
        if (! $this->publisher->available()) {
            abort(422, 'Instagram i Facebook nisu povezani. Administrator ih povezuje na ovoj stranici.');
        }

        $data = $request->validate([
            'kind' => ['required', Rule::in(InstagramPost::KINDS)],
            'caption' => ['nullable', 'string', 'max:2200'],
            'image' => ['required', 'string', 'max:'.InstagramPost::MAX_IMAGE_LENGTH, 'regex:/^data:image\/jpeg;base64,/'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
            'source_type' => ['nullable', Rule::in(InstagramPost::SOURCES)],
            'source_id' => ['nullable', 'integer'],
            'networks' => ['nullable', 'array', 'min:1'],
            'networks.*' => [Rule::in(InstagramPost::NETWORKS)],
        ], [
            'networks.min' => 'Izaberite gde se objavljuje.',
            'image.required' => 'Dodajte sliku.',
            'image.regex' => 'Slika mora biti JPEG.',
            'image.max' => 'Slika je prevelika.',
            'scheduled_at.after' => 'Vreme objave mora biti u budućnosti.',
        ]);

        $networks = array_values(array_unique($data['networks'] ?? ['instagram']));
        if ($data['kind'] === InstagramPost::KIND_STORY && $networks !== ['instagram']) {
            abort(422, 'Story se objavljuje samo na Instagramu.');
        }
        foreach ($networks as $network) {
            $account = $network === 'facebook' ? SocialAccount::facebook() : SocialAccount::instagram();
            if (! $account->connected()) {
                abort(422, ($network === 'facebook' ? 'Facebook stranica' : 'Instagram').' nije povezan.');
            }
        }

        $post = InstagramPost::create([
            'networks' => $networks,
            'kind' => $data['kind'],
            'caption' => $data['kind'] === InstagramPost::KIND_POST ? (trim($data['caption'] ?? '') ?: null) : null,
            'image' => $data['image'],
            'status' => InstagramPost::SCHEDULED,
            'scheduled_at' => isset($data['scheduled_at']) ? Carbon::parse($data['scheduled_at'])->setTimezone(config('app.timezone')) : now(),
            'source_type' => $data['source_type'] ?? null,
            'source_id' => $data['source_id'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        if (! isset($data['scheduled_at'])) {
            $post = $this->publisher->publish($post);
        }

        return response()->json($post->load('author')->present(), 201);
    }

    public function publish(InstagramPost $post)
    {
        if (! in_array($post->status, [InstagramPost::FAILED, InstagramPost::SCHEDULED], true) || ! $post->image) {
            abort(422, 'Ova objava ne može ponovo da se objavi.');
        }

        return response()->json($this->publisher->publish($post)->load('author')->present());
    }

    public function destroy(InstagramPost $post)
    {
        if ($post->status === InstagramPost::PUBLISHED) {
            abort(422, 'Objava je već objavljena. Obrišite je na Instagramu ili Facebooku.');
        }
        $post->delete();

        return response()->json(['message' => 'Objava je obrisana.']);
    }

    public function media(string $token)
    {
        $bytes = InstagramPost::where('token', $token)->first()?->imageBytes();
        if (! $bytes) {
            abort(404);
        }

        return response($bytes, 200, ['Content-Type' => 'image/jpeg', 'Cache-Control' => 'public, max-age=3600']);
    }
}

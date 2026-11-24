<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\SubscriptionMail;
use App\Models\News;
use App\Models\Subscription;
use App\Services\Inbox;
use App\Services\Notifications\NewsNotifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class SubscriptionController extends Controller
{
    private const RESEND_AFTER_MINUTES = 5;

    public function __construct(private NewsNotifier $notifier) {}

    public function subscribe(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:190'],
            ...$this->preferenceRules(),
        ]);

        $subscription = Subscription::firstOrNew(['email' => Str::lower($data['email'])]);

        if ($subscription->exists && $subscription->isActive()) {
            $this->sendMail($subscription, Subscription::MANAGE);
        } else {
            $subscription->fill($this->preferences($data));
            $subscription->forceFill(['confirmed_at' => null, 'unsubscribed_at' => null])->save();
            $this->sendMail($subscription, Subscription::CONFIRM);
        }

        return response()->json(['message' => 'Proverite mejl: poslali smo link kojim potvrđujete prijavu ili menjate podešavanja.']);
    }

    public function confirm(Request $request)
    {
        $subscription = $this->fromToken($request, Subscription::CONFIRM);

        if (! $subscription->isActive()) {
            $subscription->forceFill(['confirmed_at' => now(), 'unsubscribed_at' => null, 'last_digest_at' => now()])->save();
        }

        return response()->json($this->present($subscription, withToken: true));
    }

    public function manage(Request $request)
    {
        return response()->json($this->present($this->fromToken($request, Subscription::MANAGE)));
    }

    public function updateManaged(Request $request)
    {
        $subscription = $this->fromToken($request, Subscription::MANAGE);
        $data = $request->validate([...$this->preferenceRules(), 'active' => ['required', 'boolean']]);

        $this->apply($subscription, $data);

        return response()->json($this->present($subscription));
    }

    public function unsubscribe(Request $request)
    {
        $subscription = $this->fromToken($request, Subscription::UNSUBSCRIBE);

        if ($subscription->unsubscribed_at === null) {
            $subscription->forceFill(['unsubscribed_at' => now()])->save();
        }

        return response()->json([...$this->present($subscription, withToken: true), 'message' => 'Odjavljeni ste. Više vam nećemo slati obaveštenja.']);
    }

    public function mine(Request $request)
    {
        $user = $request->user();
        $subscription = Subscription::where('email', Str::lower($user->email))->first();

        return response()->json($subscription ? $this->present($subscription) : [
            'email' => $user->email, 'categories' => [], 'organization_ids' => [], 'frequency' => Subscription::INSTANT,
            'confirmed' => false, 'active' => false,
        ]);
    }

    public function updateMine(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([...$this->preferenceRules(), 'active' => ['required', 'boolean']]);

        $subscription = Subscription::firstOrNew(['email' => Str::lower($user->email)]);
        $subscription->user_id = $user->id;
        if (! $subscription->confirmed_at && $user->email_verified_at) {
            $subscription->forceFill(['confirmed_at' => now(), 'last_digest_at' => now()]);
        }
        $this->apply($subscription, $data);

        return response()->json($this->present($subscription));
    }

    private function apply(Subscription $subscription, array $data): void
    {
        $subscription->fill($this->preferences($data));
        if ($data['active'] && $subscription->unsubscribed_at) {
            $subscription->forceFill(['unsubscribed_at' => null, 'last_digest_at' => now()]);
        }
        if (! $data['active'] && ! $subscription->unsubscribed_at) {
            $subscription->forceFill(['unsubscribed_at' => now()]);
        }
        $subscription->save();
    }

    private function preferenceRules(): array
    {
        return [
            'frequency' => ['required', Rule::in(Subscription::FREQUENCIES)],
            'categories' => ['present', 'array'],
            'categories.*' => ['distinct', Rule::in(News::CATEGORIES)],
            'organization_ids' => ['present', 'array'],
            'organization_ids.*' => ['integer', 'distinct', 'exists:organizations,id'],
        ];
    }

    private function preferences(array $data): array
    {
        return [
            'frequency' => $data['frequency'],
            'categories' => array_values($data['categories']),
            'organization_ids' => array_map('intval', array_values($data['organization_ids'])),
        ];
    }

    private function fromToken(Request $request, string $purpose): Subscription
    {
        $id = $request->input('id', $request->query('id'));
        $token = $request->input('token', $request->query('token'));
        $subscription = is_numeric($id) ? Subscription::find((int) $id) : null;

        abort_unless($subscription && $subscription->hasToken($purpose, is_string($token) ? $token : null), 404, 'Link nije ispravan ili prijava više ne postoji.');

        return $subscription;
    }

    private function sendMail(Subscription $subscription, string $purpose): void
    {
        if ($subscription->confirmation_sent_at?->gt(now()->subMinutes(self::RESEND_AFTER_MINUTES))) {
            return;
        }

        $subscription->forceFill(['confirmation_sent_at' => now()])->save();
        try {
            Mail::to($subscription->email)->send(new SubscriptionMail($subscription, $purpose));
            $this->notifier->record($subscription, $purpose);
            if ($subscription->user) {
                app(Inbox::class)->record(
                    $subscription->user,
                    'subscription',
                    $purpose === Subscription::CONFIRM ? 'Potvrdite prijavu na obaveštenja' : 'Link za podešavanja obaveštenja',
                    $purpose === Subscription::CONFIRM ? 'Poslali smo mejl sa linkom za potvrdu. Obaveštenja počinju kad potvrdite prijavu.' : 'Poslali smo mejl sa linkom za izmenu ili odjavu obaveštenja.',
                    '/obavestenja',
                );
            }
        } catch (Throwable $error) {
            $this->notifier->record($subscription, $purpose, null, $error);
            report($error);
        }
    }

    private function present(Subscription $subscription, bool $withToken = false): array
    {
        return [
            'email' => $subscription->email,
            'categories' => $subscription->categories ?? [],
            'organization_ids' => $subscription->organization_ids ?? [],
            'frequency' => $subscription->frequency,
            'confirmed' => $subscription->confirmed_at !== null,
            'active' => $subscription->isActive(),
            ...($withToken ? ['id' => $subscription->id, 'manage_token' => $subscription->token(Subscription::MANAGE)] : []),
        ];
    }
}

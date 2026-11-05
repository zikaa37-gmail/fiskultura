<?php

namespace App\Services\Notifications;

use App\Models\News;
use App\Models\Subscription;
use Illuminate\Support\Collection;

final readonly class Notice
{
    public function __construct(
        public string $kind,
        public string $subject,
        public string $heading,
        public string $intro,
        public array $items,
        public string $manageUrl,
        public string $unsubscribeUrl,
        public string $oneClickUnsubscribeUrl,
    ) {}

    public static function forNews(Subscription $subscription, string $kind, Collection $news): self
    {
        $items = $news->map(fn (News $item) => [
            'title' => $item->title,
            'summary' => $item->summary,
            'meta' => trim(($item->organization?->short_name ?? $item->organization?->name ?? '').' · '.$item->published_at?->format('j. n. Y.'), ' ·'),
            'url' => rtrim((string) config('app.frontend_url'), '/')."/vesti/{$item->slug}",
        ])->values()->all();

        $weekly = $kind === Subscription::WEEKLY;

        return new self(
            kind: $kind,
            subject: $weekly ? 'Fiskultura: pregled vesti za nedelju ('.count($items).')' : 'Fiskultura: '.$news->first()->title,
            heading: $weekly ? 'Vesti ove nedelje' : 'Nova istaknuta vest',
            intro: $weekly ? 'Šta je objavljeno na portalu u poslednjih sedam dana, prema vašim podešavanjima.' : 'Na portalu je upravo objavljena vest koju pratite.',
            items: $items,
            manageUrl: $subscription->link('obavestenja', Subscription::MANAGE),
            unsubscribeUrl: $subscription->link('obavestenja/odjava', Subscription::UNSUBSCRIBE),
            oneClickUnsubscribeUrl: rtrim((string) config('app.url'), '/')."/api/subscriptions/unsubscribe?id={$subscription->id}&token={$subscription->token(Subscription::UNSUBSCRIBE)}",
        );
    }
}

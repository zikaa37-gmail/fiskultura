<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\Organization;
use App\Models\Question;
use App\Models\Regulation;
use Illuminate\Support\Carbon;

class SeoController extends Controller
{
    public const STATIC_PAGES = [
        '/' => ['daily', '1.0'],
        '/vesti' => ['daily', '0.9'],
        '/udruzenja' => ['weekly', '0.8'],
        '/propisi' => ['weekly', '0.8'],
        '/propisi/fond-casova' => ['monthly', '0.8'],
        '/propisi/programi-i-ishodi' => ['monthly', '0.8'],
        '/kontakt' => ['yearly', '0.4'],
        '/pitanja' => ['weekly', '0.8'],
        '/sportovi' => ['monthly', '0.6'],
        '/sportovi/kosarka' => ['monthly', '0.6'],
        '/sportovi/odbojka' => ['monthly', '0.6'],
        '/sportovi/rukomet' => ['monthly', '0.6'],
        '/sportovi/mali-fudbal' => ['monthly', '0.6'],
        '/sportovi/jadzent' => ['monthly', '0.6'],
        '/sportovi/kros' => ['monthly', '0.6'],
        '/sportovi/testiranje' => ['monthly', '0.6'],
        '/sportovi/atletika' => ['monthly', '0.6'],
        '/sportovi/gimnastika' => ['monthly', '0.6'],
        '/sportovi/elementarne-igre' => ['monthly', '0.6'],
        '/sportovi/vezbe-sa-rekvizitima' => ['monthly', '0.6'],
        '/sportovi/plesovi' => ['monthly', '0.6'],
        '/literatura' => ['monthly', '0.5'],
        '/ishodi' => ['monthly', '0.7'],
        '/ishodi/1-razred' => ['monthly', '0.6'],
        '/ishodi/2-razred' => ['monthly', '0.6'],
        '/ishodi/3-razred' => ['monthly', '0.6'],
        '/ishodi/4-razred' => ['monthly', '0.6'],
        '/ishodi/5-razred' => ['monthly', '0.6'],
        '/ishodi/6-razred' => ['monthly', '0.6'],
        '/ishodi/7-razred' => ['monthly', '0.6'],
        '/ishodi/8-razred' => ['monthly', '0.6'],
        '/ishodi/1-razred-srednje' => ['monthly', '0.6'],
        '/ishodi/2-razred-srednje' => ['monthly', '0.6'],
        '/ishodi/3-razred-srednje' => ['monthly', '0.6'],
        '/ishodi/4-razred-srednje' => ['monthly', '0.6'],
        '/aplikacije' => ['monthly', '0.6'],
        '/obavestenja' => ['monthly', '0.4'],
    ];

    public function routes()
    {
        return response()->json([
            'news' => News::visible()->orderByDesc('published_at')->get(['slug', 'updated_at', 'published_at'])
                ->map(fn (News $news) => ['slug' => $news->slug, 'updated_at' => $this->lastmod($news->updated_at, $news->published_at)])->values(),
            'organizations' => Organization::orderBy('name')->get(['slug', 'updated_at'])
                ->map(fn (Organization $organization) => ['slug' => $organization->slug, 'updated_at' => $organization->updated_at?->toIso8601String()])->values(),
            'questions' => Question::visible()->orderByDesc('published_at')->get(['slug', 'updated_at', 'published_at'])
                ->map(fn (Question $question) => ['slug' => $question->slug, 'updated_at' => $this->lastmod($question->updated_at, $question->published_at)])->values(),
        ]);
    }

    public function sitemap()
    {
        $base = rtrim((string) config('app.frontend_url'), '/');
        $latest = fn (?string $value) => $value ? Carbon::parse($value)->toDateString() : null;
        $routes = $this->routes()->getData(true);

        $urls = [];
        $newest = [
            '/' => News::visible()->max('published_at'),
            '/vesti' => News::visible()->max('published_at'),
            '/udruzenja' => Organization::max('updated_at'),
            '/propisi' => Regulation::max('updated_at'),
            '/pitanja' => Question::visible()->max('updated_at'),
        ];
        foreach (self::STATIC_PAGES as $path => [$frequency, $priority]) {
            $urls[] = ['loc' => $base.($path === '/' ? '/' : $path), 'lastmod' => $latest($newest[$path] ?? null), 'changefreq' => $frequency, 'priority' => $priority];
        }
        foreach (['news' => ['/vesti/', 'monthly', '0.7'], 'organizations' => ['/udruzenja/', 'weekly', '0.6'], 'questions' => ['/pitanja/', 'monthly', '0.7']] as $kind => [$prefix, $frequency, $priority]) {
            foreach ($routes[$kind] as $item) {
                $urls[] = ['loc' => $base.$prefix.rawurlencode($item['slug']), 'lastmod' => $latest($item['updated_at']), 'changefreq' => $frequency, 'priority' => $priority];
            }
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($urls as $url) {
            $xml .= '  <url><loc>'.e($url['loc']).'</loc>'
                .($url['lastmod'] ? "<lastmod>{$url['lastmod']}</lastmod>" : '')
                ."<changefreq>{$url['changefreq']}</changefreq><priority>{$url['priority']}</priority></url>\n";
        }
        $xml .= '</urlset>'."\n";

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8', 'Cache-Control' => 'public, max-age=3600']);
    }

    private function lastmod(?Carbon $updated, ?Carbon $published): ?string
    {
        $value = $updated && $published && $published->gt($updated) ? $published : ($updated ?? $published);

        return $value?->toIso8601String();
    }
}

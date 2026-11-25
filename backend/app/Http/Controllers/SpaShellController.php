<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\Organization;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SpaShellController extends Controller
{
    public const STATUS_PUBLIC = 'public';

    public const STATUS_PRIVATE = 'private';

    public const STATUS_MISSING = 'missing';

    public const EXTRA_PUBLIC_PAGES = ['/debate', '/udruzenja/osnivanje', '/udruzenja/posalji-objavu', '/pitanja/postavi'];

    public const PRIVATE_SECTIONS = [
        'admin', 'profil', 'imenik', 'notifikacije', 'prijava', 'registracija', 'potvrda-naloga',
        'zaboravljena-lozinka', 'zavrsi-registraciju', 'nova-lozinka', 'obavestenja/potvrda', 'obavestenja/odjava', 'udruzenja/osnivanje/potvrda',
    ];

    public function show(Request $request): Response
    {
        $path = $this->normalize($request->getPathInfo());
        if (str_starts_with($path, '/api/') || $path === '/api') {
            abort(404);
        }

        $shell = $this->shellPath($request);
        if (! $shell || ! is_file($shell)) {
            abort(404);
        }

        $status = $this->status($path);
        $html = $this->inject((string) file_get_contents($shell), $path, $status);

        return response($html, $status === self::STATUS_MISSING ? 404 : 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }

    public function status(string $path): string
    {
        $path = $this->normalize($path);
        $trimmed = ltrim($path, '/');

        foreach (self::PRIVATE_SECTIONS as $section) {
            if ($trimmed === $section || str_starts_with($trimmed, $section.'/')) {
                return self::STATUS_PRIVATE;
            }
        }

        if (array_key_exists($path, SeoController::STATIC_PAGES) || in_array($path, self::EXTRA_PUBLIC_PAGES, true)) {
            return self::STATUS_PUBLIC;
        }

        if (preg_match('#^/(vesti|pitanja|udruzenja|debate)/([^/]+)$#', $path, $match)) {
            $slug = rawurldecode($match[2]);
            $exists = match ($match[1]) {
                'vesti' => News::visible()->where('slug', $slug)->exists(),
                'pitanja' => Question::visible()->where('slug', $slug)->exists(),
                'udruzenja' => Organization::where('slug', $slug)->exists(),
                'debate' => true,
            };

            return $exists ? self::STATUS_PUBLIC : self::STATUS_MISSING;
        }

        return self::STATUS_MISSING;
    }

    private function inject(string $html, string $path, string $status): string
    {
        $tags = $status === self::STATUS_PUBLIC
            ? '<link rel="canonical" href="'.e(rtrim((string) config('app.frontend_url'), '/').$path).'">'
            : '<meta name="robots" content="noindex, nofollow">';

        $html = preg_replace('#<link rel="canonical"[^>]*>\s*#i', '', $html);

        return preg_replace('#</head>#i', $tags.'</head>', $html, 1);
    }

    private function normalize(string $path): string
    {
        $clean = '/'.trim(explode('?', $path)[0], '/');

        return $clean === '/' ? '/' : $clean;
    }

    private function shellPath(Request $request): ?string
    {
        $configured = config('app.spa_shell');
        if ($configured) {
            return $configured;
        }
        foreach ([dirname((string) $request->server('SCRIPT_FILENAME')), (string) $request->server('DOCUMENT_ROOT')] as $root) {
            $candidate = rtrim($root, '/\\').'/index.csr.html';
            if ($root !== '' && $root !== '.' && is_file($candidate)) {
                return $candidate;
            }
        }

        return null;
    }
}

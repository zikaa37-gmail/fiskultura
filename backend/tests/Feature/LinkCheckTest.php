<?php

namespace Tests\Feature;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LinkCheckTest extends TestCase
{
    use RefreshDatabase;

    private function organization(): Organization
    {
        return Organization::create([
            'slug' => 'upfk-test',
            'name' => 'UPFK Test',
            'type' => 'strukovno-udruzenje',
            'level' => 'gradski',
            'status' => 'aktivno',
            'website' => 'https://radi.example.org',
            'social' => [
                'facebook' => 'https://www.facebook.com/upfktest',
                'instagram' => 'https://www.instagram.com/nema-vise',
                'youtube' => 'https://ne-postoji.example.org',
            ],
            'member_source' => 'https://pada.example.org',
        ]);
    }

    public function test_marks_only_definitely_broken_links_and_exposes_status(): void
    {
        Http::fake([
            'radi.example.org*' => Http::response('ok'),
            'www.facebook.com/*' => Http::response('', 400),
            'www.instagram.com/*' => Http::response('', 404),
            'ne-postoji.example.org*' => fn () => throw new ConnectionException('DNS'),
            'pada.example.org*' => Http::response('', 503),
        ]);
        $organization = $this->organization();

        $this->artisan('organizations:check-links')
            ->expectsOutputToContain('Linkovi: 1 rade, 3 ne rade, 1 nije moguće proveriti.')
            ->assertSuccessful();

        $this->getJson('/api/organizations/upfk-test')
            ->assertOk()
            ->assertJsonPath('link_status.website', 'ok')
            ->assertJsonPath('link_status.facebook', 'unknown')
            ->assertJsonPath('link_status.instagram', 'broken')
            ->assertJsonPath('link_status.youtube', 'broken')
            ->assertJsonPath('link_status.member_source', 'broken');

        $organization->refresh();
        $organization->update(['social' => [...$organization->social, 'instagram' => 'https://www.instagram.com/novi-nalog']]);

        $this->getJson('/api/organizations/upfk-test')->assertJsonPath('link_status.instagram', 'unknown');
    }

    public function test_unchecked_links_are_unknown_and_missing_links_absent(): void
    {
        $this->organization()->update(['social' => null, 'member_source' => null]);

        $this->getJson('/api/organizations/upfk-test')
            ->assertJsonPath('link_status.website', 'unknown')
            ->assertJsonMissingPath('link_status.facebook')
            ->assertJsonMissingPath('link_status.member_source');
    }
}

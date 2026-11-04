<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use App\Services\LinkChecker;
use Database\Seeders\ContentSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class LinkCheckTest extends TestCase
{
    use AuthenticatesWithJwt;
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

    public function test_manual_broken_mark_survives_unknown_checks_until_link_works(): void
    {
        $organization = $this->organization();
        LinkChecker::markBroken($organization, ['facebook', 'website']);

        Http::fake([
            'radi.example.org*' => Http::response('ok'),
            'www.facebook.com/*' => Http::response('', 400),
            '*' => Http::response('ok'),
        ]);
        $this->artisan('organizations:check-links')->assertSuccessful();

        $this->getJson('/api/organizations/upfk-test')
            ->assertJsonPath('link_status.facebook', 'broken')
            ->assertJsonPath('link_status.website', 'ok');
    }

    public function test_facebook_and_instagram_are_never_confirmed_automatically(): void
    {
        $organization = $this->organization();
        LinkChecker::markBroken($organization, ['facebook']);

        Http::fake(['*' => Http::response('ok')]);
        $this->artisan('organizations:check-links')->assertSuccessful();

        $this->getJson('/api/organizations/upfk-test')
            ->assertJsonPath('link_status.website', 'ok')
            ->assertJsonPath('link_status.facebook', 'broken')
            ->assertJsonPath('link_status.instagram', 'unknown')
            ->assertJsonPath('link_status.youtube', 'ok');
    }

    public function test_editor_marks_and_unmarks_broken_links(): void
    {
        $this->seed(UserSeeder::class);
        $editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $organization = $this->organization();
        $payload = ['name' => 'UPFK Test', 'type' => 'strukovno-udruzenje', 'level' => 'gradski', 'status' => 'aktivno'];

        $this->withJwt($editor)->patchJson("/api/admin/organizations/{$organization->id}", [...$payload, 'broken_links' => ['facebook']])
            ->assertOk()
            ->assertJsonPath('broken_links', ['facebook'])
            ->assertJsonPath('link_status.facebook', 'broken');

        $this->withJwt($editor)->patchJson("/api/admin/organizations/{$organization->id}", [...$payload, 'broken_links' => []])
            ->assertOk()
            ->assertJsonPath('broken_links', [])
            ->assertJsonPath('link_status.facebook', 'unknown');
    }

    public function test_import_marks_broken_links_from_data_on_existing_organizations(): void
    {
        $this->seed(ContentSeeder::class);

        $this->getJson('/api/organizations/sspfvs')
            ->assertJsonPath('link_status.facebook', 'broken')
            ->assertJsonPath('link_status.youtube', 'unknown');
        $this->getJson('/api/organizations/zdravitas')->assertJsonPath('link_status.website', 'broken');

        LinkChecker::markBroken(Organization::where('slug', 'sspfvs')->firstOrFail(), []);
        $this->seed(ContentSeeder::class);
        $this->getJson('/api/organizations/sspfvs')->assertJsonPath('link_status.facebook', 'broken');
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

<?php

namespace Tests\Feature;

use App\Models\Regulation;
use App\Models\User;
use Database\Seeders\ContentSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class RegulationApiTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([UserSeeder::class, ContentSeeder::class]);
    }

    private function payload(array $overrides = []): array
    {
        return [
            'key' => 'pravilnik-o-proba',
            'title' => 'Pravilnik o probi',
            'kind' => 'pravilnik',
            'areas' => ['ocenjivanje', 'norma'],
            'gazette' => '„Sl. glasnik RS" 1/2026',
            'url' => 'https://example.org/pravilnik',
            'summary' => "- **Član 1:** proba.\n- Drugi red.",
            'verification' => 'verified',
            ...$overrides,
        ];
    }

    public function test_import_brings_catalog_from_e_pripreme_and_is_repeatable(): void
    {
        $this->assertSame($this->catalogCount(), Regulation::count());
        $this->seed(ContentSeeder::class);
        $this->assertSame($this->catalogCount(), Regulation::count());
    }

    public function test_list_filters_by_area_kind_and_text(): void
    {
        $all = $this->getJson('/api/regulations')->assertOk()->assertJsonCount($this->catalogCount())->json();
        $this->assertSame('zosov', $all[0]['key']);

        $norma = $this->getJson('/api/regulations?area=norma')->assertOk()->json();
        $this->assertNotEmpty($norma);
        $this->assertTrue(collect($norma)->every(fn ($item) => in_array('norma', $item['areas'], true)));

        $laws = $this->getJson('/api/regulations?kind=zakon')->json();
        $this->assertTrue(collect($laws)->every(fn ($item) => $item['kind'] === 'zakon'));

        $this->assertNotEmpty($this->getJson('/api/regulations?q=Zdravitas')->json());
        $this->getJson('/api/regulations?area=nepostoji')->assertUnprocessable();
    }

    public function test_editor_revises_regulation_with_history(): void
    {
        $editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $created = $this->withJwt($editor)->postJson('/api/admin/regulations', $this->payload())->assertCreated()->assertJsonPath('version', 1)->json();

        $this->withJwt($editor)->patchJson("/api/admin/regulations/{$created['id']}", $this->payload(['title' => 'Pravilnik o probi (izmena)', 'change_note' => 'Izmena 2/2026']))
            ->assertOk()
            ->assertJsonPath('version', 2)
            ->assertJsonPath('history.0.version', 1)
            ->assertJsonPath('history.0.note', 'Izmena 2/2026')
            ->assertJsonPath('history.0.replaced_by', 'Urednik')
            ->assertJsonPath('history.0.data.title', 'Pravilnik o probi');

        $this->getJson('/api/regulations/pravilnik-o-proba')->assertOk()->assertJsonPath('title', 'Pravilnik o probi (izmena)')->assertJsonCount(1, 'history');
    }

    public function test_reimport_keeps_editor_changes(): void
    {
        $editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $zosov = Regulation::where('key', 'zosov')->firstOrFail();
        $payload = [...collect($zosov->only(['key', 'title', 'kind', 'areas', 'gazette', 'url', 'summary', 'verification']))->all(), 'summary' => 'Urednikov sažetak.'];

        $this->withJwt($editor)->patchJson("/api/admin/regulations/{$zosov->id}", $payload)->assertOk();
        $this->seed(ContentSeeder::class);

        $this->assertSame('Urednikov sažetak.', $zosov->fresh()->summary);
    }

    public function test_only_editors_write_and_only_admin_deletes(): void
    {
        $user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $admin = User::where('email', 'admin@fiskultura.test')->firstOrFail();
        $zosov = Regulation::where('key', 'zosov')->firstOrFail();

        $this->withJwt($user)->postJson('/api/admin/regulations', $this->payload())->assertForbidden();
        $this->withJwt($editor)->postJson('/api/admin/regulations', $this->payload(['key' => 'Loš Ključ']))->assertUnprocessable()->assertJsonValidationErrors('key');
        $this->withJwt($editor)->deleteJson("/api/admin/regulations/{$zosov->id}")->assertForbidden();
        $this->withJwt($admin)->deleteJson("/api/admin/regulations/{$zosov->id}")->assertOk();
        $this->assertModelMissing($zosov);
    }

    public function test_updated_since_returns_only_changed(): void
    {
        $this->travel(1)->days();
        $since = now()->toIso8601String();
        $this->travel(1)->minutes();
        $editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $this->withJwt($editor)->postJson('/api/admin/regulations', $this->payload())->assertCreated();

        $this->getJson('/api/regulations?updated_since='.urlencode($since))->assertOk()->assertJsonCount(1)->assertJsonPath('0.key', 'pravilnik-o-proba');
    }

    private function catalogCount(): int
    {
        return count(json_decode(file_get_contents(database_path('data/regulations.json')), true));
    }
}

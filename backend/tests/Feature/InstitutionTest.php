<?php

namespace Tests\Feature;

use App\Models\Institution;
use App\Models\User;
use App\Services\InstitutionImporter;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class InstitutionTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        app(InstitutionImporter::class)->import([
            ['naziv' => 'ОШ „Вук Караџић”', 'mesto' => 'Чачак', 'phone' => '032 123 456', 'email' => 'skola@primer.rs'],
            ['name' => 'Gimnazija', 'place' => 'Čačak'],
            ['type' => 'fakultet', 'name' => 'Fakultet sporta i fizičkog vaspitanja, Univerzitet u Beogradu', 'place' => 'Beograd', 'website' => 'https://www.fsfv.bg.ac.rs'],
            ['name' => 'Nepoznato nešto', 'place' => 'Niš'],
        ], source: 'test');
    }

    public function test_import_transliterates_detects_type_and_is_idempotent(): void
    {
        $this->assertSame(3, Institution::count());
        $school = Institution::where('type', Institution::PRIMARY)->firstOrFail();
        $this->assertSame(['OŠ „Vuk Karadžić”', 'Čačak', '032 123 456'], [$school->name, $school->place, $school->phone]);
        $this->assertSame(Institution::SECONDARY, Institution::where('name', 'Gimnazija')->value('type'));

        $counts = app(InstitutionImporter::class)->import([['name' => 'OŠ „Vuk Karadžić”', 'place' => 'Čačak', 'address' => 'Ulica 1', 'phone' => '']]);
        $this->assertSame(['created' => 0, 'updated' => 1, 'skipped' => 0], $counts);
        $this->assertSame(['Ulica 1', '032 123 456'], [$school->fresh()->address, $school->fresh()->phone]);
    }

    public function test_import_keeps_tax_ids_accounts_and_unknown_columns(): void
    {
        app(InstitutionImporter::class)->import([[
            'naziv' => 'OŠ „Vuk Karadžić”', 'mesto' => 'Čačak', 'PIB' => '101234567', 'MB' => '07123456',
            'žiro račun' => '840-123-45; 160-555-66', 'direktor' => 'Petar Petrović', 'broj učenika' => '640',
        ]]);

        $school = Institution::where('type', Institution::PRIMARY)->firstOrFail()->present();
        $this->assertSame(['101234567', '07123456', ['840-123-45', '160-555-66'], 'Petar Petrović'], [$school['pib'], $school['registry_number'], $school['bank_accounts'], $school['director']]);
        $this->assertSame('640', $school['extra']['broj učenika']);
    }

    public function test_ministry_open_data_is_joined_by_school_and_normalized(): void
    {
        $contacts = [
            ['nazivUstanove' => 'ОШ "Аца Алексић"', 'okrug' => 'РАСИНСКИ УПРАВНИ ОКРУГ', 'opstina' => 'АЛЕКСАНДРОВАЦ', 'mesto' => 'АЛЕКСАНДРОВАЦ', 'maticniBroj' => '07100060', 'PIB' => '100386684', 'vrstaOsnivacaPoUstanovi' => 'Јавна установа'],
            ['nazivUstanove' => 'ОШ "Свети Сава"', 'okrug' => 'ГРАД БЕОГРАД', 'opstina' => 'ВРАЧАР', 'mesto' => 'БЕОГРАД (ВРАЧАР)', 'maticniBroj' => '07018843', 'PIB' => '100292665', 'vrstaOsnivacaPoUstanovi' => 'Јавна установа'],
        ];
        $locations = [
            ['nazivUstanove' => 'ОШ "Аца Алексић"', 'okrug' => 'РАСИНСКИ УПРАВНИ ОКРУГ', 'opstina' => 'АЛЕКСАНДРОВАЦ', 'ulica' => 'ЈАСИКОВАЧКА ББ', 'sedisteRadnaJedinica' => 'Да', 'brojFiskulturnihSala' => 1, 'povrsinaFiskulturnihSala' => 600, 'brojUcionica' => 12],
            ['nazivUstanove' => 'ОШ "Аца Алексић"', 'okrug' => 'РАСИНСКИ УПРАВНИ ОКРУГ', 'opstina' => 'АЛЕКСАНДРОВАЦ', 'ulica' => 'СЕЛО', 'sedisteRadnaJedinica' => 'Не', 'brojFiskulturnihSala' => 0, 'brojUcionica' => 2],
            ['nazivUstanove' => 'ОШ "Свети Сава"', 'okrug' => 'ГРАД БЕОГРАД', 'opstina' => 'ВРАЧАР', 'ulica' => 'НИКОЛАЈА КРАСНОВА 8', 'sedisteRadnaJedinica' => 'Да', 'brojFiskulturnihSala' => 0, 'brojUcionica' => 20],
        ];
        $rows = app(\App\Services\MpnSchoolImporter::class)->rows($contacts, $locations);
        app(InstitutionImporter::class)->import($rows, 'osnovna', 'MPN');

        $aca = Institution::where('registry_number', '07100060')->firstOrFail()->present();
        $this->assertSame(['OŠ „Aca Aleksić”', 'Aleksandrovac', 'Rasinski', 'Jasikovačka bb', '100386684'], [$aca['name'], $aca['place'], $aca['district'], $aca['address'], $aca['pib']]);
        $this->assertSame(['podaci', 'sala', 'sala_kosarka'], $aca['facility_flags']);
        $sava = Institution::where('registry_number', '07018843')->firstOrFail()->present();
        $this->assertSame(['Beograd', 'Vračar', 'Grad Beograd'], [$sava['place'], $sava['municipality'], $sava['district']]);
        $this->assertSame(['podaci', 'bez_sale'], $sava['facility_flags']);
    }

    public function test_search_works_without_diacritics_and_in_cyrillic(): void
    {
        $this->getJson('/api/institutions/search?q=vuk cacak')->assertOk()->assertJsonCount(1)->assertJsonPath('0.label', 'OŠ „Vuk Karadžić”, Čačak');
        $this->getJson('/api/institutions/search?q='.urlencode('Чачак'))->assertOk()->assertJsonCount(2);
        $this->getJson('/api/institutions/search?q=a')->assertOk()->assertJsonCount(0);
    }

    public function test_every_member_gets_full_list_of_one_type(): void
    {
        $member = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $member->forceFill(['directory_consent_at' => null])->save();

        $this->getJson('/api/institutions?type=fakultet')->assertUnauthorized();
        $this->withJwt($member)->getJson('/api/institutions')->assertUnprocessable();
        $this->withJwt($member)->getJson('/api/institutions?type=fakultet')->assertOk()->assertJsonCount(1)->assertJsonPath('0.website', 'https://www.fsfv.bg.ac.rs');
        $this->withJwt($member)->getJson('/api/institutions?type=osnovna')->assertOk()->assertJsonCount(1)->assertJsonPath('0.place', 'Čačak');
    }

    public function test_staff_see_member_directory_without_own_consent(): void
    {
        $member = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $member->forceFill(['directory_consent_at' => null])->save();
        $editor->forceFill(['directory_consent_at' => null])->save();

        $this->withJwt($member)->getJson('/api/members')->assertForbidden()->assertJsonPath('code', 'directory_consent_required');
        $this->withJwt($editor)->getJson('/api/members')->assertOk();
        $this->withJwt($member)->getJson('/api/members/places')->assertForbidden();
        $this->withJwt($editor)->getJson('/api/members/places')->assertOk();
    }
}

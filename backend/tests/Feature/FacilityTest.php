<?php

namespace Tests\Feature;

use App\Models\FacilityReport;
use App\Models\Institution;
use App\Models\User;
use App\Services\Ai\Assistant;
use App\Services\InstitutionImporter;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class FacilityTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $member;

    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        $this->member = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
        $this->editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        app(InstitutionImporter::class)->import([
            ['name' => 'OŠ „Prva”', 'place' => 'Čačak', 'district' => 'Moravički', 'facilities' => ['sala' => ['ima' => true, 'duzina' => 30, 'sirina' => 18], 'jama' => ['ima' => 'da']]],
            ['name' => 'OŠ „Druga”', 'place' => 'Čačak', 'district' => 'Moravički', 'facilities' => ['sala' => ['ima' => true, 'duzina' => 20, 'sirina' => 12, 'podloga' => 'mermer'], 'teren' => ['ima' => true]]],
            ['name' => 'OŠ „Treća”', 'place' => 'Čačak', 'district' => 'Moravički', 'facilities' => ['sala' => ['ima' => false]]],
            ['name' => 'OŠ „Četvrta”', 'place' => 'Niš', 'district' => 'Nišavski'],
        ], source: 'test');
    }

    public function test_facilities_are_normalized_and_flagged(): void
    {
        $second = Institution::where('name', 'OŠ „Druga”')->firstOrFail();
        $this->assertEquals([['duzina' => 20, 'sirina' => 12]], $second->facilities['sala']['sale']);
        $first = Institution::where('name', 'OŠ „Prva”')->firstOrFail()->present();
        $this->assertSame(['podaci', 'sala', 'sala_kosarka', 'jama'], $first['facility_flags']);

        $list = collect($this->withJwt($this->member)->getJson('/api/institutions?type=osnovna')->assertOk()->json())->keyBy('name');
        $this->assertSame([], $list['OŠ „Četvrta”']['facility_flags']);
        $this->assertSame(['podaci', 'bez_sale'], $list['OŠ „Treća”']['facility_flags']);
    }

    public function test_reports_count_by_scope_and_ai_summary_is_saved(): void
    {
        $this->app->instance(Assistant::class, new class implements Assistant
        {
            public function available(): bool { return true; }

            public function json(string $system, string $prompt, array $schema): array
            {
                return ['title' => 'Moravički okrug', 'summary' => str_contains($prompt, 'Sa upisanim podacima o infrastrukturi: 3') ? 'Tri škole.' : '?', 'findings' => ['Dve od tri imaju salu.'], 'recommendations' => ['Upisati ostale.']];
            }

            public function research(string $system, string $prompt): array { return []; }
        });

        $this->withJwt($this->member)->postJson('/api/admin/institutions/reports', ['type' => 'osnovna'])->assertForbidden();
        $report = $this->withJwt($this->editor)->postJson('/api/admin/institutions/reports', ['type' => 'osnovna', 'district' => 'Moravički'])
            ->assertCreated()->assertJsonPath('summary.summary', 'Tri škole.')->assertJsonPath('stats.total', 3)->json();
        $rows = collect($report['stats']['rows'])->keyBy('flag');
        $this->assertSame([2, 1, 1, 67], [$rows['sala']['count'], $rows['sala_kosarka']['count'], $rows['bez_sale']['count'], $rows['sala']['share']]);
        $this->assertSame([3, 3, null, null, 0], [$rows['sala']['known'], $rows['sala_kosarka']['known'], $rows['bazen']['count'], $rows['bazen']['share'], $rows['svlacionice']['known']]);
        $this->assertSame([1, 1, 100], [$rows['teren']['known'], $rows['teren']['count'], $rows['teren']['share']]);

        $this->withJwt($this->member)->getJson('/api/institutions/reports/latest?type=osnovna&district=Moravički')->assertOk()->assertJsonPath('id', $report['id']);
        $this->withJwt($this->member)->getJson('/api/institutions/reports/latest?type=osnovna')->assertOk()->assertExactJson([]);
        $this->withJwt($this->member)->get("/api/institutions/report.pdf?type=osnovna&district=Moravički&report={$report['id']}")->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->assertSame(1, FacilityReport::count());
    }

    public function test_school_pdf_and_editor_updates_facilities(): void
    {
        $school = Institution::where('name', 'OŠ „Četvrta”')->firstOrFail();
        $this->withJwt($this->member)->get("/api/institutions/{$school->id}/pdf")->assertOk()->assertHeader('Content-Type', 'application/pdf');

        $this->withJwt($this->member)->putJson("/api/admin/institutions/{$school->id}/facilities", ['facilities' => []])->assertForbidden();
        $this->withJwt($this->editor)->putJson("/api/admin/institutions/{$school->id}/facilities", ['facilities' => ['bazen' => ['ima' => true], 'napomena' => 'Bazen u gradu']])
            ->assertOk()->assertJsonPath('facility_flags', ['podaci', 'bazen'])->assertJsonPath('facilities_source', $this->editor->name);
    }

    public function test_teacher_submission_is_reviewed_before_it_shows(): void
    {
        \Illuminate\Support\Facades\Mail::fake();
        $school = Institution::where('name', 'OŠ „Prva”')->firstOrFail();
        $this->assertEquals(['sala' => 'zvanicno', 'staza' => 'zvanicno'], $school->facilities_origin);
        $this->withJwt($this->member)->postJson("/api/institutions/{$school->id}/facility-submissions", ['facilities' => ['bazen' => ['ima' => true]]])->assertForbidden();
        $this->member->update(['schools' => [['institution_id' => $school->id, 'name' => $school->name, 'share' => 60], ['name' => 'OŠ Druga škola', 'share' => 40]]]);
        $this->assertSame('OŠ „Prva”; OŠ Druga škola', $this->member->fresh()->school);

        $this->withJwt($this->member)->postJson("/api/institutions/{$school->id}/facility-submissions", ['facilities' => ['sala' => ['podloga' => 'mermer']]])->assertUnprocessable();
        $this->withJwt($this->member)->postJson("/api/institutions/{$school->id}/facility-submissions", ['facilities' => ['bazen' => ['ima' => true]]])->assertCreated();
        $this->withJwt($this->member)->postJson("/api/institutions/{$school->id}/facility-submissions", ['facilities' => ['bazen' => ['ima' => true, 'bazeni' => [['duzina' => 25, 'kapacitet' => 30, 'tribine_mesta' => 200]]], 'napomena' => 'Gradski bazen']])->assertCreated();
        $this->assertSame(1, \App\Models\FacilitySubmission::count());
        $this->assertDatabaseHas('user_notifications', ['user_id' => $this->editor->id, 'kind' => 'facility_submission']);

        $list = collect($this->withJwt($this->member)->getJson('/api/institutions?type=osnovna')->json())->keyBy('name');
        $this->assertSame(1, $list['OŠ „Prva”']['pending_submissions']);
        $this->assertNotContains('bazen', $list['OŠ „Prva”']['facility_flags']);

        $this->withJwt($this->member)->getJson('/api/admin/facility-submissions')->assertForbidden();
        $id = $this->withJwt($this->editor)->getJson('/api/admin/facility-submissions')->assertOk()->assertJsonPath('meta.total', 1)->json('data.0.id');
        $this->withJwt($this->editor)->postJson("/api/admin/facility-submissions/{$id}/approve", ['note' => 'Hvala'])->assertOk()->assertJsonPath('status', 'approved');
        $this->withJwt($this->editor)->postJson("/api/admin/facility-submissions/{$id}/reject", ['note' => 'Kasno je'])->assertUnprocessable();

        $school->refresh();
        $this->assertEquals(['ima' => true, 'bazeni' => [['duzina' => 25, 'kapacitet' => 30, 'tribine_mesta' => 200]]], $school->facilities['bazen']);
        $this->assertContains('tribine', $school->present()['facility_flags']);
        $this->assertSame(30, (int) $school->facilities['sala']['sale'][0]['duzina']);
        $this->assertEquals(['sala' => 'zvanicno', 'staza' => 'zvanicno', 'bazen' => 'provereno'], $school->facilities_origin);
        \Illuminate\Support\Facades\Mail::assertSent(\App\Mail\FacilitySubmissionReviewedMail::class, fn ($mail) => $mail->hasTo($this->member->email));
        $this->assertDatabaseHas('user_notifications', ['user_id' => $this->member->id, 'kind' => 'facility_review']);
    }

    public function test_rejection_needs_a_reason_and_keeps_data_unchanged(): void
    {
        \Illuminate\Support\Facades\Mail::fake();
        $school = Institution::where('name', 'OŠ „Četvrta”')->firstOrFail();
        $this->member->update(['schools' => [['institution_id' => $school->id, 'name' => $school->name]]]);
        $id = $this->withJwt($this->member)->postJson("/api/institutions/{$school->id}/facility-submissions", ['facilities' => ['teren' => ['ima' => true]]])->assertCreated()->json('submission.id');

        $this->withJwt($this->editor)->postJson("/api/admin/facility-submissions/{$id}/reject")->assertUnprocessable()->assertJsonValidationErrors('note');
        $this->withJwt($this->editor)->postJson("/api/admin/facility-submissions/{$id}/reject", ['note' => 'Škola nema teren, proverili smo.'])->assertOk()->assertJsonPath('status', 'rejected');
        $this->assertNull($school->fresh()->facilities);
        \Illuminate\Support\Facades\Mail::assertSent(\App\Mail\FacilitySubmissionReviewedMail::class);
    }

    public function test_halls_and_locker_rooms_are_lists_with_whole_counts(): void
    {
        $catalog = app(\App\Services\Facilities\FacilityCatalog::class);
        $facilities = $catalog->normalize([
            'sala' => ['broj' => 1.7, 'sale' => [['duzina' => 30, 'sirina' => 18, 'podloga' => 'parket'], ['duzina' => 15, 'sirina' => 10], ['podloga' => 'mermer']]],
            'svlacionice' => ['broj' => '4', 'prostorije' => [['stanje' => 'dobro', 'tusevi' => 'da', 'toaleti' => true], ['stanje' => 'loše', 'tusevi' => false]]],
        ]);

        $this->assertSame(['ima' => true, 'broj' => 2], array_diff_key($facilities['sala'], ['sale' => true]));
        $this->assertCount(2, $facilities['sala']['sale']);
        $this->assertSame(4, $facilities['svlacionice']['broj']);
        $this->assertSame(['stanje' => 'dobro', 'toaleti' => true, 'tusevi' => true], $facilities['svlacionice']['prostorije'][0]);
        $this->assertSame(['podaci', 'sala', 'sala_kosarka', 'svlacionice', 'tusevi'], $catalog->flags($facilities));

        $courts = $catalog->normalize(['teren' => ['tereni' => [['duzina' => 40, 'kosarka' => true, 'kosevi' => true, 'golovi' => false, 'osvetljenje' => true]]], 'rekviziti' => ['strunjace' => true, 'svedski_sanduk' => true, 'lopte_kosarka' => true, 'kugle' => false]]);
        $this->assertSame(['ima' => true, 'broj' => 1], array_diff_key($courts['teren'], ['tereni' => true]));
        $this->assertContains('teren_kosarka', $catalog->flags($courts));
        $this->assertContains('gimnastika', $catalog->flags($courts));
        $equipment = collect($catalog->describe($courts))->firstWhere('label', 'Rekviziti')['items'];
        $this->assertSame([['label' => 'Gimnastika', 'value' => 'Strunjače, Švedski sanduk'], ['label' => 'Košarka', 'value' => 'Lopte za košarku']], $equipment);
        $this->assertSame('Dužina (m): 40, Košarka: Označen teren za košarku, Koševi sa tablama, Ostalo: Osvetljenje', collect($catalog->describe($courts))->firstWhere('label', 'Spoljni tereni')['items'][2]['value']);

        $described = collect($catalog->describe($facilities))->keyBy('label');
        $this->assertSame('Dužina (m): 30, Širina (m): 18, Podloga: parket', collect($described['Fiskulturna sala']['items'])->firstWhere('label', 'Sala 1')['value']);
        $this->assertNotNull(collect($described['Svlačionice']['items'])->firstWhere('label', 'Svlačionica 2'));
    }

    public function test_profile_keeps_several_schools_with_share(): void
    {
        $school = Institution::where('name', 'OŠ „Prva”')->firstOrFail();
        $this->withJwt($this->member)->patchJson('/api/auth/me', ['name' => 'Korisnik', 'schools' => [['institution_id' => $school->id, 'name' => $school->name, 'share' => 50], ['name' => 'OŠ „Druga”', 'share' => 150]]])->assertUnprocessable();
        $this->withJwt($this->member)->patchJson('/api/auth/me', ['name' => 'Korisnik', 'schools' => [['institution_id' => $school->id, 'name' => $school->name, 'share' => 50], ['name' => 'OŠ „Druga”']]])
            ->assertOk()
            ->assertJsonPath('schools.0.share', 50)
            ->assertJsonPath('schools.1.share', 100)
            ->assertJsonPath('school', 'OŠ „Prva”; OŠ „Druga”');

        $this->member->update(['school' => 'Gimnazija']);
        $this->assertEquals([['institution_id' => null, 'name' => 'Gimnazija', 'share' => 100]], $this->member->fresh()->schools);
    }
}

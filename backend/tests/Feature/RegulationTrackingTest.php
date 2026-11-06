<?php

namespace Tests\Feature;

use App\Mail\ContactMessageMail;
use App\Mail\RegulationChangesMail;
use App\Models\Regulation;
use App\Models\User;
use App\Services\PisChecker;
use Database\Seeders\ContentSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class RegulationTrackingTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([UserSeeder::class, ContentSeeder::class]);
    }

    private string $amendments = '';

    private function fakePis(string $amendments): void
    {
        $this->amendments = $amendments;
        Http::fake(fn ($request) => str_starts_with($request->url(), PisChecker::ELI_API)
            ? Http::response(['lawAdActGuid' => 'guid-1'])
            : Http::response(['title' => "Pravilnik o programu nastave i učenja za sedmi razred: {$this->amendments}"]));
    }

    public function test_status_follows_dates_and_replacements_are_listed(): void
    {
        Carbon::setTestNow('2026-11-06');
        $items = collect($this->getJson('/api/regulations')->assertOk()->json())->keyBy('key');

        $this->assertSame(Regulation::EXPIRED, $items['plan-5-8-2007']['status']);
        $this->assertSame(['program-5-6-2018', 'plan-7-8-2018'], $items['plan-5-8-2007']['replaced_by']);
        $this->assertSame(Regulation::IN_FORCE, $items['plan-7-8-2018']['status']);
        $this->assertSame(Regulation::UPCOMING, $items['program-1-2026']['status']);
        $this->assertSame(Regulation::DRAFT, $items['zosov-nacrt-2026']['status']);

        $keys = $items->keys();
        foreach ($items as $item) {
            foreach ($item['replaced_by'] as $key) {
                $this->assertTrue($keys->contains($key), "{$item['key']} → {$key}");
            }
            if ($item['status'] === Regulation::EXPIRED) {
                $this->assertNotEmpty($item['replaced_by'], "{$item['key']} nema zamenu");
            }
        }

        Carbon::setTestNow('2027-09-01');
        $this->assertSame(Regulation::IN_FORCE, Regulation::firstWhere('key', 'program-1-2026')->status());
        Carbon::setTestNow();
    }

    public function test_pis_check_records_baseline_then_flags_new_amendments_and_mails_editors(): void
    {
        Mail::fake();
        $this->fakePis('5/2019-4, 1/2020-60');
        $this->artisan('regulations:check', ['--key' => 'program-7-2019'])->assertSuccessful();

        $regulation = Regulation::firstWhere('key', 'program-7-2019');
        $this->assertSame('5/2019-4, 1/2020-60', $regulation->pis_amendments);
        $this->assertNull($regulation->change_detected_at);
        Mail::assertNothingSent();

        $this->fakePis('5/2019-4, 1/2020-60, 2/2027-15');
        $this->artisan('regulations:check', ['--key' => 'program-7-2019'])->assertSuccessful();

        $regulation->refresh();
        $this->assertNotNull($regulation->change_detected_at);
        $this->assertSame('Nove izmene u PIS-u: 2/2027-15', $regulation->change_detail);
        Mail::assertSent(RegulationChangesMail::class, fn (RegulationChangesMail $mail) => $mail->hasTo('urednik@fiskultura.test') && ! $mail->hasTo('korisnik@fiskultura.test'));

        $this->artisan('regulations:check', ['--key' => 'zosov'])->assertSuccessful();
        $this->assertNull(Regulation::firstWhere('key', 'zosov')->pis_amendments);
    }

    public function test_editor_sees_review_list_and_marks_regulation_checked(): void
    {
        $this->fakePis('5/2019-4');
        $this->artisan('regulations:check', ['--key' => 'program-7-2019', '--no-mail' => true]);
        $this->fakePis('5/2019-4, 2/2027-15');
        $this->artisan('regulations:check', ['--key' => 'program-7-2019', '--no-mail' => true]);

        $editor = User::firstWhere('email', 'urednik@fiskultura.test');
        $user = User::firstWhere('email', 'korisnik@fiskultura.test');
        $this->withJwt($user)->getJson('/api/admin/regulations-review')->assertForbidden();

        $review = $this->withJwt($editor)->getJson('/api/admin/regulations-review')->assertOk()->json();
        $this->assertSame('program-7-2019', $review[0]['key']);
        $this->assertSame('rep/pg/ministarstva/pravilnik/2019/5/4', $review[0]['eli']);
        $this->assertSame('Nove izmene u PIS-u: 2/2027-15', $review[0]['change_detail']);

        $id = $review[0]['id'];
        $this->withJwt($editor)->postJson("/api/admin/regulations/{$id}/checked")->assertOk()->assertJsonPath('checked_at', now()->toDateString());
        $regulation = Regulation::find($id);
        $this->assertNull($regulation->change_detected_at);
        $this->assertSame($editor->id, $regulation->checked_by);
        $this->assertNotContains('program-7-2019', array_column($this->withJwt($editor)->getJson('/api/admin/regulations-review')->json(), 'key'));
    }

    public function test_message_to_editors_goes_by_mail_with_reply_to_sender(): void
    {
        Mail::fake();
        $payload = ['name' => 'Kolega Nastavnik', 'email' => 'kolega@example.org', 'topic' => 'predlog', 'message' => 'Predlažem temu o oslobađanju od nastave.'];

        $this->postJson('/api/contact', $payload)->assertCreated();
        Mail::assertSent(ContactMessageMail::class, fn (ContactMessageMail $mail) => $mail->hasTo('admin@fiskultura.test') && $mail->hasReplyTo('kolega@example.org'));

        $this->postJson('/api/contact', [...$payload, 'website' => 'http://spam'])->assertUnprocessable();
        $this->postJson('/api/contact', [...$payload, 'topic' => 'reklama', 'message' => 'kratko'])->assertJsonValidationErrors(['topic', 'message']);
    }
}

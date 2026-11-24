<?php

namespace Tests\Feature;

use App\Mail\FoundingGroupMail;
use App\Mail\FoundingInterestMail;
use App\Models\FoundingInterest;
use App\Models\Organization;
use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class FoundingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ContentSeeder::class);
        Mail::fake();
    }

    private function signUp(string $email, string $city = 'Smederevo', string $district = 'Podunavski'): FoundingInterest
    {
        $this->postJson('/api/founding-interests', [
            'district' => $district,
            'city' => $city,
            'name' => 'Kolega '.$email,
            'email' => $email,
            'school' => 'OŠ „Vuk Karadžić”',
            'consent' => true,
        ])->assertOk();

        return FoundingInterest::where('email', strtolower($email))->firstOrFail();
    }

    private function confirm(FoundingInterest $interest)
    {
        return $this->postJson('/api/founding-interests/confirm', ['id' => $interest->id, 'token' => $interest->token()]);
    }

    public function test_sign_up_needs_consent_and_known_district(): void
    {
        $this->postJson('/api/founding-interests', ['district' => 'Izmišljeni', 'city' => 'X', 'name' => 'Ana', 'email' => 'ana@example.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['district', 'consent']);
        Mail::assertNothingSent();
    }

    public function test_confirmation_mail_and_wrong_token(): void
    {
        $interest = $this->signUp('Ana@Example.com');

        Mail::assertSent(FoundingInterestMail::class, fn (FoundingInterestMail $mail) => $mail->hasTo('ana@example.com'));
        $this->assertNull($interest->confirmed_at);
        $this->postJson('/api/founding-interests/confirm', ['id' => $interest->id, 'token' => 'pogresan'])->assertNotFound();
        $this->confirm($interest)->assertOk()->assertJsonPath('people', 1)->assertJsonPath('threshold', FoundingInterest::THRESHOLD);
        $this->assertNotNull($interest->fresh()->confirmed_at);
    }

    public function test_group_is_notified_once_when_threshold_is_reached(): void
    {
        $first = $this->signUp('prvi@example.com', 'Smederevo');
        $second = $this->signUp('drugi@example.com', ' smederevo ');
        $other = $this->signUp('treci@example.com', 'Požarevac', 'Braničevski');
        $third = $this->signUp('cetvrti@example.com', 'SMEDEREVO');
        $this->confirm($first);
        $this->confirm($second);
        $this->confirm($other);
        Mail::assertNotSent(FoundingGroupMail::class);

        $this->confirm($third)->assertJsonPath('people', 3);
        $this->confirm($third)->assertOk();

        $federation = Organization::where('slug', 'sspfvs')->value('email');
        Mail::assertSent(FoundingGroupMail::class, 4);
        Mail::assertSent(FoundingGroupMail::class, fn (FoundingGroupMail $mail) => $mail->forFederation && $mail->hasTo($federation) && $mail->group->count() === 3);
        foreach (['prvi@example.com', 'drugi@example.com', 'cetvrti@example.com'] as $email) {
            Mail::assertSent(FoundingGroupMail::class, fn (FoundingGroupMail $mail) => ! $mail->forFederation && $mail->hasTo($email));
        }
        Mail::assertNotSent(FoundingGroupMail::class, fn (FoundingGroupMail $mail) => $mail->hasTo('treci@example.com'));

        $late = $this->signUp('peti@example.com', 'Smederevo');
        $this->confirm($late)->assertJsonPath('people', 4);
        Mail::assertSent(FoundingGroupMail::class, 6);
        Mail::assertSent(FoundingGroupMail::class, fn (FoundingGroupMail $mail) => $mail->hasTo('peti@example.com') && $mail->group->count() === 4);
    }

    public function test_coverage_counts_local_societies_and_confirmed_interest_only(): void
    {
        $this->confirm($this->signUp('a@example.com', 'Smederevo'));
        $this->signUp('b@example.com', 'Smederevo');

        $districts = collect($this->getJson('/api/founding/coverage')->assertOk()->json('districts'))->keyBy('district');

        $this->assertSame('aktivno', $districts['Nišavski']['status']);
        $this->assertContains('UPFK Niš', array_column($districts['Nišavski']['organizations'], 'name'));
        $this->assertSame('nepoznato', $districts['Pčinjski']['status']);
        $this->assertSame('nema', $districts['Podunavski']['status']);
        $this->assertSame([['city' => 'Smederevo', 'people' => 1]], $districts['Podunavski']['interest']);
        $this->assertNotContains('SSPFVS', array_column($districts['Grad Beograd']['organizations'], 'name'));
    }
}

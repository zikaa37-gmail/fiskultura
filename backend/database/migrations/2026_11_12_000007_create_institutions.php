<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20)->index();
            $table->string('name');
            $table->string('place', 120)->nullable()->index();
            $table->string('municipality', 120)->nullable();
            $table->string('district', 120)->nullable();
            $table->string('region', 40)->default('Srbija')->index();
            $table->string('address')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('phone', 120)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('fax', 60)->nullable();
            $table->string('director')->nullable();
            $table->string('pib', 20)->nullable();
            $table->string('registry_number', 20)->nullable();
            $table->text('bank_accounts')->nullable();
            $table->json('extra')->nullable();
            $table->json('facilities')->nullable();
            $table->json('facilities_origin')->nullable();
            $table->string('facilities_source', 120)->nullable();
            $table->timestamp('facilities_updated_at')->nullable();
            $table->foreignId('facilities_updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source', 40)->nullable();
            $table->string('search', 500)->index();
            $table->index(['type', 'name']);
            $table->unique(['type', 'registry_number']);
            $table->timestamps();
        });

        Schema::create('facility_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained('institutions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->json('facilities');
            $table->string('status', 20)->default('pending')->index();
            $table->text('review_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('facility_reports', function (Blueprint $table) {
            $table->id();
            $table->json('scope');
            $table->json('stats');
            $table->json('summary')->nullable();
            $table->string('status', 20)->default('ready');
            $table->text('error')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_reports');
        Schema::dropIfExists('facility_submissions');
        Schema::dropIfExists('institutions');
    }
};

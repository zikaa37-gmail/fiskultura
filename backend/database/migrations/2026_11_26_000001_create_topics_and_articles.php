<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TOPICS = [
        ['vojska', 'Specijalno fizičko vaspitanje u vojsci', 'Rad u Vojsci Srbije i vojnim školama: obuka, provera fizičke spremnosti, uslovi i put do posla.'],
        ['policija', 'Specijalno fizičko vaspitanje u policiji', 'Rad u MUP-u i policijskim školama: specijalno fizičko obrazovanje, samoodbrana, uslovi i konkursi.'],
        ['gss', 'Gorska služba spasavanja (GSS)', 'Spasavanje u planinama i teško dostupnim terenima: obuka, licence, volontiranje i plaćeni angažmani.'],
        ['skijanje', 'Skijanje i ski centri', 'Ski učitelji i treneri: nivoi licence, sezonski rad u Srbiji i inostranstvu.'],
        ['borilacke-vestine', 'Borilačke veštine i samoodbrana', 'Majstorska zvanja, klubovi, obezbeđenje i obuka službi: šta se traži i gde ima posla.'],
        ['spasilastvo', 'Spasilaštvo i plivanje', 'Spasilac na bazenu i otvorenim vodama, instruktor plivanja: obuke i sezonski poslovi.'],
        ['rekreacija-i-turizam', 'Rekreacija, fitnes i turizam', 'Hoteli, kampovi, animacija, fitnes centri i rekreacija zaposlenih.'],
        ['druge-mogucnosti', 'Druge mogućnosti zapošljavanja', 'Privremeni i stalni poslovi van škole uz posebne specijalizacije i preduslove.'],
    ];

    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('byline', 160)->nullable()->after('district');
            $table->text('bio')->nullable()->after('byline');
        });

        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('name', 120);
            $table->string('description', 500)->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 150)->unique();
            $table->string('kind', 10);
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('debate_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 255);
            $table->string('summary', 1000);
            $table->mediumText('body');
            $table->string('status', 10)->default('draft');
            $table->text('editor_note')->nullable();
            $table->boolean('featured')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'published_at']);
        });

        $now = now();
        DB::table('topics')->insert(array_map(fn (array $topic, int $index) => [
            'slug' => $topic[0],
            'name' => $topic[1],
            'description' => $topic[2],
            'sort' => ($index + 1) * 10,
            'created_at' => $now,
            'updated_at' => $now,
        ], self::TOPICS, array_keys(self::TOPICS)));
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
        Schema::dropIfExists('topics');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['byline', 'bio']);
        });
    }
};

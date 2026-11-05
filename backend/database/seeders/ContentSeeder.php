<?php

namespace Database\Seeders;

use App\Services\ContentImporter;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(ContentImporter $importer): void
    {
        $result = $importer->import(database_path('data/organizations.json'), database_path('data/news.json'), database_path('data/regulations.json'), database_path('data/questions.json'));

        $this->command?->info(sprintf(
            'Organizacije: %d novih, %d već postoji. Vesti: %d novih, %d ispravljenih sažetaka, %d već postoji. Propisi: %d novih, %d ažuriranih, %d ostaje. Pitanja: %d novih, %d ažuriranih, %d ostaje.',
            $result['organizations']['created'],
            $result['organizations']['skipped'],
            $result['news']['created'],
            $result['news']['updated'],
            $result['news']['skipped'],
            $result['regulations']['created'],
            $result['regulations']['updated'],
            $result['regulations']['skipped'],
            $result['questions']['created'],
            $result['questions']['updated'],
            $result['questions']['skipped'],
        ));
    }
}

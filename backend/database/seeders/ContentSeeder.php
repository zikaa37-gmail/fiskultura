<?php

namespace Database\Seeders;

use App\Services\ContentImporter;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(ContentImporter $importer): void
    {
        $result = $importer->import(database_path('data/organizations.json'), database_path('data/news.json'));

        $this->command?->info(sprintf(
            'Organizacije: %d novih, %d već postoji. Vesti: %d novih, %d već postoji.',
            $result['organizations']['created'],
            $result['organizations']['skipped'],
            $result['news']['created'],
            $result['news']['skipped'],
        ));
    }
}

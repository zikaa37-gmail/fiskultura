<?php

namespace Tests\Feature;

use Tests\TestCase;

class RuleTopicsConsistencyTest extends TestCase
{
    public function test_topics_and_history_on_the_portal_point_to_regulations_from_the_catalog(): void
    {
        $catalog = collect(json_decode(file_get_contents(database_path('data/regulations.json')), true))->keyBy('key');
        $files = glob(base_path('../frontend/src/app/content/rules/rule-*.ts'));
        if (! $files) {
            $this->markTestSkipped('Frontend nije uz backend.');
        }

        $keys = [];
        foreach ($files as $file) {
            $source = file_get_contents($file);
            preg_match_all("/regulation: '([a-z0-9-]+)'/", $source, $single);
            preg_match_all("/regulations: \[([^\]]*)\]/", $source, $lists);
            $keys = [...$keys, ...$single[1]];
            foreach ($lists[1] as $list) {
                preg_match_all("/'([a-z0-9-]+)'/", $list, $items);
                $keys = [...$keys, ...$items[1]];
            }
        }

        $this->assertNotEmpty($keys);
        foreach (array_unique($keys) as $key) {
            $this->assertTrue($catalog->has($key), "Tema navodi propis {$key}, a njega nema u katalogu.");
        }
    }
}

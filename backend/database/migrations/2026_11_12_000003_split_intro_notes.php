<?php

use App\Services\Ai\DebateIntroWriter;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('debates')->where(fn ($query) => $query->whereNotNull('intro')->orWhereNotNull('intro_draft'))->get(['id', 'intro', 'intro_draft'])
            ->each(function (object $debate) {
                $changes = [];
                foreach (['intro', 'intro_draft'] as $field) {
                    $value = $debate->{$field} ? json_decode($debate->{$field}, true) : null;
                    if (! is_array($value) || ! isset($value['text'])) {
                        continue;
                    }
                    $split = DebateIntroWriter::splitNotes($value['text']);
                    $value['text'] = $split['text'];
                    if ($field === 'intro_draft') {
                        $value['notes'] = $split['notes'] ?? ($value['notes'] ?? null);
                    } else {
                        unset($value['notes']);
                    }
                    $changes[$field] = json_encode($value, JSON_UNESCAPED_UNICODE);
                }
                if ($changes) {
                    DB::table('debates')->where('id', $debate->id)->update($changes);
                }
            });
    }

    public function down(): void {}
};

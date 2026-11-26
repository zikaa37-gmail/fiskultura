<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminTopicController extends Controller
{
    public function index()
    {
        $topics = Topic::withCount('articles')->orderBy('sort')->orderBy('name')->get();

        return response()->json($topics->map(fn (Topic $topic) => [...$topic->present(), 'articles_count' => $topic->articles_count])->values());
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $topic = Topic::create([
            ...$data,
            'slug' => Topic::uniqueSlug($data['name']),
            'sort' => $data['sort'] ?? ((int) Topic::max('sort') + 10),
        ]);

        return response()->json($topic->present(), 201);
    }

    public function update(Request $request, Topic $topic)
    {
        $data = $this->validated($request, $topic);
        $topic->update([...$data, 'sort' => $data['sort'] ?? $topic->sort]);

        return response()->json($topic->present());
    }

    public function destroy(Topic $topic)
    {
        $topic->delete();

        return response()->json(['message' => 'Tema je obrisana.']);
    }

    private function validated(Request $request, ?Topic $topic = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('topics', 'name')->ignore($topic?->id)],
            'description' => ['nullable', 'string', 'max:500'],
            'sort' => ['nullable', 'integer', 'min:0', 'max:60000'],
        ], ['name.unique' => 'Tema sa tim nazivom već postoji.']);
    }
}

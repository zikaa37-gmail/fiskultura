<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Regulation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class QuestionController extends Controller
{
    private const MAX_PENDING = 5;

    public function index(Request $request)
    {
        $filters = $request->validate([
            'category' => ['nullable', Rule::in(Question::CATEGORIES)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $questions = Question::visible()
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->when($filters['q'] ?? null, fn (Builder $query, string $term) => $query->where(fn (Builder $inner) => $inner
                ->where('title', 'like', "%{$term}%")
                ->orWhere('body', 'like', "%{$term}%")
                ->orWhere('answer', 'like', "%{$term}%")))
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->get();

        return response()->json($questions->map(fn (Question $question) => self::present($question, withAnswer: false))->values());
    }

    public function show(string $slug)
    {
        return response()->json(self::present(Question::visible()->where('slug', $slug)->firstOrFail()));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => ['required', Rule::in(Question::CATEGORIES)],
            'title' => ['required', 'string', 'min:10', 'max:200'],
            'body' => ['nullable', 'string', 'max:3000'],
        ]);

        $user = $request->user();
        if (Question::where('asked_by', $user->id)->where('status', Question::PENDING)->count() >= self::MAX_PENDING) {
            throw ValidationException::withMessages(['title' => ['Već imate '.self::MAX_PENDING.' pitanja koja čekaju odgovor. Sačekajte da urednik odgovori.']]);
        }

        $question = Question::create([
            'slug' => Question::uniqueSlug($data['title']),
            'category' => $data['category'],
            'title' => $data['title'],
            'body' => $data['body'] ?? null,
            'original' => trim($data['title']."\n\n".($data['body'] ?? '')),
            'status' => Question::PENDING,
            'asked_by' => $user->id,
        ]);

        return response()->json([...self::presentOwn($question), 'message' => 'Pitanje je poslato uredniku. Kad odgovor bude objavljen, javićemo vam mejlom.'], 201);
    }

    public function mine(Request $request)
    {
        return response()->json(Question::where('asked_by', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Question $question) => self::presentOwn($question))
            ->values());
    }

    public static function present(Question $question, bool $withAnswer = true): array
    {
        return [
            'id' => $question->id,
            'slug' => $question->slug,
            'category' => $question->category,
            'title' => $question->title,
            'body' => $question->body,
            'excerpt' => self::excerpt($question->answer),
            'valid_on' => $question->valid_on?->toDateString(),
            'published_at' => $question->published_at?->toIso8601String(),
            ...($withAnswer ? [
                'answer' => $question->answer,
                'regulations' => $question->regulations()->map(fn (Regulation $regulation) => [
                    'key' => $regulation->key,
                    'title' => $regulation->title,
                    'gazette' => $regulation->gazette,
                    'url' => $regulation->url,
                    'status' => $regulation->status(),
                    'valid_to' => $regulation->valid_to?->toDateString(),
                ])->values(),
            ] : []),
        ];
    }

    private static function presentOwn(Question $question): array
    {
        return [
            'id' => $question->id,
            'slug' => $question->status === Question::PUBLISHED ? $question->slug : null,
            'category' => $question->category,
            'title' => $question->title,
            'status' => $question->status,
            'created_at' => $question->created_at?->toIso8601String(),
        ];
    }

    private static function excerpt(?string $answer): string
    {
        $plain = trim(preg_replace(['/\*\*(.+?)\*\*/', '/\[(.+?)\]\(.+?\)/', '/^- /m', '/\s+/'], ['$1', '$1', '', ' '], (string) $answer));

        return mb_strlen($plain) > 220 ? rtrim(mb_substr($plain, 0, 217)).'…' : $plain;
    }
}

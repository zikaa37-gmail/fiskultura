<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Debate;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserNotification;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class ArticleTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $author;

    private User $editor;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        $this->author = User::where('email', 'autor@fiskultura.test')->firstOrFail();
        $this->editor = User::where('email', 'urednik@fiskultura.test')->firstOrFail();
        $this->user = User::where('email', 'korisnik@fiskultura.test')->firstOrFail();
    }

    private function payload(array $overrides = []): array
    {
        return [
            'kind' => Article::COLUMN,
            'topic_id' => Topic::where('slug', 'vojska')->value('id'),
            'title' => 'Zašto fizičko vaspitanje treba svaki dan',
            'summary' => 'Kratko obrazloženje zašto bi deca trebalo da imaju čas fizičkog svaki dan.',
            'body' => "Prvi pasus.\n\nDrugi pasus sa listom:\n- kretanje\n- zdravlje",
            ...$overrides,
        ];
    }

    private function publishedArticle(array $overrides = []): Article
    {
        return Article::create([
            'slug' => 'objavljen-tekst',
            'kind' => Article::ARTICLE,
            'topic_id' => Topic::where('slug', 'gss')->value('id'),
            'author_id' => $this->author->id,
            'title' => 'Igre za zagrevanje',
            'summary' => 'Deset igara za uvodni deo časa.',
            'body' => 'Tekst.',
            'status' => Article::PUBLISHED,
            'published_at' => now()->subHour(),
            ...$overrides,
        ]);
    }

    public function test_migration_adds_default_topics(): void
    {
        $topics = $this->getJson('/api/topics')->assertOk()->json();

        $this->assertCount(8, $topics);
        $this->assertSame('vojska', $topics[0]['slug']);
        $this->assertSame(0, $topics[0]['articles_count']);
    }

    public function test_author_writes_submits_and_editor_returns_then_publishes(): void
    {
        $created = $this->withJwt($this->author)->postJson('/api/admin/articles', $this->payload())
            ->assertCreated()
            ->assertJsonPath('status', Article::DRAFT)
            ->assertJsonPath('slug', 'zasto-fizicko-vaspitanje-treba-svaki-dan')
            ->assertJsonPath('can_submit', true)
            ->json();

        $this->getJson("/api/articles/{$created['slug']}")->assertNotFound();

        $this->withJwt($this->author)->postJson("/api/admin/articles/{$created['id']}/submit")->assertUnprocessable()->assertJsonValidationErrors('byline');
        $this->author->forceFill(['byline' => 'profesor FV, instruktor samoodbrane'])->save();
        $this->withJwt($this->author)->postJson("/api/admin/articles/{$created['id']}/submit")->assertOk()->assertJsonPath('status', Article::SUBMITTED);
        $this->assertSame(1, UserNotification::where('user_id', $this->editor->id)->where('kind', 'article_submitted')->count());

        $this->withJwt($this->author)->patchJson("/api/admin/articles/{$created['id']}", $this->payload(['title' => 'Izmena posle slanja']))->assertForbidden();
        $this->withJwt($this->author)->postJson("/api/admin/articles/{$created['id']}/publish")->assertForbidden();

        $this->withJwt($this->editor)->postJson("/api/admin/articles/{$created['id']}/return", ['note' => 'Dodaj primer iz prakse.'])
            ->assertOk()
            ->assertJsonPath('status', Article::RETURNED)
            ->assertJsonPath('editor_note', 'Dodaj primer iz prakse.');
        $this->assertSame('Dodaj primer iz prakse.', UserNotification::where('user_id', $this->author->id)->where('kind', 'article_returned')->value('body'));

        $this->withJwt($this->author)->patchJson("/api/admin/articles/{$created['id']}", $this->payload(['body' => 'Dorađen tekst sa primerom.']))->assertOk();
        $this->withJwt($this->author)->postJson("/api/admin/articles/{$created['id']}/submit")->assertOk();

        $this->withJwt($this->editor)->postJson("/api/admin/articles/{$created['id']}/publish")
            ->assertOk()
            ->assertJsonPath('status', Article::PUBLISHED)
            ->assertJsonPath('is_visible', true)
            ->assertJsonPath('editor_note', null);
        $this->assertSame(1, UserNotification::where('user_id', $this->author->id)->where('kind', 'article_published')->count());

        $this->getJson("/api/articles/{$created['slug']}")
            ->assertOk()
            ->assertJsonPath('body', 'Dorađen tekst sa primerom.')
            ->assertJsonPath('author.name', $this->author->name)
            ->assertJsonPath('author.byline', 'profesor FV, instruktor samoodbrane')
            ->assertJsonPath('topic.slug', 'vojska')
            ->assertJsonMissingPath('editor_note');
    }

    public function test_author_sees_only_own_texts_and_user_has_no_access(): void
    {
        $this->publishedArticle(['author_id' => $this->editor->id]);
        $own = $this->publishedArticle(['slug' => 'moj-tekst', 'status' => Article::DRAFT, 'published_at' => null]);

        $list = $this->withJwt($this->author)->postJson('/api/admin/articles/list')->assertOk();
        $this->assertSame([$own->id], array_column($list->json('data'), 'id'));
        $this->assertSame(2, $this->withJwt($this->editor)->postJson('/api/admin/articles/list')->json('meta.total'));

        $other = Article::where('author_id', $this->editor->id)->firstOrFail();
        $this->withJwt($this->author)->getJson("/api/admin/articles/{$other->id}")->assertForbidden();
        $this->withJwt($this->user)->postJson('/api/admin/articles', $this->payload())->assertForbidden();
        $this->withJwt($this->author)->patchJson('/api/admin/topics/1', ['name' => 'Nova'])->assertForbidden();
    }

    public function test_scheduled_text_is_hidden_until_publish_time(): void
    {
        $article = $this->publishedArticle(['status' => Article::SUBMITTED, 'published_at' => null]);

        $this->withJwt($this->editor)->postJson("/api/admin/articles/{$article->id}/publish", ['published_at' => now()->addDay()->toIso8601String()])
            ->assertOk()
            ->assertJsonPath('is_visible', false);
        $this->getJson("/api/articles/{$article->slug}")->assertNotFound();
        $this->assertSame(0, $this->postJson('/api/articles/list')->json('meta.total'));
        $this->assertStringStartsWith('Tekst je odobren', UserNotification::where('user_id', $this->author->id)->value('title'));

        $this->travel(2)->days();
        $this->getJson("/api/articles/{$article->slug}")->assertOk();
    }

    public function test_public_list_filters_by_kind_and_topic_and_links_open_debate(): void
    {
        $debate = Debate::create(['slug' => 'svaki-dan', 'title' => 'Fizičko svaki dan?', 'description' => 'Rasprava.', 'status' => Debate::OPEN, 'moderator_id' => $this->editor->id]);
        $this->publishedArticle(['kind' => Article::COLUMN, 'slug' => 'kolumna', 'topic_id' => Topic::where('slug', 'vojska')->value('id'), 'debate_id' => $debate->id]);
        $this->publishedArticle();

        $this->assertSame(2, $this->postJson('/api/articles/list')->json('meta.total'));
        $this->assertSame(['kolumna'], array_column($this->postJson('/api/articles/list', ['kind' => 'kolumna'])->json('data'), 'slug'));
        $this->assertSame(['objavljen-tekst'], array_column($this->postJson('/api/articles/list', ['topic' => 'gss'])->json('data'), 'slug'));
        $this->assertSame(1, collect($this->getJson('/api/topics')->json())->firstWhere('slug', 'vojska')['articles_count']);

        $this->getJson('/api/articles/kolumna')->assertJsonPath('debate.slug', 'svaki-dan')->assertJsonCount(1, 'related');

        $debate->update(['status' => Debate::REJECTED]);
        $this->getJson('/api/articles/kolumna')->assertJsonPath('debate', null);
    }

    public function test_author_profile_and_topic_management(): void
    {
        $this->withJwt($this->author)->patchJson('/api/admin/author-profile', ['byline' => 'profesor FV, OŠ „Vuk Karadžić”, Niš', 'bio' => 'Dvadeset godina u školi.'])
            ->assertOk()
            ->assertJsonPath('byline', 'profesor FV, OŠ „Vuk Karadžić”, Niš');
        $this->publishedArticle();
        $this->getJson('/api/articles/objavljen-tekst')->assertJsonPath('author.bio', 'Dvadeset godina u školi.');
        $this->postJson('/api/articles/list')->assertJsonMissingPath('data.0.author.bio');

        $topic = $this->withJwt($this->editor)->postJson('/api/admin/topics', ['name' => 'Plivanje u školi'])->assertCreated()->assertJsonPath('slug', 'plivanje-u-skoli')->json();
        $this->withJwt($this->editor)->postJson('/api/admin/topics', ['name' => 'Plivanje u školi'])->assertUnprocessable();
        $this->withJwt($this->editor)->patchJson("/api/admin/topics/{$topic['id']}", ['name' => 'Plivanje', 'sort' => 5])->assertOk()->assertJsonPath('sort', 5);

        $gss = Topic::where('slug', 'gss')->firstOrFail();
        $this->withJwt($this->editor)->deleteJson("/api/admin/topics/{$gss->id}")->assertOk();
        $this->assertNull(Article::where('slug', 'objavljen-tekst')->value('topic_id'));
    }

    public function test_author_deletes_own_draft_but_not_published_text(): void
    {
        $published = $this->publishedArticle();
        $draft = $this->publishedArticle(['slug' => 'nacrt', 'status' => Article::DRAFT, 'published_at' => null]);

        $this->withJwt($this->author)->deleteJson("/api/admin/articles/{$published->id}")->assertForbidden();
        $this->withJwt($this->author)->deleteJson("/api/admin/articles/{$draft->id}")->assertOk();
        $this->withJwt($this->editor)->deleteJson("/api/admin/articles/{$published->id}")->assertOk();
        $this->assertSame(0, Article::count());
    }

    public function test_seo_routes_and_shell_include_published_texts(): void
    {
        $this->publishedArticle();
        $this->publishedArticle(['slug' => 'nacrt', 'status' => Article::DRAFT]);

        $this->assertSame(['objavljen-tekst'], array_column($this->getJson('/api/seo/routes')->json('articles'), 'slug'));
        $this->assertStringContainsString('/tekstovi/objavljen-tekst', $this->get('/sitemap.xml')->getContent());
    }
}

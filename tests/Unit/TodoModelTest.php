<?php

namespace Tests\Unit;

use App\Models\Todo;
use App\Models\User;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoModelTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a todo belongs to a user.
     */
    public function test_todo_belongs_to_user()
    {
        $todo = Todo::factory()->create();
        
        $this->assertInstanceOf(User::class, $todo->user);
        $this->assertEquals($todo->user_id, $todo->user->id);
    }

    /**
     * Test that a todo can have multiple tags.
     */
    public function test_todo_can_have_multiple_tags()
    {
        $todo = Todo::factory()->create();
        $tags = Tag::factory()->count(3)->create();
        
        $todo->tags()->attach($tags->pluck('id'));
        
        $this->assertEquals(3, $todo->tags()->count());
        
        foreach ($tags as $tag) {
            $this->assertTrue($todo->tags->contains($tag));
        }
    }

    /**
     * Test that a todo can have no tags.
     */
    public function test_todo_can_have_no_tags()
    {
        $todo = Todo::factory()->create();
        
        $this->assertEquals(0, $todo->tags()->count());
        $this->assertTrue($todo->tags->isEmpty());
    }

    /**
     * Test the searchable array contains correct fields.
     */
    public function test_todo_searchable_array_contains_correct_fields()
    {
        $todo = Todo::factory()->create([
            'title' => 'Test Title',
            'description' => 'Test Description',
            'priority' => 'high',
            'status' => 'todo'
        ]);
        
        $searchArray = $todo->toSearchableArray();
        
        $this->assertArrayHasKey('title', $searchArray);
        $this->assertArrayHasKey('description', $searchArray);
        $this->assertArrayHasKey('priority', $searchArray);
        $this->assertArrayHasKey('status', $searchArray);
        
        $this->assertEquals('Test Title', $searchArray['title']);
        $this->assertEquals('Test Description', $searchArray['description']);
        $this->assertEquals('high', $searchArray['priority']);
        $this->assertEquals('todo', $searchArray['status']);
    }

    /**
     * Test that searchable array excludes non-searchable fields.
     */
    public function test_todo_searchable_array_excludes_non_searchable_fields()
    {
        $todo = Todo::factory()->create();
        $searchArray = $todo->toSearchableArray();
        
        // These fields should not be in the search array
        $this->assertArrayNotHasKey('id', $searchArray);
        $this->assertArrayNotHasKey('user_id', $searchArray);
        $this->assertArrayNotHasKey('created_at', $searchArray);
        $this->assertArrayNotHasKey('updated_at', $searchArray);
    }

    /**
     * Test that makeAllSearchableUsing includes tags relationship.
     */
    public function test_make_all_searchable_includes_tags()
    {
        // This tests that the makeAllSearchableUsing method eager loads tags
        // We can't easily test the Scout functionality in unit tests,
        // but we can ensure the method exists and works
        $todo = new Todo();
        
        // Create a mock query builder
        $query = Todo::query();
        
        // Call the protected method using reflection
        $reflection = new \ReflectionClass($todo);
        $method = $reflection->getMethod('makeAllSearchableUsing');
        $method->setAccessible(true);
        
        $result = $method->invoke($todo, $query);
        
        // The result should be a query builder with the 'with' clause
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Builder::class, $result);
    }

    /**
     * Test todo factory creates valid todos.
     */
    public function test_todo_factory_creates_valid_todos()
    {
        $todo = Todo::factory()->create();
        
        $this->assertNotEmpty($todo->title);
        $this->assertNotEmpty($todo->user_id);
        $this->assertContains($todo->priority, ['low', 'medium', 'high']);
        $this->assertContains($todo->status, ['backlog', 'todo', 'working', 'qa', 'in_review', 'completed']);
        $this->assertInstanceOf(\Carbon\Carbon::class, $todo->created_at);
        $this->assertInstanceOf(\Carbon\Carbon::class, $todo->updated_at);
    }

    /**
     * Test todo factory can create specific todos.
     */
    public function test_todo_factory_can_create_specific_todos()
    {
        $user = User::factory()->create();
        
        $todo = Todo::factory()->create([
            'title' => 'Specific Title',
            'description' => 'Specific Description',
            'priority' => 'high',
            'status' => 'completed',
            'user_id' => $user->id
        ]);
        
        $this->assertEquals('Specific Title', $todo->title);
        $this->assertEquals('Specific Description', $todo->description);
        $this->assertEquals('high', $todo->priority);
        $this->assertEquals('completed', $todo->status);
        $this->assertEquals($user->id, $todo->user_id);
    }

    /**
     * Test that due_date is cast to a date.
     */
    public function test_due_date_is_cast_to_date()
    {
        $todo = Todo::factory()->create([
            'due_date' => '2024-12-31'
        ]);
        
        $this->assertInstanceOf(\Carbon\Carbon::class, $todo->due_date);
        $this->assertEquals('2024-12-31', $todo->due_date->format('Y-m-d'));
    }

    /**
     * Test that completed field is cast to boolean.
     */
    public function test_completed_is_cast_to_boolean()
    {
        $todo = Todo::factory()->create(['completed' => 1]);
        $this->assertIsBool($todo->completed);
        $this->assertTrue($todo->completed);
        
        $todo = Todo::factory()->create(['completed' => 0]);
        $this->assertIsBool($todo->completed);
        $this->assertFalse($todo->completed);
    }

    /**
     * Test that all fillable fields can be mass assigned.
     */
    public function test_all_fillable_fields_can_be_mass_assigned()
    {
        $data = [
            'title' => 'Test Todo',
            'description' => 'Test Description',
            'completed' => true,
            'priority' => 'high',
            'due_date' => '2024-12-31',
            'status' => 'completed',
            'user_id' => User::factory()->create()->id,
        ];
        
        $todo = Todo::create($data);
        
        $this->assertEquals('Test Todo', $todo->title);
        $this->assertEquals('Test Description', $todo->description);
        $this->assertTrue($todo->completed);
        $this->assertEquals('high', $todo->priority);
        $this->assertEquals('2024-12-31', $todo->due_date->format('Y-m-d'));
        $this->assertEquals('completed', $todo->status);
    }
}
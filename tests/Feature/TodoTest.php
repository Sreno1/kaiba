<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a todo can be created.
     */
    public function test_can_create_todo()
    {
        $todoData = [
            'title' => 'Buy groceries',
            'description' => 'Milk, bread, eggs',
            'priority' => 'high',
            'status' => 'todo'
        ];
        
        $response = $this->postJson('/todos', $todoData);
        
        $response->assertStatus(201);
        $response->assertJson([
            'title' => 'Buy groceries',
            'description' => 'Milk, bread, eggs',
            'priority' => 'high',
            'status' => 'todo'
        ]);
        
        // Verify it was saved to database
        $this->assertDatabaseHas('todos', [
            'title' => 'Buy groceries',
            'priority' => 'high'
        ]);
    }

    /**
     * Test that todo title is required.
     */
    public function test_todo_title_is_required()
    {
        $response = $this->postJson('/todos', [
            'description' => 'Without title'
        ]);
        
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    /**
     * Test that todos can be listed.
     */
    public function test_can_list_todos()
    {
        // Create test todos
        Todo::factory()->count(3)->create();
        
        $response = $this->getJson('/todos');
        
        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    /**
     * Test that a todo can be viewed.
     */
    public function test_can_view_todo()
    {
        $todo = Todo::factory()->create([
            'title' => 'Test Todo'
        ]);
        
        $response = $this->getJson('/todos/' . $todo->id);
        
        $response->assertStatus(200);
        $response->assertJson([
            'title' => 'Test Todo'
        ]);
    }

    /**
     * Test that a todo can be updated.
     */
    public function test_can_update_todo()
    {
        $todo = Todo::factory()->create([
            'title' => 'Original Title'
        ]);
        
        $updateData = [
            'title' => 'Updated Title',
            'priority' => 'low'
        ];
        
        $response = $this->putJson('/todos/' . $todo->id, $updateData);
        
        $response->assertStatus(200);
        $response->assertJson([
            'title' => 'Updated Title',
            'priority' => 'low'
        ]);
        
        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'title' => 'Updated Title'
        ]);
    }

    /**
     * Test that a todo can be deleted.
     */
    public function test_can_delete_todo()
    {
        $todo = Todo::factory()->create([
            'title' => 'Todo to Delete'
        ]);
        
        $response = $this->deleteJson('/todos/' . $todo->id);
        
        $response->assertStatus(204);
        
        $this->assertDatabaseMissing('todos', [
            'id' => $todo->id
        ]);
    }

    /**
     * Test that todos can be created with tags.
     */
    public function test_can_create_todo_with_tags()
    {
        $tags = Tag::factory()->count(2)->create();
        
        $todoData = [
            'title' => 'Tagged Todo',
            'tag_ids' => $tags->pluck('id')->toArray()
        ];
        
        $response = $this->postJson('/todos', $todoData);
        
        $response->assertStatus(201);
        
        $todo = Todo::where('title', 'Tagged Todo')->first();
        $this->assertEquals(2, $todo->tags->count());
    }

    /**
     * Test todo priority validation.
     */
    public function test_todo_priority_validation()
    {
        $response = $this->postJson('/todos', [
            'title' => 'Test Todo',
            'priority' => 'invalid'
        ]);
        
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['priority']);
    }

    /**
     * Test todo status validation.
     */
    public function test_todo_status_validation()
    {
        $response = $this->postJson('/todos', [
            'title' => 'Test Todo',
            'status' => 'invalid'
        ]);
        
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['status']);
    }
}
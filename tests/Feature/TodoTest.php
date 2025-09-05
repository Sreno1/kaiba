<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Todo;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that an authenticated user can create a todo.
     */
    public function test_user_can_create_todo()
    {
        $user = User::factory()->create();
        
        $todoData = [
            'title' => 'Buy groceries',
            'description' => 'Milk, bread, eggs',
            'priority' => 'high',
            'status' => 'todo'
        ];
        
        $response = $this->actingAs($user)->postJson('/todos', $todoData);
        
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
            'user_id' => $user->id,
            'priority' => 'high'
        ]);
    }

    /**
     * Test that todo title is required.
     */
    public function test_todo_title_is_required()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->postJson('/todos', [
            'description' => 'Some description'
            // Missing title
        ]);
        
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    /**
     * Test that a user can view their own todos.
     */
    public function test_user_can_view_their_todos()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        
        // Create todos for both users
        $userTodo = Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'My Todo'
        ]);
        
        Todo::factory()->create([
            'user_id' => $otherUser->id,
            'title' => 'Other User Todo'
        ]);
        
        $response = $this->actingAs($user)->getJson('/todos');
        
        $response->assertStatus(200);
        $response->assertJsonCount(1); // Should only see own todo
        $response->assertJsonFragment(['title' => 'My Todo']);
        $response->assertJsonMissing(['title' => 'Other User Todo']);
    }

    /**
     * Test that a user cannot view another user's specific todo.
     */
    public function test_user_cannot_view_other_users_todo()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        
        $otherUserTodo = Todo::factory()->create([
            'user_id' => $otherUser->id,
            'title' => 'Private Todo'
        ]);
        
        $response = $this->actingAs($user)->getJson("/todos/{$otherUserTodo->id}");
        
        $response->assertStatus(403); // Forbidden
    }

    /**
     * Test that a user can update their own todo.
     */
    public function test_user_can_update_their_todo()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Original Title',
            'status' => 'todo'
        ]);
        
        $updateData = [
            'title' => 'Updated Title',
            'status' => 'completed'
        ];
        
        $response = $this->actingAs($user)->putJson("/todos/{$todo->id}", $updateData);
        
        $response->assertStatus(200);
        $response->assertJson([
            'title' => 'Updated Title',
            'status' => 'completed'
        ]);
        
        // Verify database was updated
        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'title' => 'Updated Title',
            'status' => 'completed'
        ]);
    }

    /**
     * Test that a user cannot update another user's todo.
     */
    public function test_user_cannot_update_other_users_todo()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        
        $otherUserTodo = Todo::factory()->create([
            'user_id' => $otherUser->id,
            'title' => 'Other User Todo'
        ]);
        
        $response = $this->actingAs($user)->putJson("/todos/{$otherUserTodo->id}", [
            'title' => 'Hacked Title'
        ]);
        
        $response->assertStatus(403); // Forbidden
        
        // Verify original title wasn't changed
        $this->assertDatabaseHas('todos', [
            'id' => $otherUserTodo->id,
            'title' => 'Other User Todo'
        ]);
    }

    /**
     * Test that a user can delete their own todo.
     */
    public function test_user_can_delete_their_todo()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Todo to Delete'
        ]);
        
        $response = $this->actingAs($user)->deleteJson("/todos/{$todo->id}");
        
        $response->assertStatus(204); // No content
        
        // Verify it was deleted from database
        $this->assertDatabaseMissing('todos', [
            'id' => $todo->id
        ]);
    }

    /**
     * Test that a user cannot delete another user's todo.
     */
    public function test_user_cannot_delete_other_users_todo()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        
        $otherUserTodo = Todo::factory()->create([
            'user_id' => $otherUser->id,
            'title' => 'Protected Todo'
        ]);
        
        $response = $this->actingAs($user)->deleteJson("/todos/{$otherUserTodo->id}");
        
        $response->assertStatus(403); // Forbidden
        
        // Verify it wasn't deleted
        $this->assertDatabaseHas('todos', [
            'id' => $otherUserTodo->id,
            'title' => 'Protected Todo'
        ]);
    }

    /**
     * Test that a user can create a todo with tags.
     */
    public function test_user_can_create_todo_with_tags()
    {
        $user = User::factory()->create();
        $tag1 = Tag::factory()->create();
        $tag2 = Tag::factory()->create();
        
        $todoData = [
            'title' => 'Tagged Todo',
            'description' => 'A todo with tags',
            'tag_ids' => [$tag1->id, $tag2->id]
        ];
        
        $response = $this->actingAs($user)->postJson('/todos', $todoData);
        
        $response->assertStatus(201);
        $response->assertJsonCount(2, 'tags'); // Should have 2 tags
        
        // Verify tags are associated with the todo
        $todo = Todo::where('title', 'Tagged Todo')->first();
        $this->assertEquals(2, $todo->tags()->count());
        $this->assertTrue($todo->tags->contains($tag1));
        $this->assertTrue($todo->tags->contains($tag2));
    }

    /**
     * Test that only authenticated users can access todos.
     */
    public function test_unauthenticated_user_cannot_access_todos()
    {
        $response = $this->getJson('/todos');
        $response->assertStatus(401); // Unauthorized
        
        $response = $this->postJson('/todos', ['title' => 'Test']);
        $response->assertStatus(401); // Unauthorized
    }
}
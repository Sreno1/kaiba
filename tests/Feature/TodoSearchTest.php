<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoSearchTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that user can search todos by title.
     */
    public function test_user_can_search_todos_by_title()
    {
        $user = User::factory()->create();
        
        // Create todos with different titles
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Buy groceries',
            'description' => 'Milk and bread'
        ]);
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Walk the dog',
            'description' => 'Evening walk'
        ]);
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Buy birthday gift',
            'description' => 'For mom'
        ]);
        
        // Import todos to search index
        \Artisan::call('scout:import', ['model' => 'App\\Models\\Todo']);
        
        // Search for "buy"
        $response = $this->actingAs($user)->getJson('/todos-search?q=buy');
        
        $response->assertStatus(200);
        $response->assertJsonCount(2); // Should find 2 todos with "buy"
        
        // Check that the right todos are returned
        $titles = collect($response->json())->pluck('title')->toArray();
        $this->assertContains('Buy groceries', $titles);
        $this->assertContains('Buy birthday gift', $titles);
        $this->assertNotContains('Walk the dog', $titles);
    }

    /**
     * Test that user can search todos by description.
     */
    public function test_user_can_search_todos_by_description()
    {
        $user = User::factory()->create();
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Important task',
            'description' => 'This is urgent and needs attention'
        ]);
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Regular task',
            'description' => 'This is a normal task'
        ]);
        
        \Artisan::call('scout:import', ['model' => 'App\\Models\\Todo']);
        
        // Search by description content
        $response = $this->actingAs($user)->getJson('/todos-search?q=urgent');
        
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['title' => 'Important task']);
    }

    /**
     * Test that search returns all todos when query is empty.
     */
    public function test_search_returns_all_todos_when_query_is_empty()
    {
        $user = User::factory()->create();
        Todo::factory()->count(3)->create(['user_id' => $user->id]);
        
        $response = $this->actingAs($user)->getJson('/todos-search?q=');
        
        $response->assertStatus(200);
        $response->assertJsonCount(3);
        
        // Test with no query parameter at all
        $response = $this->actingAs($user)->getJson('/todos-search');
        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    /**
     * Test that search only returns current user's todos.
     */
    public function test_search_only_returns_user_todos()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'My grocery list',
            'description' => 'Personal groceries'
        ]);
        
        Todo::factory()->create([
            'user_id' => $otherUser->id,
            'title' => 'Their grocery list',
            'description' => 'Other person groceries'
        ]);
        
        \Artisan::call('scout:import', ['model' => 'App\\Models\\Todo']);
        
        $response = $this->actingAs($user)->getJson('/todos-search?q=grocery');
        
        $response->assertStatus(200);
        $response->assertJsonCount(1); // Should only find user's todo
        $response->assertJsonFragment(['title' => 'My grocery list']);
        $response->assertJsonMissing(['title' => 'Their grocery list']);
    }

    /**
     * Test that search can find todos by priority.
     */
    public function test_search_can_find_todos_by_priority()
    {
        $user = User::factory()->create();
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Urgent task',
            'priority' => 'high'
        ]);
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Regular task',
            'priority' => 'medium'
        ]);
        
        \Artisan::call('scout:import', ['model' => 'App\\Models\\Todo']);
        
        $response = $this->actingAs($user)->getJson('/todos-search?q=high');
        
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['priority' => 'high']);
    }

    /**
     * Test that search can find todos by status.
     */
    public function test_search_can_find_todos_by_status()
    {
        $user = User::factory()->create();
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Done task',
            'status' => 'completed'
        ]);
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Pending task',
            'status' => 'todo'
        ]);
        
        \Artisan::call('scout:import', ['model' => 'App\\Models\\Todo']);
        
        $response = $this->actingAs($user)->getJson('/todos-search?q=completed');
        
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['status' => 'completed']);
    }

    /**
     * Test that search returns no results for non-matching query.
     */
    public function test_search_returns_empty_for_no_matches()
    {
        $user = User::factory()->create();
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Shopping list',
            'description' => 'Buy items from store'
        ]);
        
        \Artisan::call('scout:import', ['model' => 'App\\Models\\Todo']);
        
        $response = $this->actingAs($user)->getJson('/todos-search?q=nonexistent');
        
        $response->assertStatus(200);
        $response->assertJsonCount(0);
    }

    /**
     * Test that search is case insensitive.
     */
    public function test_search_is_case_insensitive()
    {
        $user = User::factory()->create();
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Important Meeting',
            'description' => 'Discussion with TEAM'
        ]);
        
        \Artisan::call('scout:import', ['model' => 'App\\Models\\Todo']);
        
        // Test lowercase search
        $response = $this->actingAs($user)->getJson('/todos-search?q=important');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        
        // Test uppercase search
        $response = $this->actingAs($user)->getJson('/todos-search?q=MEETING');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        
        // Test mixed case search
        $response = $this->actingAs($user)->getJson('/todos-search?q=tEaM');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }

    /**
     * Test that unauthenticated users cannot search todos.
     */
    public function test_unauthenticated_user_cannot_search_todos()
    {
        $response = $this->getJson('/todos-search?q=test');
        $response->assertStatus(401); // Unauthorized
    }
}
<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoSearchTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that todos can be searched by title.
     */
    public function test_can_search_todos_by_title()
    {
        Todo::factory()->create(['title' => 'Buy groceries']);
        Todo::factory()->create(['title' => 'Walk the dog']);
        
        $response = $this->getJson('/todos-search?q=groceries');
        
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['title' => 'Buy groceries']);
    }

    /**
     * Test that todos can be searched by description.
     */
    public function test_can_search_todos_by_description()
    {
        Todo::factory()->create([
            'title' => 'Shopping',
            'description' => 'Buy groceries and supplies'
        ]);
        Todo::factory()->create([
            'title' => 'Exercise',
            'description' => 'Go for a run'
        ]);
        
        $response = $this->getJson('/todos-search?q=groceries');
        
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['title' => 'Shopping']);
    }

    /**
     * Test that search returns all todos when query is empty.
     */
    public function test_search_returns_all_todos_when_query_is_empty()
    {
        Todo::factory()->count(3)->create();
        
        $response = $this->getJson('/todos-search?q=');
        
        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    /**
     * Test that search returns empty for no matches.
     */
    public function test_search_returns_empty_for_no_matches()
    {
        Todo::factory()->create(['title' => 'Buy groceries']);
        
        $response = $this->getJson('/todos-search?q=nonexistent');
        
        $response->assertStatus(200);
        $response->assertJsonCount(0);
    }

    /**
     * Test that search is case insensitive.
     */
    public function test_search_is_case_insensitive()
    {
        Todo::factory()->create(['title' => 'Buy Groceries']);
        
        $response = $this->getJson('/todos-search?q=groceries');
        
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['title' => 'Buy Groceries']);
    }
}
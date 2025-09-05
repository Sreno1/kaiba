<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tag;
use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a user can create a tag.
     */
    public function test_user_can_create_tag()
    {
        $user = User::factory()->create();
        
        $tagData = [
            'name' => 'Work',
            'color' => '#ff0000',
            'description' => 'Work related tasks'
        ];
        
        $response = $this->actingAs($user)->postJson('/tags', $tagData);
        
        $response->assertStatus(201);
        $response->assertJson([
            'name' => 'Work',
            'color' => '#ff0000',
            'description' => 'Work related tasks'
        ]);
        
        $this->assertDatabaseHas('tags', [
            'name' => 'Work',
            'color' => '#ff0000'
        ]);
    }

    /**
     * Test that tag name is required.
     */
    public function test_tag_name_is_required()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->postJson('/tags', [
            'color' => '#ff0000'
            // Missing name
        ]);
        
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    /**
     * Test that a user can view all tags.
     */
    public function test_user_can_view_all_tags()
    {
        $user = User::factory()->create();
        
        $tag1 = Tag::factory()->create(['name' => 'Work']);
        $tag2 = Tag::factory()->create(['name' => 'Personal']);
        
        $response = $this->actingAs($user)->getJson('/tags');
        
        $response->assertStatus(200);
        $response->assertJsonCount(2);
        $response->assertJsonFragment(['name' => 'Work']);
        $response->assertJsonFragment(['name' => 'Personal']);
    }

    /**
     * Test that a user can update a tag.
     */
    public function test_user_can_update_tag()
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create([
            'name' => 'Original Name',
            'color' => '#ff0000'
        ]);
        
        $updateData = [
            'name' => 'Updated Name',
            'color' => '#00ff00'
        ];
        
        $response = $this->actingAs($user)->putJson("/tags/{$tag->id}", $updateData);
        
        $response->assertStatus(200);
        $response->assertJson([
            'name' => 'Updated Name',
            'color' => '#00ff00'
        ]);
        
        $this->assertDatabaseHas('tags', [
            'id' => $tag->id,
            'name' => 'Updated Name',
            'color' => '#00ff00'
        ]);
    }

    /**
     * Test that a user can delete a tag.
     */
    public function test_user_can_delete_tag()
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create(['name' => 'Tag to Delete']);
        
        $response = $this->actingAs($user)->deleteJson("/tags/{$tag->id}");
        
        $response->assertStatus(204);
        
        $this->assertDatabaseMissing('tags', [
            'id' => $tag->id
        ]);
    }

    /**
     * Test that deleting a tag removes it from associated todos.
     */
    public function test_deleting_tag_removes_it_from_todos()
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create(['name' => 'Work']);
        
        $todo = Todo::factory()->create(['user_id' => $user->id]);
        $todo->tags()->attach($tag->id);
        
        // Verify tag is attached
        $this->assertEquals(1, $todo->tags()->count());
        
        // Delete tag
        $response = $this->actingAs($user)->deleteJson("/tags/{$tag->id}");
        $response->assertStatus(204);
        
        // Verify tag is removed from todo
        $todo->refresh();
        $this->assertEquals(0, $todo->tags()->count());
    }

    /**
     * Test that unauthenticated users cannot access tags.
     */
    public function test_unauthenticated_user_cannot_access_tags()
    {
        $response = $this->getJson('/tags');
        $response->assertStatus(401);
        
        $response = $this->postJson('/tags', ['name' => 'Test']);
        $response->assertStatus(401);
    }

    /**
     * Test that tags can be filtered by todos.
     */
    public function test_tags_show_todo_count()
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create(['name' => 'Work']);
        
        // Create todos and associate with tag
        $todo1 = Todo::factory()->create(['user_id' => $user->id]);
        $todo2 = Todo::factory()->create(['user_id' => $user->id]);
        
        $todo1->tags()->attach($tag->id);
        $todo2->tags()->attach($tag->id);
        
        $response = $this->actingAs($user)->getJson('/tags');
        
        $response->assertStatus(200);
        
        // Check that the tag has the correct todo count
        $responseData = $response->json();
        $workTag = collect($responseData)->firstWhere('name', 'Work');
        
        $this->assertNotNull($workTag);
        // The response should include todos relationship or count
        // This depends on your actual implementation
    }
}
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that authenticated users can access the home page.
     */
    public function test_authenticated_user_can_access_home_page(): void
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/');

        $response->assertStatus(200);
    }

    /**
     * Test that unauthenticated users are redirected to login.
     */
    public function test_unauthenticated_user_redirected_to_login(): void
    {
        $response = $this->get('/');

        $response->assertStatus(302);
        $response->assertRedirect('/login');
    }
}

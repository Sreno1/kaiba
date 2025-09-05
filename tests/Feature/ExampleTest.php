<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that users can access the home page (single-user app).
     */
    public function test_user_can_access_home_page(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }
}

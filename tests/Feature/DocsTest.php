<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocsTest extends TestCase
{
    public function test_can_fetch_docs_list()
    {
        $response = $this->get('/api/docs');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'slug',
                'title', 
                'filename',
                'content',
                'headings'
            ]
        ]);
        
        // Verify we get the expected docs from the docs/ directory
        $data = $response->json();
        $this->assertNotEmpty($data);
        
        // Check that all returned docs have the required fields
        foreach ($data as $doc) {
            $this->assertArrayHasKey('slug', $doc);
            $this->assertArrayHasKey('title', $doc);
            $this->assertArrayHasKey('filename', $doc);
            $this->assertArrayHasKey('content', $doc);
            $this->assertArrayHasKey('headings', $doc);
        }
    }
    
    public function test_can_fetch_specific_doc()
    {
        // First get the list to find a valid slug
        $response = $this->get('/api/docs');
        $docs = $response->json();
        $this->assertNotEmpty($docs);
        
        $firstDoc = $docs[0];
        $slug = $firstDoc['slug'];
        
        // Now fetch the specific document
        $response = $this->get("/api/docs/{$slug}");
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'slug',
            'title',
            'filename', 
            'content',
            'headings'
        ]);
        
        $doc = $response->json();
        $this->assertEquals($slug, $doc['slug']);
        $this->assertNotEmpty($doc['content']);
    }
    
    public function test_returns_404_for_nonexistent_doc()
    {
        $response = $this->get('/api/docs/nonexistent-doc');
        
        $response->assertStatus(404);
        $response->assertJsonStructure(['error']);
    }
    
    public function test_docs_have_proper_headings_structure()
    {
        $response = $this->get('/api/docs');
        $docs = $response->json();
        
        foreach ($docs as $doc) {
            if (!empty($doc['headings'])) {
                foreach ($doc['headings'] as $heading) {
                    $this->assertArrayHasKey('level', $heading);
                    $this->assertArrayHasKey('text', $heading);
                    $this->assertArrayHasKey('anchor', $heading);
                    $this->assertIsInt($heading['level']);
                    $this->assertGreaterThanOrEqual(1, $heading['level']);
                    $this->assertLessThanOrEqual(6, $heading['level']);
                    $this->assertIsString($heading['text']);
                    $this->assertIsString($heading['anchor']);
                }
            }
        }
    }
}
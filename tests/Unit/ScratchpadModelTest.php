<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Scratchpad;
use App\Models\Tag;

class ScratchpadModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_scratchpad_belongs_to_tag()
    {
        $tag = Tag::factory()->create();
        $scratchpad = Scratchpad::factory()->create(['tag_id' => $tag->id]);

        $this->assertInstanceOf(Tag::class, $scratchpad->tag);
        $this->assertEquals($tag->id, $scratchpad->tag->id);
    }

    public function test_scratchpad_data_is_cast_to_array()
    {
        $scratchpad = new Scratchpad();
        $testData = [
            'elements' => [
                ['id' => 1, 'type' => 'text', 'content' => 'test']
            ],
            'canvas' => ['zoom' => 1.0]
        ];

        $scratchpad->data = $testData;

        $this->assertIsArray($scratchpad->data);
        $this->assertEquals($testData, $scratchpad->data);
    }

    public function test_scratchpad_fillable_attributes()
    {
        $scratchpad = new Scratchpad();
        
        $this->assertEquals(['tag_id', 'data'], $scratchpad->getFillable());
    }

    public function test_scratchpad_can_be_created_with_tag_id_and_data()
    {
        $tag = Tag::factory()->create();
        $data = [
            'elements' => [],
            'canvas' => ['zoom' => 1.0, 'gridEnabled' => true]
        ];

        $scratchpad = Scratchpad::create([
            'tag_id' => $tag->id,
            'data' => $data
        ]);

        $this->assertDatabaseHas('scratchpads', [
            'tag_id' => $tag->id,
        ]);

        $this->assertEquals($data, $scratchpad->fresh()->data);
    }
}
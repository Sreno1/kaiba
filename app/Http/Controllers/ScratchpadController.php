<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Scratchpad;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ScratchpadController extends Controller
{
    /**
     * Get scratchpad for a specific tag.
     */
    public function show(Tag $tag): JsonResponse
    {
        $scratchpad = $tag->scratchpad;
        
        if (!$scratchpad) {
            // Create empty scratchpad if it doesn't exist
            $scratchpad = Scratchpad::create([
                'tag_id' => $tag->id,
                'data' => [
                    'elements' => [],
                    'canvas' => [
                        'zoom' => 1.0,
                        'gridEnabled' => true
                    ]
                ]
            ]);
        }
        
        return response()->json($scratchpad);
    }

    /**
     * Update scratchpad data for a specific tag.
     */
    public function update(Request $request, Tag $tag): JsonResponse
    {
        $validated = $request->validate([
            'data' => 'required|array',
            'data.elements' => 'array',
            'data.canvas' => 'array',
        ]);

        $scratchpad = $tag->scratchpad()->updateOrCreate(
            ['tag_id' => $tag->id],
            ['data' => $validated['data']]
        );
        
        // Clear any relevant cache
        Cache::forget("scratchpad.tag.{$tag->id}");
        
        return response()->json($scratchpad);
    }

    /**
     * Delete scratchpad for a specific tag.
     */
    public function destroy(Tag $tag): JsonResponse
    {
        $tag->scratchpad()?->delete();
        
        // Clear any relevant cache
        Cache::forget("scratchpad.tag.{$tag->id}");
        
        return response()->json(null, 204);
    }
}

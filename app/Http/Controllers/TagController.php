<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        // Cache tags for 30 minutes since they don't change often
        $tags = Cache::remember('tags.all', 1800, function () {
            return Tag::orderBy('name')->get();
        });
        
        return response()->json($tags);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'description' => 'nullable|string',
        ]);

        $tag = Tag::create($validated);
        
        // Invalidate tags cache
        Cache::forget('tags.all');
        
        return response()->json($tag, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag): JsonResponse
    {
        return response()->json($tag);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tag $tag): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:tags,name,' . $tag->id,
            'color' => 'sometimes|required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'description' => 'nullable|string',
        ]);

        $tag->update($validated);
        
        // Invalidate tags cache
        Cache::forget('tags.all');
        
        return response()->json($tag);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();
        
        // Invalidate tags cache
        Cache::forget('tags.all');
        
        return response()->json(null, 204);
    }
}

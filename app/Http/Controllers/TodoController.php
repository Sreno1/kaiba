<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class TodoController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        // Cache for 5 minutes
        $todos = Cache::remember('todos.all', 300, function () {
            return Todo::with('tags') // Eager load to prevent N+1
                ->orderBy('created_at', 'desc')
                ->get();
        });
        
        return response()->json($todos);
    }

    /**
     * Get todos by priority
     */
    public function byPriority(string $priority): JsonResponse
    {
        $todos = Todo::where('priority', $priority)
            ->with('tags')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($todos);
    }

    /**
     * Search todos
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        
        if (empty($query)) {
            return $this->index();
        }
        
        $cacheKey = "todos.search." . md5($query);
        
        // Cache search results for 2 minutes
        $todos = Cache::remember($cacheKey, 120, function () use ($query) {
            return Todo::search($query)
                ->orderBy('created_at', 'desc')
                ->get()
                ->load('tags');
        });
        
        return response()->json($todos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:backlog,todo,working,qa,in_review,completed',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $todo = Todo::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'due_date' => $validated['due_date'] ?? null,
            'status' => $validated['status'] ?? 'todo',
        ]);

        if (!empty($validated['tag_ids'])) {
            $todo->tags()->attach($validated['tag_ids']);
        }

        // Invalidate todo and search cache
        $this->clearCache();
        
        return response()->json($todo->load('tags'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Todo $todo): JsonResponse
    {
        return response()->json($todo->load('tags'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Todo $todo): JsonResponse
    {

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'sometimes|boolean',
            'priority' => 'sometimes|in:low,medium,high',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|in:backlog,todo,working,qa,in_review,completed',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $todo->update($validated);

        if (array_key_exists('tag_ids', $validated)) {
            $todo->tags()->sync($validated['tag_ids'] ?? []);
        }

        // Invalidate todo and search cache
        $this->clearCache();
        
        return response()->json($todo->load('tags'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Todo $todo): JsonResponse
    {
        $todo->delete();
        
        // Invalidate todo and search cache
        $this->clearCache();
        
        return response()->json(null, 204);
    }
    
    /**
     * Clear all caches
     */
    private function clearCache(): void
    {
        // Clear main todos cache
        Cache::forget('todos.all');
        
        // For search caches, we'll rely on the short TTL (2 minutes)
        // In production, you might want to implement pattern-based cache clearing
    }
}

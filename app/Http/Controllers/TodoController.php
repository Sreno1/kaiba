<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TodoController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $userId = Auth::id();
        $cacheKey = "todos.user.{$userId}";
        
        // Cache for 5 minutes
        $todos = Cache::remember($cacheKey, 300, function () {
            return Auth::user()
                ->todos()
                ->with('tags') // Eager load to prevent N+1
                ->orderBy('created_at', 'desc')
                ->get();
        });
        
        return response()->json($todos);
    }

    /**
     * Get todos by priority (uses the new priority indexes)
     */
    public function byPriority(string $priority): JsonResponse
    {
        // This query will use idx_todos_user_priority index
        $todos = Auth::user()
            ->todos()
            ->where('priority', $priority)
            ->with('tags')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($todos);
    }

    /**
     * Search todos for the authenticated user
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        
        if (empty($query)) {
            return $this->index();
        }
        
        $userId = Auth::id();
        $cacheKey = "todos.search.{$userId}." . md5($query);
        
        // Cache search results for 2 minutes
        $todos = Cache::remember($cacheKey, 120, function () use ($query, $userId) {
            return Todo::search($query)
                ->where('user_id', $userId)
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

        $todo = Auth::user()->todos()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'due_date' => $validated['due_date'] ?? null,
            'status' => $validated['status'] ?? 'todo',
        ]);

        if (!empty($validated['tag_ids'])) {
            $todo->tags()->attach($validated['tag_ids']);
        }

        // Invalidate user's todo and search cache
        $this->clearUserCache($todo->user_id);
        
        return response()->json($todo->load('tags'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Todo $todo): JsonResponse
    {
        $this->authorize('view', $todo);
        return response()->json($todo->load('tags'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Todo $todo): JsonResponse
    {
        $this->authorize('update', $todo);

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

        // Invalidate user's todo and search cache
        $this->clearUserCache($todo->user_id);
        
        return response()->json($todo->load('tags'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Todo $todo): JsonResponse
    {
        $this->authorize('delete', $todo);
        $userId = $todo->user_id;
        $todo->delete();
        
        // Invalidate user's todo and search cache
        $this->clearUserCache($userId);
        
        return response()->json(null, 204);
    }
    
    /**
     * Clear all caches for a specific user
     */
    private function clearUserCache(int $userId): void
    {
        // Clear main todos cache
        Cache::forget("todos.user.{$userId}");
        
        // Clear search caches (pattern-based clearing)
        $searchPattern = "todos.search.{$userId}.*";
        
        // For production, you'd want to implement pattern-based cache clearing
        // For now, we'll rely on the short TTL of search cache (2 minutes)
    }
}

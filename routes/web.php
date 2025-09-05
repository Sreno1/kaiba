<?php

use App\Models\Todo;
use App\Models\Tag;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// CSRF token refresh endpoint
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// Home route - show todos directly (single-user, no auth needed)
Route::get('/', function () {
    $todos = Todo::with('tags')->orderBy('created_at', 'desc')->get();
    $tags = Tag::all();
    
    return Inertia::render('Todos', [
        'todos' => $todos,
        'tags' => $tags,
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

// AJAX routes for todos and tags (no auth middleware needed for single-user)
Route::resource('todos', App\Http\Controllers\TodoController::class)->except(['create', 'edit']);
Route::get('todos-search', [App\Http\Controllers\TodoController::class, 'search'])->name('todos.search');
Route::resource('tags', App\Http\Controllers\TagController::class)->except(['create', 'edit']);

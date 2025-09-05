<?php

use App\Http\Controllers\ProfileController;
use App\Models\Todo;
use App\Models\Tag;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


Route::middleware('auth')->group(function () {
    Route::get('/', function () {
        $user = Auth::user();
        $todos = $user->todos()->with('tags')->orderBy('created_at', 'desc')->get();
        $tags = Tag::all();
        
        // Debug logging
        \Log::info('Loading todos page', [
            'user_id' => $user->id,
            'todos_count' => $todos->count(),
            'tags_count' => $tags->count()
        ]);
        
        return Inertia::render('Todos', [
            'todos' => $todos,
            'tags' => $tags,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    })->name('todos');
    
    // AJAX routes for todos and tags
    Route::resource('todos', App\Http\Controllers\TodoController::class)->except(['create', 'edit']);
    Route::get('todos-search', [App\Http\Controllers\TodoController::class, 'search'])->name('todos.search');
    Route::resource('tags', App\Http\Controllers\TagController::class)->except(['create', 'edit']);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

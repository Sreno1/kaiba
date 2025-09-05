<?php

use App\Http\Controllers\ProfileController;
use App\Models\Todo;
use App\Models\Tag;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// CSRF token refresh endpoint
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// Home route that handles both authenticated and non-authenticated users
Route::get('/', function () {
    if (Auth::check()) {
        // User is authenticated - show todos
        $user = Auth::user();
        $todos = $user->todos()->with('tags')->orderBy('created_at', 'desc')->get();
        $tags = Tag::all();
        
        return Inertia::render('Todos', [
            'todos' => $todos,
            'tags' => $tags,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    } else {
        // User is not authenticated - show login page
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }
})->name('home');

Route::middleware('auth')->group(function () {
    // AJAX routes for todos and tags
    Route::resource('todos', App\Http\Controllers\TodoController::class)->except(['create', 'edit']);
    Route::get('todos-search', [App\Http\Controllers\TodoController::class, 'search'])->name('todos.search');
    Route::resource('tags', App\Http\Controllers\TagController::class)->except(['create', 'edit']);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

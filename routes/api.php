<?php

use App\Http\Controllers\Api\DocsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Simple health check endpoint for API
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Docs API routes
Route::get('/docs', [DocsController::class, 'index']);
Route::get('/docs/{slug}', [DocsController::class, 'show']);

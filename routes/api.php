<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Simple health check endpoint for API
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

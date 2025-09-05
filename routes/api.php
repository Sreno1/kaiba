<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Keep user endpoint for potential API usage
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

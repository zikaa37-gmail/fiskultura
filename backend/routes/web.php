<?php

use App\Http\Controllers\SeoController;
use App\Http\Controllers\SpaShellController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);
Route::get('/rss.xml', [SeoController::class, 'rss']);

Route::fallback([SpaShellController::class, 'show']);

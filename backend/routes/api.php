<?php

use App\Http\Controllers\Api\Admin\AdminNewsController;
use App\Http\Controllers\Api\Admin\AdminOrganizationController;
use App\Http\Controllers\Api\Admin\AdminQuestionController;
use App\Http\Controllers\Api\Admin\AdminRegulationController;
use App\Http\Controllers\Api\Admin\AdminSubscriptionController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\RegulationController;
use App\Http\Controllers\Api\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/subscriptions', [SubscriptionController::class, 'subscribe']);
});
Route::middleware('throttle:30,1')->group(function () {
    Route::post('/subscriptions/confirm', [SubscriptionController::class, 'confirm']);
    Route::post('/subscriptions/manage', [SubscriptionController::class, 'manage']);
    Route::patch('/subscriptions/manage', [SubscriptionController::class, 'updateManaged']);
    Route::post('/subscriptions/unsubscribe', [SubscriptionController::class, 'unsubscribe']);
});
Route::post('/news/list', [NewsController::class, 'list']);
Route::get('/news/years', [NewsController::class, 'years']);
Route::get('/news/{slug}', [NewsController::class, 'show']);
Route::get('/regulations', [RegulationController::class, 'index']);
Route::get('/regulations/{key}', [RegulationController::class, 'show']);
Route::get('/organizations', [OrganizationController::class, 'index']);
Route::get('/organizations/{slug}', [OrganizationController::class, 'show']);
Route::get('/questions', [QuestionController::class, 'index']);
Route::get('/questions/{slug}', [QuestionController::class, 'show']);

Route::post('/auth/refresh', [AuthController::class, 'refresh']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::middleware('jwt')->group(function () {
    Route::post('/questions', [QuestionController::class, 'store'])->middleware('throttle:5,1');
    Route::get('/me/questions', [QuestionController::class, 'mine']);

    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::patch('/auth/me', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::get('/me/subscription', [SubscriptionController::class, 'mine']);
    Route::put('/me/subscription', [SubscriptionController::class, 'updateMine']);

    Route::prefix('admin')->middleware('role:editor,admin')->group(function () {
        Route::post('/news/list', [AdminNewsController::class, 'list']);
        Route::get('/news/{news}', [AdminNewsController::class, 'show']);
        Route::post('/news', [AdminNewsController::class, 'store']);
        Route::patch('/news/{news}', [AdminNewsController::class, 'update']);
        Route::delete('/news/{news}', [AdminNewsController::class, 'destroy']);

        Route::post('/questions/list', [AdminQuestionController::class, 'list']);
        Route::get('/questions/{question}', [AdminQuestionController::class, 'show']);
        Route::post('/questions', [AdminQuestionController::class, 'store']);
        Route::patch('/questions/{question}', [AdminQuestionController::class, 'update']);

        Route::get('/organizations', [AdminOrganizationController::class, 'index']);
        Route::get('/organizations/{organization}', [AdminOrganizationController::class, 'show']);
        Route::post('/organizations', [AdminOrganizationController::class, 'store']);
        Route::patch('/organizations/{organization}', [AdminOrganizationController::class, 'update']);

        Route::post('/regulations', [AdminRegulationController::class, 'store']);
        Route::patch('/regulations/{regulation}', [AdminRegulationController::class, 'update']);

        Route::get('/subscriptions/stats', [AdminSubscriptionController::class, 'stats']);
    });

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::delete('/organizations/{organization}', [AdminOrganizationController::class, 'destroy']);
        Route::delete('/regulations/{regulation}', [AdminRegulationController::class, 'destroy']);
        Route::post('/users/list', [AdminUserController::class, 'list']);
        Route::patch('/users/{user}', [AdminUserController::class, 'update']);
        Route::delete('/questions/{question}', [AdminQuestionController::class, 'destroy']);
    });
});

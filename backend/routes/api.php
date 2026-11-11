<?php

use App\Http\Controllers\Api\Admin\AdminDebateController;
use App\Http\Controllers\Api\Admin\AdminMailboxController;
use App\Http\Controllers\Api\Admin\AdminModeratorController;
use App\Http\Controllers\Api\Admin\AdminNewsController;
use App\Http\Controllers\Api\Admin\AdminOrganizationController;
use App\Http\Controllers\Api\Admin\AdminQuestionController;
use App\Http\Controllers\Api\Admin\AdminRegulationController;
use App\Http\Controllers\Api\Admin\AdminSubscriptionController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DebateController;
use App\Http\Controllers\Api\RegulationController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\UserNotificationController;
use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,60');

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/auth/invitation', [InvitationController::class, 'show']);
    Route::post('/auth/invitation/complete', [InvitationController::class, 'complete']);
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
Route::get('/seo/routes', [SeoController::class, 'routes']);

Route::post('/auth/refresh', [AuthController::class, 'refresh']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::middleware('jwt')->group(function () {
    Route::post('/questions', [QuestionController::class, 'store'])->middleware('throttle:5,1');
    Route::get('/me/questions', [QuestionController::class, 'mine']);
    Route::get('/questions', [QuestionController::class, 'index']);
    Route::get('/questions/{slug}', [QuestionController::class, 'show']);
    Route::get('/debates', [DebateController::class, 'index']);
    Route::post('/debates', [DebateController::class, 'propose'])->middleware('throttle:5,10');
    Route::get('/debates/{slug}', [DebateController::class, 'show']);
    Route::patch('/debates/{slug}', [DebateController::class, 'update']);
    Route::get('/debates/{slug}/posts', [DebateController::class, 'posts']);
    Route::post('/debates/{slug}/posts', [DebateController::class, 'storePost'])->middleware('throttle:10,1');
    Route::post('/debates/{slug}/analysis', [DebateController::class, 'analyze'])->middleware('throttle:5,10');
    Route::post('/debates/{slug}/analysis/approve', [DebateController::class, 'approve']);
    Route::post('/debate-posts/{post}/like', [DebateController::class, 'like'])->middleware('throttle:60,1');
    Route::patch('/debate-posts/{post}', [DebateController::class, 'moderatePost']);
    Route::post('/debates/{slug}/reopen-requests', [DebateController::class, 'requestReopen'])->middleware('throttle:3,10');
    Route::post('/debate-reopen-requests/{reopen}/decision', [DebateController::class, 'decideReopen']);
    Route::get('/me/notifications', [UserNotificationController::class, 'index']);
    Route::get('/me/notifications/unread', [UserNotificationController::class, 'unread']);
    Route::post('/me/notifications/read', [UserNotificationController::class, 'read']);

    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::patch('/auth/me', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/me/export', [AuthController::class, 'export']);
    Route::delete('/auth/me', [AuthController::class, 'destroy'])->middleware('throttle:5,1');
    Route::get('/members', [MemberController::class, 'index']);
    Route::get('/me/subscription', [SubscriptionController::class, 'mine']);
    Route::put('/me/subscription', [SubscriptionController::class, 'updateMine']);

    Route::prefix('admin')->middleware('role:author,editor,admin')->group(function () {
        Route::post('/questions/list', [AdminQuestionController::class, 'list']);
        Route::get('/questions/{question}', [AdminQuestionController::class, 'show']);
        Route::patch('/questions/{question}', [AdminQuestionController::class, 'update']);
        Route::post('/questions/{question}/draft', [AdminQuestionController::class, 'draft'])->middleware('throttle:10,10');
    });

    Route::prefix('admin')->middleware('role:editor,admin')->group(function () {
        Route::post('/news/list', [AdminNewsController::class, 'list']);
        Route::get('/news/{news}', [AdminNewsController::class, 'show']);
        Route::post('/news', [AdminNewsController::class, 'store']);
        Route::patch('/news/{news}', [AdminNewsController::class, 'update']);
        Route::patch('/news/{news}/featured', [AdminNewsController::class, 'feature']);
        Route::delete('/news/{news}', [AdminNewsController::class, 'destroy']);

        Route::post('/questions', [AdminQuestionController::class, 'store']);
        Route::get('/staff', [AdminQuestionController::class, 'staff']);

        Route::post('/debates/list', [AdminDebateController::class, 'list']);
        Route::post('/debates', [AdminDebateController::class, 'store']);
        Route::patch('/debates/{debate}', [AdminDebateController::class, 'update']);

        Route::get('/organizations', [AdminOrganizationController::class, 'index']);
        Route::get('/organizations/{organization}', [AdminOrganizationController::class, 'show']);
        Route::post('/organizations', [AdminOrganizationController::class, 'store']);
        Route::patch('/organizations/{organization}', [AdminOrganizationController::class, 'update']);

        Route::post('/regulations', [AdminRegulationController::class, 'store']);
        Route::patch('/regulations/{regulation}', [AdminRegulationController::class, 'update']);
        Route::get('/regulations-review', [AdminRegulationController::class, 'review']);
        Route::post('/regulations/{regulation}/checked', [AdminRegulationController::class, 'checked']);
    });

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::delete('/organizations/{organization}', [AdminOrganizationController::class, 'destroy']);
        Route::delete('/regulations/{regulation}', [AdminRegulationController::class, 'destroy']);
        Route::post('/users/list', [AdminUserController::class, 'list']);
        Route::post('/users', [AdminUserController::class, 'store'])->middleware('throttle:10,1');
        Route::post('/users/invitations', [AdminUserController::class, 'invite'])->middleware('throttle:10,1');
        Route::patch('/users/{user}', [AdminUserController::class, 'update'])->middleware('throttle:10,1');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
        Route::get('/subscriptions/stats', [AdminSubscriptionController::class, 'stats']);
        Route::get('/members/stats', [MemberController::class, 'stats']);
        Route::delete('/questions/{question}', [AdminQuestionController::class, 'destroy']);
        Route::patch('/questions/{question}/assignee', [AdminQuestionController::class, 'assign']);
        Route::delete('/debates/{debate}', [AdminDebateController::class, 'destroy']);
        Route::get('/debates/{debate}/promotion', [AdminDebateController::class, 'promotion']);
        Route::get('/moderators', [AdminModeratorController::class, 'index']);
        Route::get('/moderators/log', [AdminModeratorController::class, 'log']);
        Route::patch('/moderators/{user}', [AdminModeratorController::class, 'update']);
        Route::get('/mailbox/folders', [AdminMailboxController::class, 'folders']);
        Route::get('/mailbox/messages', [AdminMailboxController::class, 'messages']);
        Route::get('/mailbox/messages/{uid}', [AdminMailboxController::class, 'show'])->whereNumber('uid');
        Route::patch('/mailbox/messages/{uid}', [AdminMailboxController::class, 'seen'])->whereNumber('uid');
        Route::get('/mailbox/messages/{uid}/attachments/{index}', [AdminMailboxController::class, 'attachment'])->whereNumber(['uid', 'index']);
        Route::post('/mailbox/send', [AdminMailboxController::class, 'send'])->middleware('throttle:20,10');
        Route::post('/debates/{debate}/promotions', [AdminDebateController::class, 'promote'])->middleware('throttle:5,10');
    });
});

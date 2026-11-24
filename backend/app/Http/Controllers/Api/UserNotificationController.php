<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\Request;

class UserNotificationController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate(['page' => ['nullable', 'integer', 'min:1'], 'unread' => ['nullable', 'boolean']]);
        $user = $request->user();

        $page = UserNotification::where('user_id', $user->id)
            ->when($data['unread'] ?? false, fn ($query) => $query->whereNull('read_at'))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(20, page: $data['page'] ?? 1);

        return response()->json([
            'data' => collect($page->items())->map(fn (UserNotification $item) => $item->present())->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
            'unread' => $this->unreadCount($user->id),
        ]);
    }

    public function unread(Request $request)
    {
        return response()->json(['unread' => $this->unreadCount($request->user()->id)]);
    }

    public function read(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required_without:all', 'array', 'max:100'],
            'ids.*' => ['integer'],
            'all' => ['sometimes', 'boolean'],
        ]);
        $userId = $request->user()->id;

        UserNotification::where('user_id', $userId)
            ->whereNull('read_at')
            ->when(! ($data['all'] ?? false), fn ($query) => $query->whereIn('id', $data['ids'] ?? []))
            ->update(['read_at' => now()]);

        return response()->json(['unread' => $this->unreadCount($userId)]);
    }

    private function unreadCount(int $userId): int
    {
        return UserNotification::where('user_id', $userId)->whereNull('read_at')->count();
    }
}

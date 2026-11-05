<?php

return [
    'hourly_limit' => (int) env('NOTIFY_HOURLY_LIMIT', 100),
    'instant_window_days' => (int) env('NOTIFY_INSTANT_WINDOW_DAYS', 3),
    'digest_hour' => (int) env('NOTIFY_DIGEST_HOUR', 7),
];

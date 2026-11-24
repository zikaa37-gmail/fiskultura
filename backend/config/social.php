<?php

return [
    'instagram' => [
        'app_id' => env('INSTAGRAM_APP_ID'),
        'app_secret' => env('INSTAGRAM_APP_SECRET'),
        'redirect_uri' => env('INSTAGRAM_REDIRECT_URI'),
        'scopes' => ['instagram_business_basic', 'instagram_business_content_publish'],
    ],
    'facebook' => [
        'app_id' => env('META_APP_ID'),
        'app_secret' => env('META_APP_SECRET'),
        'redirect_uri' => env('FACEBOOK_REDIRECT_URI'),
        'page_id' => env('FACEBOOK_PAGE_ID', '1486475654546179'),
        'version' => env('FACEBOOK_GRAPH_VERSION', 'v23.0'),
        'scopes' => ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
    ],
];

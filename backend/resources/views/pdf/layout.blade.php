<!DOCTYPE html>
<html lang="sr-Latn">
<head>
<meta charset="utf-8">
<title>{{ $title }}</title>
<style>
    @page { margin: 28px 32px 40px; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #0b1736; line-height: 1.45; }
    .brand { font-size: 13px; font-weight: bold; color: #1d4ed8; margin-bottom: 14px; }
    h1 { font-size: 17px; margin: 0 0 4px; }
    .subtitle { color: #55617a; margin-bottom: 14px; }
    h2 { font-size: 12px; margin: 16px 0 6px; color: #1d4ed8; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #dfe5f0; padding: 4px 6px; text-align: left; vertical-align: top; }
    th { background: #f1f5fb; width: 34%; font-weight: bold; }
    td.num, th.num { text-align: right; width: 14%; }
    .muted { color: #55617a; }
    ul { margin: 4px 0 0 16px; padding: 0; }
    li { margin-bottom: 3px; }
    .footer { position: fixed; bottom: -24px; left: 0; right: 0; font-size: 8px; color: #55617a; }
</style>
</head>
<body>
    <div class="brand">Fiskultura · fiskultura.rs</div>
    @yield('content')
    <div class="footer">Fiskultura — portal za fizičko vaspitanje i školski sport · napravljeno {{ now()->timezone('Europe/Belgrade')->format('d.m.Y. H:i') }}</div>
</body>
</html>

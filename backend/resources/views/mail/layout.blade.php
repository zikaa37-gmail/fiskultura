<!doctype html>
<html lang="sr-Latn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ $heading }}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0b1736;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #dfe5f0;border-radius:16px;">
          <tr>
            <td style="padding:20px 28px;border-bottom:1px solid #dfe5f0;font-size:20px;font-weight:900;letter-spacing:-0.03em;">
              <span style="color:#1d4ed8;">●</span> Fiskultura
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-size:16px;line-height:1.6;">
              @yield('content')
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-top:1px solid #dfe5f0;font-size:13px;color:#55617a;">
              Fiskultura — portal za fizičko vaspitanje i školski sport u Srbiji · <a href="{{ config('app.frontend_url') }}" style="color:#1d4ed8;">fiskultura.rs</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

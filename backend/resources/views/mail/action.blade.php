@extends('mail.layout')

@section('content')
  <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;">{{ $heading }}</h1>
  <p style="margin:0 0 12px;">{{ $greeting }}</p>
  @foreach ($lines as $line)
    <p style="margin:0 0 12px;">{{ $line }}</p>
  @endforeach
  <p style="margin:24px 0;">
    <a href="{{ $actionUrl }}" style="display:inline-block;padding:14px 24px;border-radius:12px;background:#1d4ed8;color:#ffffff;font-weight:700;text-decoration:none;">{{ $actionLabel }}</a>
  </p>
  <p style="margin:0 0 12px;font-size:13px;color:#55617a;">Ako dugme ne radi, otvorite ovaj link:<br><a href="{{ $actionUrl }}" style="color:#1d4ed8;word-break:break-all;">{{ $actionUrl }}</a></p>
  @if (! empty($socials))
    <p style="margin:24px 0 8px;font-weight:700;">{{ $socialsTitle ?? 'Pratite nas' }}</p>
    <p style="margin:0 0 24px;">
      @foreach ($socials as $social)
        <a href="{{ $social['url'] }}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 16px;border:1px solid #dfe5f0;border-radius:10px;color:#0b1736;font-weight:600;text-decoration:none;">{{ $social['label'] }}</a>
      @endforeach
    </p>
  @endif
  <p style="margin:0;font-size:13px;color:#55617a;">{{ $footnote }}</p>
@endsection

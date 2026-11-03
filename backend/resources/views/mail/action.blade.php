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
  <p style="margin:0;font-size:13px;color:#55617a;">{{ $footnote }}</p>
@endsection

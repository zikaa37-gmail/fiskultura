@extends('mail.layout')

@section('content')
  <h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;">{{ $notice->heading }}</h1>
  <p style="margin:0 0 20px;color:#55617a;">{{ $notice->intro }}</p>
  @foreach ($notice->items as $item)
    <div style="margin:0 0 20px;padding:0 0 20px;border-bottom:1px solid #dfe5f0;">
      @if ($item['meta'])
        <p style="margin:0 0 4px;font-size:13px;color:#55617a;">{{ $item['meta'] }}</p>
      @endif
      <p style="margin:0 0 6px;font-size:18px;font-weight:700;line-height:1.3;"><a href="{{ $item['url'] }}" style="color:#0b1736;text-decoration:none;">{{ $item['title'] }}</a></p>
      <p style="margin:0 0 8px;">{{ $item['summary'] }}</p>
      <a href="{{ $item['url'] }}" style="color:#1d4ed8;font-weight:700;">{{ $notice->actionLabel }}</a>
    </div>
  @endforeach
  <p style="margin:0;font-size:13px;color:#55617a;">
    Ovaj mejl stiže jer ste se prijavili na obaveštenja portala Fiskultura.
    <a href="{{ $notice->manageUrl }}" style="color:#1d4ed8;">Podešavanja obaveštenja</a> ·
    <a href="{{ $notice->unsubscribeUrl }}" style="color:#1d4ed8;">Odjava</a>
  </p>
@endsection

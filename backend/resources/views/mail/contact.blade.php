@extends('mail.layout')

@section('content')
  <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;">{{ $heading }}</h1>
  <p style="margin:0 0 4px;"><strong>Tema:</strong> {{ $topic }}</p>
  <p style="margin:0 0 16px;"><strong>Od:</strong> {{ $name }} &lt;{{ $email }}&gt;</p>
  <p style="margin:0 0 16px;white-space:pre-line;">{{ $body }}</p>
  <p style="margin:0;font-size:13px;color:#55617a;">Odgovor na ovaj mejl ide direktno pošiljaocu.</p>
@endsection

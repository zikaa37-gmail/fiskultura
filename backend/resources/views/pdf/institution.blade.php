@extends('pdf.layout')

@section('content')
    <h1>{{ $institution['name'] }}</h1>
    <div class="subtitle">{{ $typeLabel }}@if ($institution['place']) · {{ $institution['place'] }}@endif</div>

    <h2>Podaci o ustanovi</h2>
    <table>
        @foreach ($facts as $label => $value)
            <tr><th>{{ $label }}</th><td>{!! nl2br(e($value)) !!}</td></tr>
        @endforeach
    </table>

    <h2>Infrastruktura za fizičko vaspitanje</h2>
    @if ($facilities)
        @foreach ($facilities as $group)
            <table style="margin-bottom: 8px;">
                <tr><th colspan="2" style="width: auto; background: #e8eefc;">{{ $group['label'] }}</th></tr>
                @foreach ($group['items'] as $item)
                    <tr><th>{{ $item['label'] }}</th><td>{{ $item['value'] }}</td></tr>
                @endforeach
            </table>
        @endforeach
        @if ($note)
            <p><strong>Napomena:</strong> {{ $note }}</p>
        @endif
        @if ($updated)
            <p class="muted">Podaci ažurirani {{ $updated }}@if ($source) · izvor: {{ $source }}@endif</p>
        @endif
    @else
        <p class="muted">Za ovu ustanovu još nisu upisani podaci o sali, terenima, bazenu, stazi i rekvizitima.</p>
    @endif
@endsection

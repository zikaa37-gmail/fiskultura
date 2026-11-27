@extends('pdf.layout')

@section('content')
    <h1>{{ $summary['title'] ?? 'Infrastruktura za fizičko vaspitanje' }}</h1>
    <div class="subtitle">Obuhvat: {{ $scope }} · ustanova: {{ $stats['total'] }} · sa upisanim podacima: {{ $stats['with_data'] }}</div>

    @if (! empty($summary['summary']))
        <h2>Sažetak</h2>
        <p>{{ $summary['summary'] }}</p>
    @endif

    <h2>Brojevi</h2>
    <table>
        <tr><th style="width: auto;">Pokazatelj</th><th class="num">Ustanova</th><th class="num">Udeo</th></tr>
        @foreach ($stats['rows'] as $row)
            <tr><td>{{ $row['label'] }}</td>@if ($row['count'] === null)<td class="num" colspan="2">nema podataka</td>@else<td class="num">{{ $row['count'] }} od {{ $row['known'] }}</td><td class="num">{{ $row['share'] }}%</td>@endif</tr>
        @endforeach
    </table>
    <p class="muted">Udeo je računat od ustanova koje imaju upisane podatke o infrastrukturi.</p>

    @if (! empty($summary['findings']))
        <h2>Glavni nalazi</h2>
        <ul>@foreach ($summary['findings'] as $line)<li>{{ $line }}</li>@endforeach</ul>
    @endif
    @if (! empty($summary['recommendations']))
        <h2>Preporuke</h2>
        <ul>@foreach ($summary['recommendations'] as $line)<li>{{ $line }}</li>@endforeach</ul>
    @endif
    @if ($summary)
        <p class="muted">Tekst je napravio AI na osnovu brojeva iz tabele; uredništvo ga proverava.</p>
    @endif
@endsection

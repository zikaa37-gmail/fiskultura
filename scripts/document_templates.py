import sys
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

VERSION = '2026/27'
OUT = Path(__file__).resolve().parent.parent / 'frontend' / 'public' / 'sabloni'
GRAY = RGBColor(0x59, 0x5F, 0x6B)
LINE = '_' * 34
SHORT = '_' * 16


def new_document(landscape=False):
    doc = Document()
    section = doc.sections[0]
    if landscape:
        section.orientation = WD_ORIENT.LANDSCAPE
        section.page_width, section.page_height = section.page_height, section.page_width
    for side in ('left_margin', 'right_margin'):
        setattr(section, side, Cm(2))
    section.top_margin = Cm(1.8)
    section.bottom_margin = Cm(1.8)
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(11)
    style.paragraph_format.space_after = Pt(4)
    footer = section.footer.paragraphs[0]
    footer.text = f'Šablon sa fiskultura.rs · verzija {VERSION} · slobodno ga prilagodite svojoj školi'
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in footer.runs:
        run.font.size = Pt(8)
        run.font.color.rgb = GRAY
    return doc


def title(doc, text, subtitle=None):
    paragraph = doc.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run(text.upper())
    run.bold = True
    run.font.size = Pt(14)
    if subtitle:
        sub = doc.add_paragraph()
        sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
        sub_run = sub.add_run(subtitle)
        sub_run.font.size = Pt(10)
        sub_run.font.color.rgb = GRAY
    doc.add_paragraph()


def field(doc, label, width=LINE):
    doc.add_paragraph(f'{label}: {width}')


def heading(doc, text):
    paragraph = doc.add_paragraph()
    paragraph.paragraph_format.space_before = Pt(10)
    run = paragraph.add_run(text)
    run.bold = True
    run.font.size = Pt(12)


def note(doc, text):
    paragraph = doc.add_paragraph()
    run = paragraph.add_run(text)
    run.italic = True
    run.font.size = Pt(9)
    run.font.color.rgb = GRAY


def checkbox(doc, text):
    doc.add_paragraph(f'☐  {text}')


def shade(cell):
    properties = cell._tc.get_or_add_tcPr()
    fill = OxmlElement('w:shd')
    fill.set(qn('w:val'), 'clear')
    fill.set(qn('w:color'), 'auto')
    fill.set(qn('w:fill'), 'E8EEFB')
    properties.append(fill)


def table(doc, headers, rows, widths=None, font=10):
    grid = doc.add_table(rows=1 + len(rows), cols=len(headers))
    grid.style = 'Table Grid'
    grid.alignment = WD_TABLE_ALIGNMENT.CENTER
    repeat = OxmlElement('w:tblHeader')
    repeat.set(qn('w:val'), 'true')
    grid.rows[0]._tr.get_or_add_trPr().append(repeat)
    for index, text in enumerate(headers):
        cell = grid.rows[0].cells[index]
        cell.text = ''
        run = cell.paragraphs[0].add_run(text)
        run.bold = True
        run.font.size = Pt(font)
        shade(cell)
    for row_index, values in enumerate(rows, start=1):
        for index, text in enumerate(values):
            cell = grid.rows[row_index].cells[index]
            cell.text = ''
            run = cell.paragraphs[0].add_run(text)
            run.font.size = Pt(font)
    if widths:
        for row in grid.rows:
            for index, width in enumerate(widths):
                row.cells[index].width = Cm(width)
    return grid


def signature(doc, left='Datum', right='Potpis'):
    doc.add_paragraph()
    grid = doc.add_table(rows=2, cols=2)
    grid.rows[0].cells[0].text = f'{left}: {SHORT}'
    grid.rows[0].cells[1].text = f'{right}: {LINE}'
    grid.rows[1].cells[1].text = ''


def parental_consent():
    doc = new_document()
    title(doc, 'Saglasnost roditelja', 'za učešće učenika na školskom sportskom takmičenju')
    field(doc, 'Škola')
    field(doc, 'Ime i prezime učenika')
    field(doc, 'Razred i odeljenje', SHORT)
    heading(doc, 'Takmičenje')
    field(doc, 'Sport / disciplina')
    doc.add_paragraph('Nivo:  ☐ opštinsko   ☐ okružno   ☐ međuokružno   ☐ republičko   ☐ drugo: ' + SHORT)
    field(doc, 'Datum i mesto')
    field(doc, 'Polazak (vreme i mesto)')
    field(doc, 'Povratak (okvirno vreme)')
    field(doc, 'Prevoz')
    field(doc, 'Nastavnik u pratnji i telefon')
    heading(doc, 'Izjava roditelja / staratelja')
    doc.add_paragraph(
        f'Ja, {LINE}, roditelj / staratelj navedenog učenika, saglasan sam da moje dete učestvuje na '
        'navedenom takmičenju i putuje sa ekipom škole u pratnji nastavnika.'
    )
    checkbox(doc, 'Dete ima važeće lekarsko uverenje o zdravstvenoj sposobnosti, izdato dana ' + SHORT + '.')
    checkbox(doc, 'Upoznat sam sa programom puta i vremenom povratka.')
    field(doc, 'Šta nastavnik treba da zna (alergije, lekovi, hronične tegobe)')
    doc.add_paragraph(LINE * 2)
    field(doc, 'Telefon roditelja za hitne slučajeve')
    signature(doc, 'Datum', 'Potpis roditelja')
    doc.add_paragraph()
    note(
        doc,
        'Učenik ne sme da učestvuje na takmičenju bez utvrđene zdravstvene sposobnosti, a učešće u školskom '
        'sportu se ne naplaćuje učenicima (Zakon o sportu, čl. 143). Nastavnik čuva saglasnost i kopiju '
        'lekarskog uverenja uz prijavu ekipe.',
    )
    return doc


def exemption_request():
    doc = new_document()
    field(doc, 'Škola')
    field(doc, 'Mesto i datum')
    doc.add_paragraph()
    doc.add_paragraph('DIREKTORU ŠKOLE')
    doc.add_paragraph()
    title(doc, 'Zahtev', 'za oslobađanje od praktičnog dela nastave fizičkog i zdravstvenog vaspitanja')
    field(doc, 'Ime i prezime učenika')
    field(doc, 'Razred i odeljenje', SHORT)
    field(doc, 'Podnosilac zahteva (roditelj / staratelj)')
    field(doc, 'Telefon')
    heading(doc, 'Tražim oslobađanje')
    doc.add_paragraph('☐ privremeno, od ' + SHORT + ' do ' + SHORT)
    doc.add_paragraph('☐ za školsku godinu ' + SHORT)
    doc.add_paragraph('☐ delimično (navesti od čega): ' + LINE)
    doc.add_paragraph('☐ potpuno')
    heading(doc, 'Prilog')
    checkbox(doc, 'Mišljenje / predlog izabranog lekara od ' + SHORT)
    checkbox(doc, 'Druga medicinska dokumentacija: ' + LINE)
    signature(doc, 'Datum', 'Potpis podnosioca')
    doc.add_paragraph()
    note(
        doc,
        'Odluku o oslobađanju donosi direktor škole, na predlog izabranog lekara (Zakon o osnovnom obrazovanju '
        'i vaspitanju, čl. 65; Zakon o srednjem obrazovanju i vaspitanju, čl. 50). Oslobađa se samo praktični '
        'deo nastave: učenik se ocenjuje iz teorijskih znanja. Poruka roditelja da dete danas ne vežba nije '
        'oslobađanje. Rešenje se čuva uz pedagošku dokumentaciju nastavnika.',
    )
    return doc


def testing_record():
    doc = new_document(landscape=True)
    title(doc, 'Zapisnik testiranja', 'fizički razvoj i motoričke sposobnosti — nacionalna baterija (Zdravitas)')
    doc.add_paragraph(f'Škola: {LINE}    Odeljenje: {SHORT}    Nastavnik: {LINE}')
    doc.add_paragraph(f'Školska godina: {SHORT}    Merenje:  ☐ početak godine   ☐ kraj godine    Datum: {SHORT}')
    headers = [
        'Rb', 'Ime i prezime', 'Pol', 'Visina (cm)', 'Masa (kg)', 'BMI', 'Pretklon u sedu (cm)',
        'Skok udalj iz mesta (cm)', 'Ležanje-sed 30 s (broj)', 'Izdržaj u zgibu (s)', '4 × 10 m (s)',
        'Šatl ran (min:s)', 'Napomena',
    ]
    rows = [[str(number)] + [''] * (len(headers) - 1) for number in range(1, 33)]
    table(doc, headers, rows, [0.9, 4.6, 0.9, 1.5, 1.5, 1.2, 1.9, 1.9, 1.9, 1.9, 1.6, 1.7, 3.2], font=8)
    doc.add_paragraph()
    note(
        doc,
        'U 1. i 2. razredu osnovne škole mere se samo visina, masa i BMI; motorički testovi od 3. razreda. '
        'Rezultati se unose u Zdravitas i ne koriste se za ocenjivanje ni za poređenje učenika. Opis i '
        'slike svakog testa: fiskultura.rs/sportovi/testiranje.',
    )
    return doc


def section_report():
    doc = new_document()
    title(doc, 'Izveštaj o radu sportske sekcije')
    field(doc, 'Škola')
    doc.add_paragraph(f'Školska godina: {SHORT}    Period:  ☐ prvo polugodište   ☐ cela godina')
    field(doc, 'Sekcija (sport)')
    field(doc, 'Nastavnik')
    field(doc, 'Termini (dan i vreme)')
    doc.add_paragraph(f'Broj učenika: {SHORT} (učenika {SHORT}, učenica {SHORT})    Razredi: {SHORT}')
    heading(doc, 'Realizacija po mesecima')
    months = ['septembar', 'oktobar', 'novembar', 'decembar', 'januar', 'februar', 'mart', 'april', 'maj', 'jun']
    table(doc, ['Mesec', 'Održano časova', 'Sadržaji'], [[month, '', ''] for month in months], [3, 3, 11])
    doc.add_paragraph(f'Ukupno održano časova: {SHORT}')
    heading(doc, 'Takmičenja i rezultati')
    table(doc, ['Takmičenje', 'Nivo', 'Datum', 'Ekipa / pojedinci', 'Plasman'], [[''] * 5 for _ in range(6)], [5, 2.5, 2.5, 4, 3])
    heading(doc, 'Šta je išlo dobro')
    doc.add_paragraph(LINE * 2)
    doc.add_paragraph(LINE * 2)
    heading(doc, 'Teškoće (sala, oprema, termini) i predlozi')
    doc.add_paragraph(LINE * 2)
    doc.add_paragraph(LINE * 2)
    heading(doc, 'Plan za naredni period')
    doc.add_paragraph(LINE * 2)
    signature(doc, 'Datum', 'Nastavnik')
    return doc


def department_plan():
    doc = new_document()
    title(doc, 'Plan rada stručnog veća', 'za fizičko i zdravstveno vaspitanje')
    field(doc, 'Škola')
    field(doc, 'Školska godina', SHORT)
    field(doc, 'Rukovodilac veća')
    field(doc, 'Članovi')
    heading(doc, 'Aktivnosti po mesecima')
    note(doc, 'Predlozi u koloni „Aktivnost” su primer; obrišite ih ili dopunite planom svoje škole.')
    rows = [
        ['avgust', 'Podela časova, sekcija i sala; plan nabavke opreme; usvajanje plana rada veća', '', ''],
        ['septembar', 'Godišnji i operativni planovi; inicijalno testiranje i unos u Zdravitas; plan takmičenja', '', ''],
        ['oktobar', 'Nedelja školskog sporta; dogovor o kriterijumima ocenjivanja', '', ''],
        ['novembar', 'Školska takmičenja; ugledni čas', '', ''],
        ['decembar', 'Analiza uspeha na kraju tromesečja; učešće na opštinskim takmičenjima', '', ''],
        ['januar', 'Analiza prvog polugodišta; plan stručnog usavršavanja', '', ''],
        ['februar', 'Takmičenja (dvoranski sportovi); izveštaji sekcija za prvo polugodište', '', ''],
        ['mart', 'Kros i atletska takmičenja: priprema', '', ''],
        ['april', 'Nedelja školskog sporta; ugledni čas', '', ''],
        ['maj', 'Završno testiranje i unos u Zdravitas; okružna i republička takmičenja', '', ''],
        ['jun', 'Analiza rada, uspeha i takmičenja; izveštaj veća; predlog podele časova', '', ''],
    ]
    table(doc, ['Mesec', 'Aktivnost', 'Nosilac', 'Napomena'], rows, [2.4, 9.6, 2.6, 2.4])
    heading(doc, 'Stručno usavršavanje članova')
    table(doc, ['Član veća', 'Seminar / skup', 'Termin', 'Bodovi'], [[''] * 4 for _ in range(4)], [4, 7, 3, 3])
    signature(doc, 'Datum', 'Rukovodilac veća')
    return doc


def operational_plan():
    doc = new_document(landscape=True)
    title(doc, 'Operativni plan rada nastavnika', 'fizičko i zdravstveno vaspitanje')
    doc.add_paragraph(f'Škola: {LINE}    Nastavnik: {LINE}    Školska godina: {SHORT}')
    doc.add_paragraph(f'Mesec: {SHORT}    Razred / odeljenja: {SHORT}    Fond časova u mesecu: {SHORT}')
    headers = ['Rb časa', 'Nastavna tema', 'Nastavna jedinica', 'Tip časa', 'Ishodi (učenik će moći da…)', 'Korelacija', 'Evaluacija / napomena']
    rows = [[''] * len(headers) for _ in range(14)]
    table(doc, headers, rows, [1.4, 3.4, 5, 2.2, 6.4, 2.6, 4], font=9)
    doc.add_paragraph()
    note(
        doc,
        'Teme i ishodi su iz pravilnika o programu nastave i učenja za razred (fiskultura.rs/ishodi). Operativni '
        'plan sa već upisanim ishodima i vežbama pravi aplikacija e-pripreme.',
    )
    return doc


TEMPLATES = {
    'saglasnost-roditelja-takmicenje.docx': parental_consent,
    'zahtev-oslobadjanje-od-fizickog.docx': exemption_request,
    'zapisnik-testiranja.docx': testing_record,
    'izvestaj-sportske-sekcije.docx': section_report,
    'plan-rada-strucnog-veca.docx': department_plan,
    'operativni-plan.docx': operational_plan,
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, build in TEMPLATES.items():
        doc = build()
        doc.core_properties.author = 'fiskultura.rs'
        doc.core_properties.title = name.removesuffix('.docx').replace('-', ' ').capitalize()
        doc.save(OUT / name)
        print(OUT / name)
    return 0


if __name__ == '__main__':
    sys.exit(main())

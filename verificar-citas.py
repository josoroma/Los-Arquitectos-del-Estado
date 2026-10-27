#!/usr/bin/env python3
"""Coteja las citas del manuscrito con las páginas del corpus.

Cada cita textual va entre «» y la sigue una marca [n] que remite a una nota al
final del capítulo, con la forma `n. *Obra*, p. N`. El script comprueba que el
texto exista literalmente en esa página del PDF convertido y que toda referencia
apunte a una página que exista. Sale con código 1 si algo falla.

El corpus no se distribuye con el libro: son obras de terceros. Para verificar de
verdad hay que tenerlo convertido en `data/books/` (ver 92-fuentes.md). Sin él, el
script lo dice y sale con código 2 en lugar de fingir que todo está bien.

    python3 verificar-citas.py
    CORPUS=/ruta/a/data/books python3 verificar-citas.py
"""
from pathlib import Path
import os
import re
import sys

BOOK = Path(__file__).resolve().parent
CORPUS = Path(os.environ.get("CORPUS") or BOOK.parent.parent / "data" / "books")

SOURCES = {
    "Constitución de 1844": "influencia-liberalismo-constitucion-1844-2019",
    "Medio siglo de abogados": "medio-siglo-de-abogados-1821-1871-2024",
    "Estado liberal": "hacia-la-consolidacion-estado-liberal-2015",
    "Política agraria": "bases-politica-agraria-liberal-costa-rica",
    "Liberalismo y conservadurismo": "liberalismo-conservadurismo-costa-rica-2023",
    "Crisis de 1929": "crisis-1929-fundacion-partido-comunista-1984",
    "Derecho colectivo": "derecho-colectivo-trabajo-costa-rica-2021",
    "Luces y sombras": "luces-y-sombras-socialdemocracia-guerra-fria",
    "Comunismo a la tica": "comunismo-a-la-tica-pvp-2020",
    "Exterior constitutivo": "comunismo-exterior-constitutivo-2020",
    "Desempeño electoral": "desempeno-electoral-partido-comunista-1999",
    "ANFE 1958-1975": "marchena-anfe-1958-1975",
    "ANFE 1970-1990": "marchena-anfe-1970-1990",
    "Neoliberalismo": "neoliberalismo-costa-rica-1977-1978",
    "Estatuto": "movimiento-libertario-estatuto",
    "Organización partidaria": "gomez-campos-organizacion-partidaria",
    "Código General": "codigo-general-costa-rica-tomo-i-1858",
    "Iniciativa": "iniciativa-formacion-ley-1978",
    "Historiografía": "historia-derecho-costa-rica-historiografia-2022",
}

PAGE = re.compile(r"^## Página (\d+) (?:del PDF|de la secuencia)\s*$", re.M)
QUOTE = re.compile(r"«([^«»]+)»")
MARK = re.compile(r"\[(\d+(?:,\d+)*)\]")
NOTE = re.compile(r"^(\d+)\.\s+\*([^*]+)\*,\s*pp?\.\s*(\d+)(?:[-–](\d+))?\s*$", re.M)
REF = re.compile(r"\*([^*]+)\*, pp?\. (\d+)(?:[-–](\d+))?")


def normalize(text):
    text = text.replace("\u00ad", "").replace("\u00a0", " ")
    # A quote inside a blockquote carries the "> " marker on every wrapped line.
    text = re.sub(r"(?m)^\s*>\s?", "", text)
    return re.sub(r"\s+", " ", text).strip()


def contains(body, piece):
    """A quotation may capitalize its first letter; nothing else may differ."""
    if piece in body:
        return True
    if not piece:
        return False
    return piece[0].upper() + piece[1:] in body or piece[0].lower() + piece[1:] in body


def _bordes_ok(cuerpo, piece, i):
    """¿El fragmento coincide con límites de palabra en sus dos extremos?"""
    antes = cuerpo[i - 1] if i > 0 else " "
    despues = cuerpo[i + len(piece)] if i + len(piece) < len(cuerpo) else " "
    empieza_bien = not piece[0].isalpha() or not antes.isalpha()
    acaba_bien = not piece[-1].isalpha() or not despues.isalpha()
    # Una elipsis o un corchete del propio fragmento justifican el corte.
    empieza_bien = empieza_bien or piece[0] in ".["
    acaba_bien = acaba_bien or piece[-1] in ".]"
    return empieza_bien and acaba_bien


def cortada(body, piece):
    """Detecta una cita que empieza o acaba a mitad de palabra.

    Una cita truncada sigue siendo una subcadena literal, así que pasaba el
    cotejo: «...anteriormen» coincide con «...anteriormente», y el lector ve una
    errata del libro donde solo había un corte mal puesto. Aquí se exige que el
    fragmento coincida con límites de palabra en los extremos que no son
    elipsis.

    Se prueban las mismas variantes de mayúscula que acepta `contains`, para no
    marcar como truncada una cita que solo difiere en la primera letra.
    """
    if not piece or len(piece) < 12:
        return False
    for variante in (piece, piece[0].upper() + piece[1:], piece[0].lower() + piece[1:]):
        for cuerpo in (body, body.replace("\u00ad", "")):
            i = cuerpo.find(variante)
            if i == -1:
                continue
            # Basta una aparición bien delimitada para dar la cita por buena.
            if _bordes_ok(cuerpo, variante, i):
                return False
    return True


def load(slug):
    pages = {}
    for path in sorted((CORPUS / slug / "chapters").glob("*.md")):
        body = path.read_text().split("---", 2)[2]
        parts = PAGE.split(body)
        for number, text in zip(parts[1::2], parts[2::2]):
            pages[int(number)] = pages.get(int(number), "") + " " + normalize(text)
    return pages


def main():
    if not CORPUS.is_dir():
        print(f"No encuentro el corpus en {CORPUS}.")
        print("Las obras citadas son material de terceros y no se distribuyen con el libro.")
        print("Descárgalas y conviértelas en data/books/, o apunta CORPUS a tu copia:")
        print("    CORPUS=/ruta/a/data/books python3 verificar-citas.py")
        return 2

    corpus = {title: load(slug) for title, slug in SOURCES.items()}
    problems, quotes, refs = [], 0, 0
    for path in sorted(BOOK.glob("*.md")):
        text = path.read_text()
        notas = {}
        for match in NOTE.finditer(text):
            numero = int(match.group(1))
            title, first = match.group(2), int(match.group(3))
            last = int(match.group(4) or first)
            refs += 1
            notas[numero] = (title, first, last)
            if title not in corpus:
                problems.append(f"{path.name}: obra desconocida «{title}» (nota {numero})")
            elif not all(page in corpus[title] for page in range(first, last + 1)):
                problems.append(f"{path.name}: página inexistente {title}, p. {first}-{last} (nota {numero})")
        for match in QUOTE.finditer(text):
            fragment = normalize(match.group(1))
            if len(fragment.split()) < 4:
                continue
            quotes += 1
            # La marca puede ir pegada a la cita o cerrar el pasaje que la contiene:
            # dos citas seguidas comparten la nota que va al final del párrafo.
            mark = MARK.search(text, match.end(), match.end() + 400)
            if not mark:
                problems.append(f"{path.name}: cita sin referencia: «{fragment[:60]}»")
                continue
            primera = int(mark.group(1).split(",")[0])
            if primera not in notas:
                problems.append(f"{path.name}: la marca [{primera}] no tiene nota: «{fragment[:60]}»")
                continue
            title, first, last = notas[primera]
            pieces = [normalize(p) for p in re.split(r"\s*\[…\]\s*", fragment) if p.strip()]
            pages = range(first, last + 1)
            if all(any(contains(corpus[title].get(page, ""), piece) for page in pages) for piece in pieces):
                roto = []
                for p in pieces:
                    # Solo se revisa el borde de las páginas que sí lo contienen:
                    # sobre una lista vacía, all() daría verdadero por descarte.
                    donde = [corpus[title].get(pg, "") for pg in pages
                             if contains(corpus[title].get(pg, ""), p)]
                    if donde and all(cortada(d, p) for d in donde):
                        roto.append(p)
                if roto:
                    problems.append(f"{path.name}: «{roto[0][:70]}» corta una palabra en "
                                    f"{title}, p. {first}")
                continue
            found = [f"{t}, p. {n}" for t, book in corpus.items() for n, body in book.items()
                     if all(contains(body, piece) for piece in pieces)]
            where = f" (aparece en {', '.join(found[:3])})" if found else " (no aparece en el corpus)"
            problems.append(f"{path.name}: «{fragment[:70]}» no está en {title}, p. {first}{where}")
    for problem in problems:
        print(problem)
    print(f"{quotes} citas textuales y {refs} referencias revisadas; {len(problems)} problemas.")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())

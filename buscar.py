#!/usr/bin/env python3
"""Busca un patrón en el corpus convertido y muestra la página del PDF.

    python3 books/Los-Arquitectos-del-Estado/buscar.py "ANFE" anfe-1958
    python3 books/Los-Arquitectos-del-Estado/buscar.py -w 40 "Código Civil" estado-liberal

Imprime una línea por coincidencia: página, archivo y el texto de la línea.
"""
import argparse
from pathlib import Path
import re
import sys

CORPUS = Path(__file__).resolve().parent.parent.parent / "data" / "books"
PAGE = re.compile(r"^## Página (\d+) (?:del PDF|de la secuencia)\s*$")


def pages(slug):
    for path in sorted((CORPUS / slug / "chapters").glob("*.md")):
        body = path.read_text().split("---", 2)[2]
        number = None
        for line in body.splitlines():
            match = PAGE.match(line)
            if match:
                number = int(match.group(1))
            elif number and line.strip():
                yield number, path.name, line.strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pattern")
    parser.add_argument("slug", nargs="?", help="subcadena del slug; si se omite, todo el corpus")
    parser.add_argument("-w", "--width", type=int, default=200)
    parser.add_argument("-i", "--ignore-case", action="store_true")
    parser.add_argument("-c", "--count", action="store_true", help="solo contar por obra")
    args = parser.parse_args()
    flags = re.I if args.ignore_case else 0
    regex = re.compile(args.pattern, flags)
    slugs = sorted(p.name for p in CORPUS.iterdir() if (p / "chapters").is_dir())
    if args.slug:
        slugs = [s for s in slugs if args.slug in s]
    total = 0
    for slug in slugs:
        hits = [(n, f, l) for n, f, l in pages(slug) if regex.search(l)]
        if not hits:
            continue
        if args.count:
            print(f"{len(hits):5}  {slug}")
            total += len(hits)
            continue
        print(f"=== {slug}")
        for number, name, line in hits:
            print(f"p.{number:>4} {name[:26]:26} {line[:args.width]}")
        total += len(hits)
    print(f"-- {total} coincidencias", file=sys.stderr)


if __name__ == "__main__":
    main()

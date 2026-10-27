#!/usr/bin/env python3
"""Imprime el texto convertido de una o varias páginas del PDF.

    python3 books/Los-Arquitectos-del-Estado/pagina.py influencia 42 43
    python3 books/Los-Arquitectos-del-Estado/pagina.py estado-liberal 30-34
"""
import re
import sys
from pathlib import Path

CORPUS = Path(__file__).resolve().parent.parent.parent / "data" / "books"
PAGE = re.compile(r"^## Página (\d+) (?:del PDF|de la secuencia)\s*$")


def main():
    slug = next(p.name for p in CORPUS.iterdir() if p.name.startswith(sys.argv[1]))
    wanted = set()
    for arg in sys.argv[2:]:
        first, _, last = arg.partition("-")
        wanted.update(range(int(first), int(last or first) + 1))
    for path in sorted((CORPUS / slug / "chapters").glob("*.md")):
        body = path.read_text().split("---", 2)[2]
        number, buffer = None, []
        for line in body.splitlines() + ["## Página 0 del PDF"]:
            match = PAGE.match(line)
            if match:
                if number in wanted:
                    print(f"\n===== {slug} p. {number} ({path.name})")
                    print("\n".join(buffer).strip())
                number, buffer = int(match.group(1)), []
            elif number is not None:
                buffer.append(line)


if __name__ == "__main__":
    main()

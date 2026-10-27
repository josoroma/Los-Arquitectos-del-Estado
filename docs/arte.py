#!/usr/bin/env python3
"""Regenera los SVG originales de la edición ilustrada.

Uso: python3 docs/arte.py
Requiere Node.js 20 o superior; no usa paquetes npm ni servicios externos.
Las fuentes editables y las notas de diseño viven en docs/art/.
"""
import pathlib
import shutil
import subprocess

WEB = pathlib.Path(__file__).resolve().parent


def main():
    node = shutil.which("node")
    if not node:
        raise SystemExit("Se necesita Node.js 20 o superior para generar las ilustraciones SVG.")
    for fuente in ("build.mjs", "logo.mjs", "cubierta.mjs"):
        subprocess.run([node, str(WEB / "art" / fuente)], check=True, cwd=WEB)


if __name__ == "__main__":
    main()

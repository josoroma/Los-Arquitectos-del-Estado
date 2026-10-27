#!/usr/bin/env python3
"""Build determinista del lector del libro.

Lee los capítulos en Markdown de la carpeta padre y genera `docs/data/libro.js`
con la estructura fraccionada en capítulos y secciones (para el índice, las
anclas y la búsqueda).

Uso:  python3 docs/build.py
Salida: docs/data/libro.js
"""
import json
import pathlib
import re

from markdown_it import MarkdownIt

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "data" / "libro.js"

md = MarkdownIt("commonmark", {"html": False, "breaks": False, "typographer": True}).enable("table")

TITULO = "Los arquitectos del Estado"
SUBTITULO = "El liberalismo costarricense y el Estado que construyó sin querer (1821-2026)"
AUTOR = "josoroma + AI Corpus"
ARTE = ROOT / "docs" / "art" / "capitulos.json"

CAPITULOS = [
    ("00-portada-y-nota-de-metodo.md", "Nota de método", "preliminar"),
    ("01-el-pais-sin-estado.md", "El país sin Estado", "capitulo"),
    ("02-la-constitucion-que-nadie-recuerda.md", "La Constitución que nadie recuerda", "capitulo"),
    ("03-los-abogados-de-la-republica.md", "Los abogados de la república", "capitulo"),
    ("04-guardia-y-la-maquina.md", "Guardia y la máquina", "capitulo"),
    ("05-la-tierra-y-el-credito.md", "La tierra y el crédito", "capitulo"),
    ("06-la-palabra-liberal.md", "La palabra liberal se vuelve disputa", "capitulo"),
    ("07-el-populismo-antes-del-populismo.md", "El populismo antes del populismo", "capitulo"),
    ("08-1948.md", "1948: el liberalismo gana la guerra y pierde el país", "capitulo"),
    ("09-la-mano-invisible-que-llego-tarde.md", "La mano invisible que llegó tarde", "capitulo"),
    ("10-el-asesor.md", "El asesor", "capitulo"),
    ("11-epilogo-autopsia.md", "Autopsia de una tradición", "epilogo"),
    ("90-cronologia.md", "Cronología", "apendice"),
    ("91-registro-de-vacios.md", "Registro de vacíos", "apendice"),
    ("92-fuentes.md", "Fuentes", "apendice"),
]

ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]


def slug(texto: str) -> str:
    texto = texto.lower()
    texto = re.sub(r"[^a-z0-9áéíóúüñ]+", "-", texto)
    return texto.strip("-")[:60]


NAV = re.compile(r"^\[.*\]\([^)]*\.md\)")

# Las referencias viven al final del capítulo. En el cuerpo solo queda [n].
NOTA = re.compile(r"\[(\d+(?:,\d+)*)\]")
TOKEN = "\u0001nota:"


def marcar_notas(texto: str) -> str:
    """Cambia [3] por un token que sobrevive al render y luego se vuelve enlace."""
    return NOTA.sub(lambda m: f"{TOKEN}{m.group(1)}\u0001", texto)


# Qué sección cita cada nota, para que la nota pueda devolver al lector.
PROCEDENCIA = {}


def enlazar_notas(html: str, cid: str, sid: str) -> str:
    def cambio(m):
        numeros = m.group(1).split(",")
        enlaces = []
        for n in numeros:
            PROCEDENCIA.setdefault(cid, {}).setdefault(n, sid)
            enlaces.append(f'<a class="nota-ref" href="#{cid}--nota-{n}" title="Nota {n}">{n}</a>')
        return f'<sup class="nota-marca">{"".join(enlaces)}</sup>'
    return re.sub(TOKEN + r"(\d+(?:,\d+)*)\u0001", cambio, html)


def numerar_notas(html: str, cid: str) -> str:
    """Da a cada nota un id propio y un enlace de vuelta a donde se la llamó."""
    origen = PROCEDENCIA.get(cid, {})
    contador = [0]

    def cambio(m):
        contador[0] += 1
        vuelta = origen.get(str(contador[0]))
        flecha = (f' <a class="nota-volver" href="#{vuelta}" title="Volver al texto">↑</a>'
                  if vuelta else "")
        return f'<li id="{cid}--nota-{contador[0]}">{flecha}'
    return re.sub(r"<li>", cambio, html)


def quitar_nav(texto: str) -> str:
    """El lector web tiene su propia navegación; los enlaces a .md no sirven aquí."""
    lineas = texto.rstrip().split("\n")
    while lineas and (not lineas[-1].strip() or lineas[-1].strip() == "---" or NAV.match(lineas[-1].strip())):
        lineas.pop()
    return "\n".join(lineas)


def envolver_tablas(html: str) -> str:
    """Una tabla ancha necesita su propio contenedor con scroll, no el bloque entero."""
    return html.replace("<table>", '<div class="tabla-scroll"><table>').replace("</table>", "</table></div>")


def enlazar(html: str) -> str:
    """Un enlace a un capítulo .md se convierte en ancla del lector."""
    def cambio(m):
        destino = m.group(1)
        if destino.startswith("http") or not destino.endswith(".md"):
            return m.group(0)
        cid = "cap-" + slug(destino.rsplit(".", 1)[0])
        return f'href="#{cid}"'
    return re.sub(r'href="([^"]+)"', cambio, html)


def render(texto: str, cid: str = "", sid: str = "") -> str:
    html = md.render(marcar_notas(quitar_nav(texto)).strip())
    html = enlazar_notas(html, cid, sid) if cid else re.sub(TOKEN + r"\d+\u0001", "", html)
    if cid:
        html = numerar_notas(html, cid)
    return envolver_tablas(enlazar(html))


def partir(markdown: str):
    """Separa el cuerpo en secciones por encabezados de nivel 2."""
    lineas = markdown.split("\n")
    titulo = ""
    intro = []
    secciones = []
    actual = None

    for linea in lineas:
        if linea.startswith("# ") and not titulo:
            titulo = linea[2:].strip()
            continue
        if linea.startswith("## "):
            if actual is not None:
                secciones.append(actual)
            actual = {"titulo": linea[3:].strip(), "cuerpo": []}
            continue
        if actual is None:
            intro.append(linea)
        else:
            actual["cuerpo"].append(linea)
    if actual is not None:
        secciones.append(actual)

    return titulo, "\n".join(intro).strip(), secciones


def main():
    ilustraciones = json.loads(ARTE.read_text(encoding="utf-8"))
    capitulos = []
    indice = []
    numero = 0

    for archivo, corto, tipo in CAPITULOS:
        ruta = ROOT / archivo
        if not ruta.exists():
            raise SystemExit(f"Falta el capítulo: {archivo}")
        titulo, intro, secciones = partir(ruta.read_text(encoding="utf-8"))
        # El número del capítulo ya lo muestra la insignia romana; no se repite.
        titulo = re.sub(r"^\d+\.\s*", "", titulo)
        if tipo == "capitulo":
            numero += 1
            etiqueta = ROMANOS[numero - 1]
        elif tipo == "epilogo":
            etiqueta = "✳"
        elif tipo == "preliminar":
            etiqueta = "§"
        else:
            etiqueta = "A"

        cid = "cap-" + slug(archivo.rsplit(".", 1)[0])
        arte = ilustraciones.get(archivo[:2])
        if tipo in ("capitulo", "epilogo"):
            if not arte or not all(arte.get(k) for k in ("src", "alt", "titulo", "descripcion")):
                raise SystemExit(f"Falta la ilustración o su descripción: {archivo}")
            if not (ROOT / "docs" / arte["src"]).is_file():
                raise SystemExit(f"Falta el SVG: {arte['src']}")
        cuerpo = []
        PROCEDENCIA[cid] = {}
        for seccion in secciones:
            sid = cid + "--" + slug(seccion["titulo"])
            html = render("\n".join(seccion["cuerpo"]).strip(), cid, sid)
            texto = re.sub(r"<[^>]+>", " ", html)
            texto = re.sub(r"\s+", " ", texto).strip()
            es_notas = seccion["titulo"].strip().lower() == "notas"
            cuerpo.append({"id": sid, "titulo": seccion["titulo"], "html": html,
                           "texto": texto, "clase": "notas" if es_notas else ""})
            # Las notas son aparato: no ensucian el índice ni los resultados de búsqueda.
            if not es_notas:
                indice.append({"id": sid, "capitulo": cid, "titulo": seccion["titulo"],
                               "texto": texto, "buscar": texto.lower()})

        capitulos.append({
            "id": cid,
            "archivo": archivo,
            "tipo": tipo,
            "etiqueta": etiqueta,
            "numero": numero if tipo == "capitulo" else None,
            "titulo": titulo or corto,
            "corto": corto,
            "arte": arte,
            "intro_html": render(intro, cid) if intro else "",
            "secciones": cuerpo,
            "resumen": (f"{sum(1 for s in cuerpo if s['clase'] != 'notas')} secciones"
                        if cuerpo else "Documento de referencia"),
        })

    libro = {
        "meta": {
            "titulo": TITULO,
            "subtitulo": SUBTITULO,
            "autor": AUTOR,
            "capitulos": sum(1 for c in capitulos if c["tipo"] == "capitulo"),
            "secciones": len(indice),
            "palabras": sum(len(s["texto"].split()) for c in capitulos for s in c["secciones"]),
        },
        "capitulos": capitulos,
        "indice": indice,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("window.LIBRO = " + json.dumps(libro, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"OK -> {OUT}  ({libro['meta']['capitulos']} capítulos, {libro['meta']['secciones']} secciones, {libro['meta']['palabras']} palabras)")


if __name__ == "__main__":
    main()

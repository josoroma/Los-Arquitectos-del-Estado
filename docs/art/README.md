# Arte de Los arquitectos del Estado

Familia de ilustraciones SVG originales para los diez capítulos, el epílogo y
la portada. Autoría del libro: **josoroma + AI Corpus**, con el logotipo vectorial
aportado por Josoroma. El emblema lateral usa la antorcha Torch Eagle; su
procedencia y derechos de terceros se detallan en [torch-source.md](torch-source.md).

## Dirección visual

Composición editorial clásica, grandes títulos serif y materiales reconocibles:
papel, piedra, adobe, teja, madera y latón. La identidad costarricense se expresa
en la arquitectura, los cafetos, el paisaje y los objetos del relato. Las escenas
son interpretaciones visuales, no reproducciones exactas de edificios o hechos.

| Tono | Color | Función |
| --- | --- | --- |
| Transparente | Sin relleno | Fondo de portada, capítulos y miniaturas |
| Marfil | `#f2eadb` | Papel y materiales de los objetos |
| Verde bosque | `#183c34` | Tinta, arquitectura y vegetación |
| Rojo óxido | `#9c4035` | Teja y acentos editoriales |
| Latón | `#b58a45` | Herrajes, objetos y pequeños detalles |

Los subtítulos del lector usan color, peso tipográfico y espacio; no llevan
una línea decorativa antes del texto. El arte se mantiene vectorial, sin imágenes
raster incrustadas, servicios remotos ni fuentes externas obligatorias.

La interfaz del lector utiliza los tokens Luma proporcionados por el autor,
con fondos neutros y acentos azules en los temas claro y oscuro. La tabla
anterior describe la paleta de las ilustraciones, que conserva sus colores.
Las ilustraciones tienen fondo transparente en ambos temas, sin textura de papel
ni paisaje decorativo; las sombras suaves conservan el volumen de las escenas.

## Fuentes editables

- `build.mjs`: genera las escenas de portada y capítulos.
- `capitulos.json`: título, descripción accesible y destino de cada ilustración;
  se genera a partir de los metadatos editables de `build.mjs`.
- `logo.mjs`: extrae la antorcha y la llama del archivo oficial conservado en
  `torch-eagle-source.svg`, sin descargas ni dependencias.
- `../assets/img/josoroma.svg`: logotipo original aportado por el autor, con sus
  ocho trazados y colores originales. Se utiliza en el lector y la cubierta.
- `cubierta.mjs`: incorpora la escena de portada en una cubierta tipográfica
  autónoma con título, subtítulo y el logotipo de autoría incrustado.

Desde la raíz del libro:

```sh
python3 docs/arte.py
python3 docs/build.py
```

La primera orden requiere Node.js 20+ y regenera los SVG de `docs/assets/img/`.
La segunda requiere `markdown-it-py`, verifica que cada capítulo tenga arte y
reconstruye los datos del lector. No se necesitan paquetes npm.

## Referencias de diseño

- Taster: recursos locales de `/Users/josoroma/sites/taster`, especialmente las
  guías de libros interactivos, diagramas y verificación en navegador.
- Anatomy: criterios de volumen, materiales, geometría isométrica y piezas
  reconocibles; los archivos reutilizados conservan su licencia.
- SuperIntelligence Icons: renderer `Scene` de la colección local
  `/Users/josoroma/sites/svg-icons`, conservado con sus licencias MIT en `logo-kit/`
  como referencia de la edición anterior; la antorcha actual no lo utiliza.
- [La vida bajo permiso](https://josoroma.github.io/la-vida-bajo-permiso/):
  presencia del crédito «josoroma + AI Corpus» en portada y sección de autoría.
- Portadas de ensayos de Murray Rothbard y Ludwig von Mises: referencia general
  de jerarquía editorial clásica. Las ilustraciones de esta edición son nuevas.

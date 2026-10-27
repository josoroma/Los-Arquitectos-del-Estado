# Antorcha del lector

El emblema `assets/img/logo.svg` reproduce la geometría **Torch Eagle** del
Libertarian Party estadounidense solicitada para esta edición. Se extrajeron
la antorcha y la llama del SVG oficial; no se redibujó la marca ni se añadió el
nombre del partido al libro.

## Procedencia

- Titular indicado por la página oficial: Libertarian National Committee, Inc.
- [Guía oficial de identidad](https://lpaction.org/).
- [Carpeta oficial de archivos SVG](https://drive.google.com/drive/folders/0B_W0CWzU_8VnNkZla3U3blVZX2c?resourcekey=0-4GUVqK5tCgUREhcID3FLuw).
- Archivo: `lp_logo_primary_pms.svg`, conservado en `torch-eagle-source.svg`
  con los espacios al final de línea normalizados, sin modificar la geometría.
- [Archivo fuente público](https://drive.google.com/file/d/0B_W0CWzU_8VnX0tsV3o4eno0eWs/view?resourcekey=0-EWOxTHcwuR8dgp-R7dUyuw).
- Consultado el 28 de octubre de 2026.

Los colores y las formas se mantienen: dorado `#FFD100`, gris `#55565A` y blanco.
El fondo es transparente y el encuadre conserva la proporción original.

## Derechos

Es una marca de terceros y **no forma parte de las licencias MIT** de los
renderers incluidos en este repositorio. La guía oficial atribuye el logo al
LNC y describe condiciones de uso para materiales del partido, sus afiliados
y sus candidatos respaldados; no publica una licencia de contenido libre.
Esta nota registra su procedencia, sin afirmar patrocinio ni autorización
institucional para el libro.

## Regeneración

```sh
node docs/art/logo.mjs
```

El proceso es local y determinista, sin descargas, dependencias npm ni raster.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// La misma escena del lector, incorporada como geometría: el SVG es autónomo.
const source = readFileSync(new URL('../assets/img/portada.svg', import.meta.url), 'utf8');
const viewBox = source.match(/<svg\b[^>]*\bviewBox="([^"]+)"/)?.[1];
if (!viewBox) throw new Error('La ilustración de portada debe declarar su viewBox.');
const art = source
  .replace(/<\?xml[^>]*\?>/g, '')
  .replace(/<svg\b[^>]*>/, `<svg x="65" y="610" width="1070" height="900" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">`);
// Preserve the author's supplied paths and brand colors; embed them for portability.
const author = readFileSync(new URL('../assets/img/josoroma.svg', import.meta.url), 'utf8')
  .replace(/<svg\b[^>]*>/, '<svg x="300" y="1576" width="320" height="64" viewBox="0 0 1000 200" aria-hidden="true">');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1740" viewBox="0 0 1200 1740" role="img" aria-labelledby="cubierta-titulo cubierta-desc">
  <title id="cubierta-titulo">Los arquitectos del Estado — josoroma + AI Corpus</title>
  <desc id="cubierta-desc">Cubierta editorial de fondo transparente, verde bosque y rojo óxido. Una escena isométrica costarricense acompaña el título del ensayo y el crédito de autoría.</desc>
  <rect x="34" y="34" width="1132" height="1672" fill="none" stroke="#b58a45" stroke-width="1.5"/>
  <g font-family="Arial, Helvetica, sans-serif" fill="#526354">
    <text x="100" y="106" font-size="20" letter-spacing="4">ENSAYO HISTÓRICO · COSTA RICA</text>
    <text x="1100" y="106" text-anchor="end" font-size="20" letter-spacing="2">1821–2026</text>
  </g>
  <g font-family="Georgia, 'Times New Roman', serif" font-weight="400" letter-spacing="-5">
    <text x="96" y="258" font-size="128" fill="#183c34">Los arquitectos</text>
    <text x="96" y="402" font-size="146" fill="#9c4035">del Estado</text>
  </g>
  <g font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#445347">
    <text x="102" y="500">El liberalismo costarricense y el Estado</text>
    <text x="102" y="548">que construyó sin querer.</text>
  </g>
  ${art}
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="600" y="1560" text-anchor="middle" font-size="17" letter-spacing="5" fill="#72654f">AUTORÍA</text>
    ${author}
    <text x="650" y="1627" text-anchor="middle" font-size="39" fill="#9c4035">+</text>
    <text x="692" y="1627" font-size="39" fill="#183c34">AI Corpus</text>
    <text x="600" y="1668" text-anchor="middle" font-size="17" letter-spacing="2.2" fill="#72654f">CADA HECHO, CON SU PÁGINA</text>
  </g>
</svg>\n`;
const out = new URL('../assets/img/cubierta.svg', import.meta.url);
writeFileSync(out, svg);
console.log(`OK → ${fileURLToPath(out)}`);

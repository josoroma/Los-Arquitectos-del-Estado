// Torch Eagle: source geometry supplied by the Libertarian National Committee.
// See torch-source.md for provenance and third-party rights.
// Generate: node docs/art/logo.mjs (offline, no dependencies).
import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('./torch-eagle-source.svg', import.meta.url), 'utf8');
const handle = source.match(/<polygon class="st0"[\s\S]*?\/>/)?.[0];
const flame = source.match(/<g>\s*(<path class="st1"[\s\S]*?)<\/g>/)?.[1];
if (!handle || !flame) throw new Error('The official Torch Eagle source is incomplete.');
const geometry = (handle + flame)
  .replaceAll('class="st0"', 'fill="#55565A"')
  .replaceAll('class="st1"', 'fill="#FFD100"')
  .replaceAll('class="st2"', 'fill="#FFFFFF"')
  .replace(/[ \t]+$/gm, '').trim();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="178" height="402" viewBox="0 0 178 402" role="img" aria-labelledby="torch-title torch-desc">
<title id="torch-title">Antorcha de la libertad</title>
<desc id="torch-desc">Torch Eagle del Libertarian Party estadounidense: llama dorada en forma de águila y antorcha gris. Geometría de la identidad visual del Libertarian National Committee.</desc>
${geometry}
</svg>\n`;
await writeFile(new URL('../assets/img/logo.svg', import.meta.url), svg);
console.log('Torch Eagle SVG generated.');

const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(process.argv[2] || 'sharp');
const root = path.resolve(__dirname, '../..');
const dir = path.join(root, 'Docs/Technical_articles/Other_Articles/Wired_communication/images/Wired_Communication');
(async () => {
  const sources = (await fs.readdir(dir))
    .filter(name => name.toLowerCase().endsWith('.svg'))
    .sort((a, b) => a.localeCompare(b));
  for (const source of sources) {
    const svg = path.join(dir, source);
    const png = path.join(dir, `${path.basename(source, path.extname(source))}.png`);
    await fs.writeFile(png, await sharp(svg, {density: 192}).png().toBuffer());
  }
  console.log(`Rendered ${sources.length} PNGs from all SVG sources.`);
})().catch(e => { console.error(e); process.exitCode = 1; });

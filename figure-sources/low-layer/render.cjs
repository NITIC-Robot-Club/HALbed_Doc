// Rasterize the final SVGs. Supply a module path only if sharp is not installed locally.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(process.argv.slice(2).find(arg => !arg.startsWith('--')) || 'sharp');
const root = path.resolve(__dirname, '../..');
const output = path.join(root, 'Docs/Technical_articles/MCU_Doc/images/Low_Layer');
const cache = path.join(root, '.vitepress/cache/low-layer-figures');

(async () => {
  const scenes = JSON.parse(await fs.readFile(path.join(cache, 'scenes.json'), 'utf8'));
  let prior = [];
  try { prior = JSON.parse(await fs.readFile(path.join(cache, 'export-origins.json'), 'utf8')); } catch {}
  const knownOrigins = new Map(prior.map(item => [item.name, item.origin]));
  const origins = [];
  for (const scene of scenes) {
    const name = scene.name + '.svg';
    const target = path.join(output, name);
    let origin = knownOrigins.get(name) || 'existing-svg';
    if (process.argv.includes('--from-source')) {
      await fs.copyFile(path.join(cache, name), target);
      origin = 'python-source-matching-figma';
    }
    try { await fs.access(target); }
    catch {
      await fs.copyFile(path.join(cache, name), target);
      origin = 'python-source-matching-figma';
    }
    origins.push({ name, origin });
    if (!scene.name.endsWith('-mobile')) {
      await sharp(target, { density: 144 }).png().toFile(target.replace(/\.svg$/, '.png'));
    }
  }
  await fs.writeFile(path.join(cache, 'export-origins.json'), JSON.stringify(origins, null, 2));
  // Review-only contact sheets do not become website assets.
  for (const mobile of [false, true]) {
    const selected = scenes.filter(s => s.name.endsWith('-mobile') === mobile);
    const tiles = [];
    const width = mobile ? 300 : 440, height = mobile ? 1170 : 550;
    for (let i = 0; i < selected.length; i++) {
      const tile = await sharp(path.join(output, selected[i].name + '.svg')).resize({width:width-16,height:height-48,fit:'inside'}).png().toBuffer();
      const label = Buffer.from(`<svg width="${width}" height="30"><text x="8" y="22" font-size="15" font-family="sans-serif">${selected[i].name.replace('-mobile','')}</text></svg>`);
      tiles.push({input:label,left:(i%4)*width,top:Math.floor(i/4)*height});
      tiles.push({input:tile,left:(i%4)*width+8,top:Math.floor(i/4)*height+38});
    }
    await sharp({create:{width:width*4,height:height*2,channels:3,background:'#e8ecef'}}).composite(tiles).png().toFile(path.join(cache, mobile?'review-mobile.png':'review-desktop.png'));
  }
  console.log(`Saved 16 SVGs and 8 PNGs. Origins: ${JSON.stringify(origins)}`);
})().catch(error => { console.error(error); process.exitCode = 1; });

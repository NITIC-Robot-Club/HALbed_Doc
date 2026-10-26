// Check the local VitePress pages in Chrome. Requires playwright; no external requests.
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require(process.argv[2] || 'playwright');
const root = path.resolve(__dirname, '../..');
const cache = path.join(root, '.vitepress/cache/low-layer-figures');
const pages = ['dc-motor-slow-start', 'pullup-and-pulldown'];
const reports = [];

(async () => {
  // Serve a completed build, avoiding dev-server filesystem watchers in nested worktrees.
  const dist = path.join(root, '.vitepress/cache/low-layer-site');
  const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/HALbed_Doc\//,'');
      const file = path.resolve(dist, pathname || 'index.html');
      if (!file.startsWith(dist + path.sep) && file!==path.join(dist,'index.html')) throw new Error('Invalid path');
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      response.end(await fs.readFile(file));
    } catch {response.writeHead(404);response.end('Not found');}
  });
  await new Promise(resolve => server.listen(5173,'127.0.0.1',resolve));
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    for (const width of [1440,390]) for (const theme of ['light','dark']) {
      const context = await browser.newContext({viewport:{width,height:1000},colorScheme:theme});
      await context.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:5173/') ? route.continue() : route.abort());
      const page = await context.newPage();
      await page.addInitScript(isDark => {localStorage.setItem('vitepress-theme-appearance',isDark?'dark':'light');document.documentElement.classList.toggle('dark',isDark);},theme==='dark');
      for (const name of pages) {
        await page.goto(`http://127.0.0.1:5173/HALbed_Doc/Docs/Technical_articles/MCU_Doc/${name}.html`,{waitUntil:'networkidle'});
        await page.locator('.low-layer-figure').first().waitFor();
        await page.evaluate(async () => {
          for (const img of document.querySelectorAll('.low-layer-figure img')) {
            img.loading = 'eager';
            await img.decode();
          }
        });
        const result = await page.evaluate(() => ({
          dark:document.documentElement.classList.contains('dark'),
          overflow:document.documentElement.scrollWidth>innerWidth,
          figures:[...document.querySelectorAll('.low-layer-figure')].map(p=>{
            const img=p.querySelector('img');const r=img.getBoundingClientRect();
            return {src:img.currentSrc.split('/').pop(),loaded:img.complete&&img.naturalWidth>0,width:r.width,height:r.height,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,alt:img.alt,background:getComputedStyle(p).backgroundColor,filter:getComputedStyle(img).filter};
          })
        }));
        if(result.overflow||result.dark!==(theme==='dark')||result.figures.length!==3||result.figures.some(f=>!f.loaded||!f.alt||f.src.includes('-mobile')!==(width<640)||f.filter!=='none'))throw new Error(JSON.stringify({name,width,theme,result}));
        await page.locator('.low-layer-figure').first().screenshot({path:path.join(cache,`${name}-${width}-${theme}.png`)});
        reports.push({name,width,theme,...result});
      }
      await context.close();
    }
  } finally {await browser.close();await new Promise(resolve => server.close(resolve));}
  await fs.writeFile(path.join(cache,'site-check.json'),JSON.stringify(reports,null,2));
  console.log(`PASS: ${reports.length} page states / ${reports.reduce((n,r)=>n+r.figures.length,0)} figure checks; no overflow, missing images, incorrect source selection, or image filters.`);
})().catch(error=>{console.error(error);process.exitCode=1;});

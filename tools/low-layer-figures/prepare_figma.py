"""Emit one Figma Plugin API script per figure, below the tool's 50 KB input limit."""
import json
from pathlib import Path

CACHE = Path(__file__).resolve().parents[2] / '.vitepress/cache/low-layer-figures'
TEMPLATE = r'''
await figma.loadFontAsync({family:'Noto Sans JP',style:'Regular'});
await figma.loadFontAsync({family:'Noto Sans JP',style:'Bold'});
const s = __SCENE__;
const existing = figma.currentPage.children.find(n=>n.name===s.name);
// Set replaceExisting=true only to replace this named illustration deliberately.
const replaceExisting = false;
if(existing && !replaceExisting) return {skippedNodeId:existing.id,name:s.name};
const origin = existing ? {x:existing.x,y:existing.y} : {x:__X__,y:__Y__};
const color=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const node=figma.createNodeFromSvg(s.svg);
node.name=s.name;node.x=origin.x;node.y=origin.y;node.clipsContent=false;
const createdNodeIds=[node.id,...node.findAll().map(n=>n.id)];
for(const l of s.labels){
  const t=figma.createText();createdNodeIds.push(t.id);node.appendChild(t);
  t.fontName={family:'Noto Sans JP',style:l.bold?'Bold':'Regular'};
  t.fontSize=l.size;t.lineHeight={unit:'PERCENT',value:150};
  t.fills=[{type:'SOLID',color:color(l.color)}];t.characters=l.text;
  t.x=l.x;t.y=l.y;t.resize(l.width,l.size*1.5);t.textAutoResize='HEIGHT';
  t.name=l.text.replace(/\n/g,' / ');
}
node.exportSettings=[{format:'SVG',svgOutlineText:false},{format:'PNG',constraint:{type:'SCALE',value:2}}];
const removedNodeIds=[];
if(existing && replaceExisting){removedNodeIds.push(existing.id);existing.remove();}
return {createdNodeIds,removedNodeIds,name:s.name,nodeId:node.id,width:node.width,height:node.height};
'''

for i, scene in enumerate(json.loads((CACHE/'scenes.json').read_text(encoding='utf-8'))):
    code = TEMPLATE.replace('__SCENE__', json.dumps(scene, ensure_ascii=False)).replace('__X__', str(i%4*1050)).replace('__Y__', str(i//4*2000))
    assert len(code) < 50000, scene['name']
    (CACHE/(scene['name']+'.figma.js')).write_text(code, encoding='utf-8')
print('16 Figma scripts prepared. Existing illustrations are skipped by default.')

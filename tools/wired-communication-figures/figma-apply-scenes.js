// Figma MCP use_figma body. Prefix with `const scenes = <scenes.json subset>;`.
const createdNodeIds=[],removedNodeIds=[],mutatedNodeIds=[],frames=[];
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const old=[];
for(const s of scenes){const f=await figma.getNodeByIdAsync(s.nodeId);if(!f||f.type!=='FRAME'||f.name!==s.name)throw Error('Frame mismatch '+s.nodeId);old.push(f);}
const fonts=new Map();
for(const f of old)for(const t of f.findAll(n=>n.type==='TEXT'))for(const seg of t.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(seg.fontName),seg.fontName);
fonts.set('regular',{family:'Noto Sans JP',style:'Regular'});fonts.set('bold',{family:'Noto Sans JP',style:'Bold'});
for(const font of fonts.values())await figma.loadFontAsync(font);
for(let i=0;i<scenes.length;i++){
 const s=scenes[i],f=old[i];
 const geom=figma.createNodeFromSvg(s.svg);geom.name='配線・波形（編集可能）';
 createdNodeIds.push(geom.id,...geom.findAll(()=>true).map(n=>n.id));
 for(const child of [...f.children]){removedNodeIds.push(child.id,...('findAll'in child?child.findAll(()=>true).map(n=>n.id):[]));child.remove();}
 f.resize(s.width,s.height);f.fills=[{type:'SOLID',color:rgb('#FFFFFF')}];f.clipsContent=true;
 f.appendChild(geom);geom.x=0;geom.y=0;
 for(const l of s.labels){const t=figma.createText();t.fontName={family:'Noto Sans JP',style:l.bold?'Bold':'Regular'};t.fontSize=l.size;t.lineHeight={unit:'PERCENT',value:145};t.fills=[{type:'SOLID',color:rgb(l.color)}];t.characters=l.text;t.name=l.text.replace(/\n/g,' ').slice(0,70);f.appendChild(t);t.resize(l.width,l.size*1.45);t.textAutoResize='HEIGHT';t.x=l.x;t.y=l.y;createdNodeIds.push(t.id);}
 f.exportSettings=[{format:'SVG',svgOutlineText:false},{format:'PNG',constraint:{type:'SCALE',value:2}}];mutatedNodeIds.push(f.id);
 frames.push({id:f.id,name:f.name,width:f.width,height:f.height,labels:s.labels.length,outside:f.children.filter(n=>n.type==='TEXT'&&(n.x<0||n.y<0||n.x+n.width>f.width+.1||n.y+n.height>f.height+.1)).map(n=>({id:n.id,text:n.characters,y:n.y,h:n.height}))});
}
return {createdNodeIds,removedNodeIds,mutatedNodeIds,frames};

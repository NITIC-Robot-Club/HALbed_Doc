// Figma Plugin API script: execute with use_figma on file ZzagJOJ7DUCduUufzJPtj7.
// Only the two pending annotation positions are changed; figures are not replaced.
// Script result is verification evidence. A prepared script is not proof of cloud sync.
const expectedFileKey = 'ZzagJOJ7DUCduUufzJPtj7';
if (figma.fileKey && figma.fileKey !== expectedFileKey) {
  throw new Error('Open the HALbed Low Layer illustration file before running this script.');
}

const targets = [
  { frameId: '3:63', name: 'trapezoid-vs-scurve-motion' },
  { frameId: '3:325', name: 'trapezoid-vs-scurve-motion-mobile' },
];
const labelText = '矢印は理想インパルス（高さは任意）';
// Panel-local y=716 plus the containing panel's top inset of 24px.
const expectedOldY = 712;
const targetY = 740;
const planned = [];
const conflicts = [];

for (const target of targets) {
  const frame = await figma.getNodeByIdAsync(target.frameId);
  if (!frame || frame.type !== 'FRAME' || frame.name !== target.name) {
    conflicts.push({ frameId: target.frameId, reason: 'Missing or renamed target frame' });
    continue;
  }
  const matches = frame.findAll(node => node.type === 'TEXT' && node.characters === labelText);
  if (matches.length !== 1) {
    conflicts.push({ frameId: target.frameId, reason: 'Expected exactly one matching annotation', count: matches.length });
    continue;
  }
  const label = matches[0];
  if (label.parent.id !== frame.id || Math.abs(label.x - 94) > 0.01 ||
      (Math.abs(label.y - expectedOldY) > 0.01 && Math.abs(label.y - targetY) > 0.01)) {
    conflicts.push({ frameId: target.frameId, reason: 'Annotation was moved manually; leave it unchanged', labelId: label.id, x: label.x, y: label.y });
    continue;
  }
  planned.push({ frame, label, previousY: label.y });
}

// Validate both targets before making the first change.
if (conflicts.length) return { mutatedNodeIds: [], conflicts, complete: false };
const fonts = new Map();
for (const { label } of planned) {
  for (const segment of label.getStyledTextSegments(['fontName'])) {
    fonts.set(JSON.stringify(segment.fontName), segment.fontName);
  }
}
await Promise.all([...fonts.values()].map(font => figma.loadFontAsync(font)));

const mutatedNodeIds = [];
const verified = [];
for (const { frame, label, previousY } of planned) {
  if (Math.abs(label.y - targetY) > 0.01) {
    label.y = targetY;
    mutatedNodeIds.push(label.id);
  }
  verified.push({ frameId: frame.id, frameName: frame.name, labelId: label.id,
    previousY, y: label.y, targetY, changed: previousY !== label.y });
}
return { mutatedNodeIds, verified, conflicts: [], complete: verified.length === 2 && verified.every(item => item.y === targetY) };

export type SensorModeId = 'all-sensors'

export type SensorNodeKind = 'branch' | 'result'
export type SensorNodeTone =
  | 'root'
  | 'structure'
  | 'external'
  | 'motion'
  | 'speed'
  | 'acceleration'
  | 'angular'
  | 'rotation'
  | 'position'
  | 'distance'
  | 'distance-result'
  | 'detection'
  | 'detection-result'
  | 'circuit'
  | 'encoder'
  | 'encoder-relative'
  | 'encoder-absolute'
  | 'imu'
  | 'result'

export interface SensorNode {
  id: string
  label: string
  kind: SensorNodeKind
  tone?: SensorNodeTone
  hint?: string
  resultId?: string
  children?: string[]
}

export interface SensorResult {
  id: string
  label: string
  description: string
}

export interface SensorOverviewGroup {
  label: string
  description: string
  members: string[]
}

export interface SensorMode {
  id: SensorModeId
  label: string
  title: string
  description: string
  note?: string
  rootId: string
  nodes: Record<string, SensorNode>
  overviewGroups: SensorOverviewGroup[]
  overviewGraph?: SensorOverviewGraph
}

export interface SensorOverviewGraphNode {
  id: string
  label: string
  kind: SensorNodeKind
  tone?: SensorNodeTone
  selectNodeId?: string
  x: number
  y: number
  width?: number
  height?: number
  className?: string
  layout?: 'flow' | 'fixed'
}

export interface SensorOverviewGraphEdge {
  id: string
  source: string
  target: string
  route?: 'auto' | 'bottom'
}

export interface SensorOverviewGraphGroup {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  tone?: SensorNodeTone
  className?: string
}

export interface SensorOverviewGraph {
  width: number
  height: number
  nodes: SensorOverviewGraphNode[]
  edges: SensorOverviewGraphEdge[]
  groups?: SensorOverviewGraphGroup[]
}

export const SENSOR_RESULTS: Record<string, SensorResult> = {
  'acceleration-sensor': {
    id: 'acceleration-sensor',
    label: '加速度センサー',
    description: '直線方向の加速度や振動、姿勢変化の手掛かりを測定します。',
  },
  'gyro-sensor': {
    id: 'gyro-sensor',
    label: 'ジャイロセンサー',
    description: '物体が回転する速さ（角速度）を測定します。',
  },
  'rotary-encoder': {
    id: 'rotary-encoder',
    label: 'ロータリーエンコーダ',
    description: '軸の回転量や回転数を、パルスやコードとして取得します。',
  },
  incremental: {
    id: 'incremental',
    label: 'インクリメンタル方式',
    description: '基準位置からの相対角度を、パルス数などから求める方式です。',
  },
  absolute: {
    id: 'absolute',
    label: 'アブソリュート方式',
    description: '電源投入時から絶対角度を読み出せる方式です。',
  },
  'infrared-distance': {
    id: 'infrared-distance',
    label: '赤外線測距センサー',
    description: '赤外線の反射などを利用して対象までの距離を測定します。',
  },
  'ultrasonic-distance': {
    id: 'ultrasonic-distance',
    label: '超音波測距センサー',
    description: '超音波の往復時間などを利用して対象までの距離を測定します。',
  },
  'laser-distance': {
    id: 'laser-distance',
    label: 'レーザー測距センサー',
    description: 'レーザー光を利用して対象までの距離を測定します。',
  },
  'photo-reflector': {
    id: 'photo-reflector',
    label: 'フォトリフレクタ',
    description: '光の反射量を利用して、近くの物体や明暗の変化を検出します。',
  },
  'photo-interrupter': {
    id: 'photo-interrupter',
    label: 'フォトインタラプタ',
    description: '光路が遮られたことを利用して物体の通過や位置を検出します。',
  },
  'limit-switch': {
    id: 'limit-switch',
    label: 'リミットスイッチ',
    description: '機械的な接触を利用して、端点や所定位置への到達を検出します。',
  },
  'voltage-sensor': {
    id: 'voltage-sensor',
    label: '電圧センサー',
    description: '回路の電位差を測定し、電源や各部の状態を確認します。',
  },
  'current-sensor': {
    id: 'current-sensor',
    label: '電流センサー',
    description: '回路に流れる電流を測定し、消費状態や異常の手掛かりを得ます。',
  },
  lidar: {
    id: 'lidar',
    label: 'LiDAR センサー',
    description: '光の反射を利用して、周囲の距離や形状を測定します。',
  },
  imu: {
    id: 'imu',
    label: 'IMU',
    description: '加速度や角速度など、複数の慣性情報をまとめて取得します。',
  },
  'color-sensor': {
    id: 'color-sensor',
    label: 'カラーセンサー',
    description: '反射光などから、対象の色や色の違いを検出します。',
  },
}

const chart1Nodes: Record<string, SensorNode> = {
  'chart1-robot': {
    id: 'chart1-robot',
    label: 'ロボット',
    kind: 'branch',
    hint: '何を知りたいかを選択してください。',
    children: ['chart1-internal', 'chart1-external'],
  },
  'chart1-internal': {
    id: 'chart1-internal',
    label: '内部',
    kind: 'branch',
    hint: 'ロボット内部の動きや位置を測ります。',
    children: ['chart1-speed', 'chart1-position'],
  },
  'chart1-external': {
    id: 'chart1-external',
    label: '外部',
    kind: 'branch',
    hint: '外部の候補は、外部の枝から対象を基準に選べます。',
  },
  'chart1-speed': {
    id: 'chart1-speed',
    label: '速度',
    kind: 'branch',
    hint: '直線運動・回転運動の速さを分けて考えます。',
    children: ['chart1-acceleration', 'chart1-angular-velocity', 'chart1-rotation-speed'],
  },
  'chart1-acceleration': {
    id: 'chart1-acceleration',
    label: '加速度',
    kind: 'branch',
    children: ['chart1-acceleration-sensor'],
  },
  'chart1-acceleration-sensor': {
    id: 'chart1-acceleration-sensor',
    label: '加速度センサー',
    kind: 'result',
    resultId: 'acceleration-sensor',
  },
  'chart1-angular-velocity': {
    id: 'chart1-angular-velocity',
    label: '角速度',
    kind: 'branch',
    hint: '回転の速さ（角速度）を測ります。',
    children: ['chart1-gyro-sensor'],
  },
  'chart1-gyro-sensor': {
    id: 'chart1-gyro-sensor',
    label: 'ジャイロセンサー',
    kind: 'result',
    resultId: 'gyro-sensor',
  },
  'chart1-rotation-speed': {
    id: 'chart1-rotation-speed',
    label: '回転数',
    kind: 'branch',
    children: ['chart1-rotary-encoder'],
  },
  'chart1-rotary-encoder': {
    id: 'chart1-rotary-encoder',
    label: 'ロータリーエンコーダ',
    kind: 'result',
    resultId: 'rotary-encoder',
  },
  'chart1-position': {
    id: 'chart1-position',
    label: '位置',
    kind: 'branch',
    hint: '角度、距離、物体の有無から選びます。',
    children: ['chart1-angle', 'chart1-distance', 'chart1-object-detection'],
  },
  'chart1-angle': {
    id: 'chart1-angle',
    label: '角度',
    kind: 'branch',
    children: ['chart1-relative-angle', 'chart1-absolute-angle'],
  },
  'chart1-relative-angle': {
    id: 'chart1-relative-angle',
    label: '相対角度',
    kind: 'branch',
    children: ['chart1-relative-rotary-encoder'],
  },
  'chart1-relative-rotary-encoder': {
    id: 'chart1-relative-rotary-encoder',
    label: 'ロータリーエンコーダ',
    kind: 'branch',
    tone: 'position',
    hint: '相対角度は、ロータリーエンコーダの回転量から求めます。',
    children: ['chart1-incremental'],
  },
  'chart1-incremental': {
    id: 'chart1-incremental',
    label: 'インクリメンタル方式',
    kind: 'branch',
    tone: 'position',
    hint: '電源投入後に原点を決めてから、基準位置からの相対角度を追跡します。',
    children: ['chart1-homing'],
  },
  'chart1-homing': {
    id: 'chart1-homing',
    label: '原点どり',
    kind: 'branch',
    tone: 'detection',
    hint: '原点に到達したことを検出するセンサーを選びます。',
    children: ['chart1-limit-switch', 'chart1-photo-interrupter'],
  },
  'chart1-absolute-angle': {
    id: 'chart1-absolute-angle',
    label: '絶対角度',
    kind: 'branch',
    children: ['chart1-absolute-rotary-encoder'],
  },
  'chart1-absolute-rotary-encoder': {
    id: 'chart1-absolute-rotary-encoder',
    label: 'ロータリーエンコーダ',
    kind: 'branch',
    tone: 'position',
    hint: '絶対角度は、ロータリーエンコーダから電源投入直後でも読み取れます。',
    children: ['chart1-absolute'],
  },
  'chart1-absolute': {
    id: 'chart1-absolute',
    label: 'アブソリュート方式',
    kind: 'result',
    resultId: 'absolute',
  },
  'chart1-distance': {
    id: 'chart1-distance',
    label: '距離',
    kind: 'branch',
    children: ['chart1-infrared-distance', 'chart1-ultrasonic-distance', 'chart1-laser-distance'],
  },
  'chart1-infrared-distance': {
    id: 'chart1-infrared-distance',
    label: '赤外線測距センサー',
    kind: 'result',
    resultId: 'infrared-distance',
  },
  'chart1-ultrasonic-distance': {
    id: 'chart1-ultrasonic-distance',
    label: '超音波測距センサー',
    kind: 'result',
    resultId: 'ultrasonic-distance',
  },
  'chart1-laser-distance': {
    id: 'chart1-laser-distance',
    label: 'レーザー測距センサー',
    kind: 'result',
    resultId: 'laser-distance',
  },
  'chart1-object-detection': {
    id: 'chart1-object-detection',
    label: '物体検出',
    kind: 'branch',
    children: ['chart1-photo-reflector', 'chart1-photo-interrupter', 'chart1-limit-switch'],
  },
  'chart1-photo-reflector': {
    id: 'chart1-photo-reflector',
    label: 'フォトリフレクタ',
    kind: 'result',
    resultId: 'photo-reflector',
  },
  'chart1-photo-interrupter': {
    id: 'chart1-photo-interrupter',
    label: 'フォトインタラプタ',
    kind: 'result',
    resultId: 'photo-interrupter',
  },
  'chart1-limit-switch': {
    id: 'chart1-limit-switch',
    label: 'リミットスイッチ',
    kind: 'result',
    resultId: 'limit-switch',
  },
}

const chart2Nodes: Record<string, SensorNode> = {
  'chart2-robot': {
    id: 'chart2-robot',
    label: 'ロボット',
    kind: 'branch',
    hint: '内部の回路か、外部の対象を選択してください。',
    children: ['chart2-internal', 'chart2-external'],
  },
  'chart2-internal': {
    id: 'chart2-internal',
    label: '内部',
    kind: 'branch',
    children: ['chart2-circuit'],
  },
  'chart2-circuit': {
    id: 'chart2-circuit',
    label: '回路',
    kind: 'branch',
    children: ['chart2-power'],
  },
  'chart2-power': {
    id: 'chart2-power',
    label: '電源',
    kind: 'branch',
    children: ['chart2-voltage-sensor', 'chart2-current-sensor'],
  },
  'chart2-voltage-sensor': {
    id: 'chart2-voltage-sensor',
    label: '電圧センサー',
    kind: 'result',
    resultId: 'voltage-sensor',
  },
  'chart2-current-sensor': {
    id: 'chart2-current-sensor',
    label: '電流センサー',
    kind: 'result',
    resultId: 'current-sensor',
  },
  'chart2-external': {
    id: 'chart2-external',
    label: '外部',
    kind: 'branch',
    hint: 'フィールドや周囲に対するロボットの位置を測ります。',
    children: ['chart2-distance-position', 'chart2-color'],
  },
  'chart2-distance-position': {
    id: 'chart2-distance-position',
    label: '距離/位置',
    kind: 'branch',
    children: [
      'chart2-rotary-encoder',
      'chart2-infrared-distance',
      'chart2-ultrasonic-distance',
      'chart2-laser-distance',
      'chart2-lidar',
      'chart2-imu',
    ],
  },
  'chart2-rotary-encoder': {
    id: 'chart2-rotary-encoder',
    label: 'ロータリーエンコーダ',
    kind: 'result',
    resultId: 'rotary-encoder',
  },
  'chart2-infrared-distance': {
    id: 'chart2-infrared-distance',
    label: '赤外線測距センサー',
    kind: 'result',
    resultId: 'infrared-distance',
  },
  'chart2-ultrasonic-distance': {
    id: 'chart2-ultrasonic-distance',
    label: '超音波測距センサー',
    kind: 'result',
    resultId: 'ultrasonic-distance',
  },
  'chart2-laser-distance': {
    id: 'chart2-laser-distance',
    label: 'レーザー測距センサー',
    kind: 'result',
    resultId: 'laser-distance',
  },
  'chart2-lidar': {
    id: 'chart2-lidar',
    label: 'LiDAR センサー',
    kind: 'result',
    resultId: 'lidar',
  },
  'chart2-imu': {
    id: 'chart2-imu',
    label: 'IMU',
    kind: 'result',
    resultId: 'imu',
  },
  'chart2-color': {
    id: 'chart2-color',
    label: '色',
    kind: 'branch',
    children: ['chart2-color-sensor'],
  },
  'chart2-color-sensor': {
    id: 'chart2-color-sensor',
    label: 'カラーセンサー',
    kind: 'result',
    resultId: 'color-sensor',
  },
}

function copySubtree(source: Record<string, SensorNode>, rootId: string, targetRootId: string): Record<string, SensorNode> {
  const sourceIds: string[] = []
  const visit = (nodeId: string): void => {
    if (sourceIds.includes(nodeId)) return
    sourceIds.push(nodeId)
    for (const childId of source[nodeId]?.children ?? []) visit(childId)
  }
  visit(rootId)

  const idMap = new Map(
    sourceIds.map((sourceId) => [
      sourceId,
      sourceId === rootId ? targetRootId : `${targetRootId}-${sourceId.replace(/^chart[12]-/, '')}`,
    ]),
  )

  return Object.fromEntries(sourceIds.map((sourceId) => {
    const sourceNode = source[sourceId]
    return [idMap.get(sourceId), {
      ...sourceNode,
      id: idMap.get(sourceId) ?? sourceNode.id,
      children: sourceNode.children?.map((childId) => idMap.get(childId) ?? childId),
    }]
  })) as Record<string, SensorNode>
}

const unifiedInternalNodes = copySubtree(chart1Nodes, 'chart1-internal', 'unified-internal')
const unifiedExternalNodes = copySubtree(chart2Nodes, 'chart2-external', 'unified-external')
const unifiedCircuitNodes = copySubtree(chart2Nodes, 'chart2-circuit', 'unified-circuit')

const unifiedNodes: Record<string, SensorNode> = {
  'unified-robot': {
    id: 'unified-robot',
    label: 'ロボット',
    kind: 'branch',
    tone: 'root',
    hint: '内部・外部・回路から知りたい内容を選択してください。',
    children: ['unified-internal', 'unified-external', 'unified-circuit'],
  },
  ...unifiedInternalNodes,
  ...unifiedExternalNodes,
  ...unifiedCircuitNodes,
}

function createOverviewNode(
  id: string,
  x: number,
  y: number,
  options: Partial<Pick<SensorOverviewGraphNode, 'label' | 'kind' | 'tone' | 'selectNodeId' | 'width' | 'height' | 'className' | 'layout'>> = {},
): SensorOverviewGraphNode {
  const sourceId = options.selectNodeId ?? id
  const source = unifiedNodes[sourceId]
  return {
    id,
    label: options.label ?? source?.label ?? id,
    kind: options.kind ?? source?.kind ?? 'branch',
    tone: options.tone ?? source?.tone,
    selectNodeId: options.selectNodeId ?? (source ? sourceId : undefined),
    x,
    y,
    width: options.width,
    height: options.height,
    className: options.className,
    layout: options.layout ?? 'flow',
  }
}

const overviewEdgePairs: Array<[string, string]> = [
  ['overview-robot', 'overview-internal'],
  ['overview-robot', 'overview-external'],
  ['overview-robot', 'overview-circuit'],
  ['overview-internal', 'overview-speed'],
  ['overview-internal', 'overview-position'],
  ['overview-speed', 'overview-acceleration'],
  ['overview-speed', 'overview-angular-velocity'],
  ['overview-speed', 'overview-rotation-speed'],
  ['overview-acceleration', 'overview-acceleration-sensor'],
  ['overview-angular-velocity', 'overview-gyro-sensor'],
  ['overview-rotation-speed', 'overview-encoder-title'],
  ['overview-position', 'overview-angle'],
  ['overview-position', 'overview-distance'],
  ['overview-position', 'overview-object-detection'],
  ['overview-angle', 'overview-relative'],
  ['overview-angle', 'overview-absolute'],
  ['overview-relative', 'overview-incremental'],
  ['overview-absolute', 'overview-absolute-method'],
  ['overview-distance', 'overview-infrared-distance'],
  ['overview-distance', 'overview-ultrasonic-distance'],
  ['overview-distance', 'overview-laser-distance'],
  ['overview-object-detection', 'overview-photo-reflector'],
  ['overview-object-detection', 'overview-photo-interrupter'],
  ['overview-object-detection', 'overview-limit-switch'],
  ['overview-photo-interrupter', 'overview-homing'],
  ['overview-limit-switch', 'overview-homing'],
  ['overview-external', 'overview-external-distance'],
  ['overview-external-distance', 'overview-external-rotary-encoder'],
  ['overview-external-distance', 'overview-external-infrared'],
  ['overview-external-distance', 'overview-external-ultrasonic'],
  ['overview-external-distance', 'overview-external-laser'],
  ['overview-external-distance', 'overview-external-lidar'],
  ['overview-external-distance', 'overview-external-imu'],
  ['overview-external', 'overview-external-color'],
  ['overview-external-color', 'overview-color-sensor'],
  ['overview-circuit', 'overview-power'],
  ['overview-power', 'overview-voltage'],
  ['overview-power', 'overview-current'],
]

function layoutOverviewGraph(graph: SensorOverviewGraph): SensorOverviewGraph {
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]))
  const fixedNodeIds = new Set(graph.nodes.filter((node) => node.layout === 'fixed').map((node) => node.id))
  const primaryParent = new Map<string, string>()

  // A shared result belongs visually to the last branch that reaches it.
  // The other edge is still drawn, but it does not reserve a second layout slot.
  graph.edges.forEach((edge) => primaryParent.set(edge.target, edge.source))

  const children = new Map<string, string[]>()
  graph.edges.forEach((edge) => {
    // Fixed nodes are visual destinations inside a composed panel. They must
    // not consume a slot in the flow layout of their source branch.
    if (fixedNodeIds.has(edge.target)) return
    if (primaryParent.get(edge.target) !== edge.source) return
    const branch = children.get(edge.source) ?? []
    branch.push(edge.target)
    children.set(edge.source, branch)
  })

  const verticalGap = 42
  let cursor = 44
  const placed = new Set<string>()

  const placeSubtree = (nodeId: string): number => {
    const node = nodeMap.get(nodeId)
    if (!node) return 0
    if (placed.has(nodeId)) return node.y + (node.height ?? 52) / 2

    const childIds = (children.get(nodeId) ?? []).filter((childId) => nodeMap.has(childId))
    if (!childIds.length) {
      node.y = cursor
      cursor += (node.height ?? 52) + verticalGap
      placed.add(nodeId)
      return node.y + (node.height ?? 52) / 2
    }

    const childCenters = childIds.map(placeSubtree)
    const center = (Math.min(...childCenters) + Math.max(...childCenters)) / 2
    node.y = center - (node.height ?? 52) / 2
    placed.add(nodeId)
    return center
  }

  const roots = graph.nodes.filter((node) => node.layout !== 'fixed' && !primaryParent.has(node.id))
  roots.forEach((node) => placeSubtree(node.id))

  const alignCenter = (sourceId: string, targetId: string): void => {
    const source = nodeMap.get(sourceId)
    const target = nodeMap.get(targetId)
    if (!source || !target) return
    target.y = source.y + ((source.height ?? 52) - (target.height ?? 52)) / 2
  }

  // Keep the encoder panel aligned with the flow nodes that feed it.
  alignCenter('overview-rotation-speed', 'overview-encoder-title')
  alignCenter('overview-relative', 'overview-incremental')
  alignCenter('overview-absolute', 'overview-absolute-method')

  const combination = nodeMap.get('overview-incremental-combination')
  const incremental = nodeMap.get('overview-incremental')
  const absoluteMethod = nodeMap.get('overview-absolute-method')
  if (combination && incremental && absoluteMethod) {
    combination.y = Math.max(
      incremental.y + (incremental.height ?? 52),
      absoluteMethod.y + (absoluteMethod.height ?? 52),
    ) + 56
  }

  // The combination is a vertical mini-layout: truncated incremental label,
  // plus sign, then the homing node.
  const plus = nodeMap.get('overview-plus')
  const homing = nodeMap.get('overview-homing')
  if (combination && plus && homing) {
    plus.y = combination.y + (combination.height ?? 52) + 12
    homing.y = plus.y + (plus.height ?? 48) + 12
  }

  const encoderIds = new Set([
    'overview-encoder-title',
    'overview-incremental',
    'overview-absolute-method',
    'overview-incremental-combination',
    'overview-plus',
    'overview-homing',
  ])
  const encoderNodes = graph.nodes.filter((node) => encoderIds.has(node.id))
  const encoderGroup = graph.groups?.find((group) => group.id === 'overview-encoder-group')
  if (encoderGroup && encoderNodes.length) {
    const top = Math.min(...encoderNodes.map((node) => node.y))
    const bottom = Math.max(...encoderNodes.map((node) => node.y + (node.height ?? 52)))
    encoderGroup.y = top - 34
    encoderGroup.height = bottom - encoderGroup.y + 26
  }

  const combinationGroup = graph.groups?.find((group) => group.id === 'overview-encoder-combination-group')
  if (combinationGroup && combination && plus && homing) {
    const left = Math.min(combination.x, plus.x, homing.x)
    const right = Math.max(
      combination.x + (combination.width ?? 150),
      plus.x + (plus.width ?? 150),
      homing.x + (homing.width ?? 150),
    )
    const top = Math.min(combination.y, plus.y, homing.y)
    const bottom = Math.max(
      combination.y + (combination.height ?? 52),
      plus.y + (plus.height ?? 52),
      homing.y + (homing.height ?? 52),
    )
    combinationGroup.x = left - 18
    combinationGroup.y = top - 18
    combinationGroup.width = right - left + 36
    combinationGroup.height = bottom - top + 36
  }

  const bottom = Math.max(...graph.nodes.map((node) => node.y + (node.height ?? 52)))
  return { ...graph, height: Math.max(900, bottom + 44) }
}

const unifiedOverviewGraph = layoutOverviewGraph({
  width: 2140,
  height: 1660,
  groups: [
    {
      id: 'overview-encoder-group',
      label: '',
      x: 1470,
      width: 300,
      y: 120,
      height: 500,
      tone: 'encoder',
      className: 'is-panel',
    },
    {
      id: 'overview-encoder-combination-group',
      label: '',
      x: 1490,
      width: 260,
      y: 500,
      height: 210,
      tone: 'encoder',
      className: 'is-encoder-combination',
    },
  ],
  nodes: [
    createOverviewNode('overview-robot', 40, 570, { selectNodeId: 'unified-robot', width: 180 }),
    createOverviewNode('overview-internal', 300, 390, { selectNodeId: 'unified-internal' }),
    createOverviewNode('overview-external', 300, 910, { selectNodeId: 'unified-external', tone: 'external' }),
    createOverviewNode('overview-circuit', 300, 1110, { selectNodeId: 'unified-circuit', tone: 'circuit' }),

    createOverviewNode('overview-speed', 560, 200, { selectNodeId: 'unified-internal-speed' }),
    createOverviewNode('overview-position', 560, 700, { selectNodeId: 'unified-internal-position' }),
    createOverviewNode('overview-acceleration', 790, 90, { selectNodeId: 'unified-internal-acceleration' }),
    createOverviewNode('overview-angular-velocity', 790, 190, { selectNodeId: 'unified-internal-angular-velocity' }),
    createOverviewNode('overview-rotation-speed', 790, 290, { selectNodeId: 'unified-internal-rotation-speed' }),
    createOverviewNode('overview-acceleration-sensor', 1030, 90, { selectNodeId: 'unified-internal-acceleration-sensor', width: 190 }),
    createOverviewNode('overview-gyro-sensor', 1030, 190, { selectNodeId: 'unified-internal-gyro-sensor', width: 190 }),
    createOverviewNode('overview-angle', 790, 500, { selectNodeId: 'unified-internal-angle' }),
    createOverviewNode('overview-distance', 790, 760, { selectNodeId: 'unified-internal-distance' }),
    createOverviewNode('overview-object-detection', 790, 1150, { selectNodeId: 'unified-internal-object-detection', width: 150 }),
    createOverviewNode('overview-relative', 1060, 430, { label: '相対', selectNodeId: 'unified-internal-relative-angle', tone: 'encoder-relative' }),
    createOverviewNode('overview-absolute', 1060, 540, { label: '絶対', selectNodeId: 'unified-internal-absolute-angle', tone: 'encoder-absolute' }),
    createOverviewNode('overview-infrared-distance', 1030, 700, { selectNodeId: 'unified-internal-infrared-distance', width: 220 }),
    createOverviewNode('overview-ultrasonic-distance', 1030, 800, { selectNodeId: 'unified-internal-ultrasonic-distance', width: 220 }),
    createOverviewNode('overview-laser-distance', 1030, 900, { selectNodeId: 'unified-internal-laser-distance', width: 220 }),
    createOverviewNode('overview-photo-reflector', 1030, 1300, { selectNodeId: 'unified-internal-photo-reflector', width: 190 }),
    createOverviewNode('overview-photo-interrupter', 1030, 1400, { selectNodeId: 'unified-internal-photo-interrupter', width: 190 }),
    createOverviewNode('overview-limit-switch', 1030, 1500, { selectNodeId: 'unified-internal-limit-switch', width: 190 }),
    createOverviewNode('overview-homing', 1510, 445, { label: '原点どり', selectNodeId: 'unified-internal-homing', width: 220, height: 52, tone: 'detection', className: 'is-combination is-homing is-encoder-method', layout: 'fixed' }),

    createOverviewNode('overview-encoder-title', 1510, 120, { label: 'ロータリーエンコーダー', selectNodeId: 'unified-internal-rotary-encoder', width: 220, height: 52, tone: 'encoder', className: 'is-panel-title', layout: 'fixed' }),
    createOverviewNode('overview-incremental', 1510, 230, { label: 'インクリメンタル方式', selectNodeId: 'unified-internal-incremental', width: 220, height: 52, tone: 'encoder-relative', className: 'is-encoder-method', layout: 'fixed' }),
    createOverviewNode('overview-absolute-method', 1510, 330, { label: 'アブソリュート方式', selectNodeId: 'unified-internal-absolute', width: 220, height: 52, tone: 'encoder-absolute', className: 'is-encoder-method', layout: 'fixed' }),
    // This repeated label explains the composition without adding a second flow step.
    createOverviewNode('overview-incremental-combination', 1510, 445, { label: 'インクリメンタル方…', selectNodeId: 'unified-internal-incremental', width: 220, height: 52, tone: 'encoder-relative', className: 'is-combination is-encoder-method', layout: 'fixed' }),
    createOverviewNode('overview-plus', 1600, 445, { label: '＋', kind: 'branch', selectNodeId: undefined, width: 40, height: 40, className: 'is-plus', layout: 'fixed' }),

    createOverviewNode('overview-external-distance', 560, 900, { selectNodeId: 'unified-external-distance-position', width: 170 }),
    createOverviewNode('overview-external-color', 560, 1080, { selectNodeId: 'unified-external-color' }),
    createOverviewNode('overview-external-rotary-encoder', 790, 820, { selectNodeId: 'unified-external-rotary-encoder', width: 190 }),
    createOverviewNode('overview-external-infrared', 790, 920, { selectNodeId: 'unified-external-infrared-distance', width: 190 }),
    createOverviewNode('overview-external-ultrasonic', 790, 1020, { selectNodeId: 'unified-external-ultrasonic-distance', width: 190 }),
    createOverviewNode('overview-external-laser', 1030, 1000, { selectNodeId: 'unified-external-laser-distance', width: 190 }),
    createOverviewNode('overview-external-lidar', 1030, 1100, { selectNodeId: 'unified-external-lidar', width: 190 }),
    createOverviewNode('overview-external-imu', 1030, 1200, { selectNodeId: 'unified-external-imu', width: 190 }),
    createOverviewNode('overview-color-sensor', 790, 1250, { selectNodeId: 'unified-external-color-sensor', width: 190 }),
    createOverviewNode('overview-power', 560, 1220, { selectNodeId: 'unified-circuit-power' }),
    createOverviewNode('overview-voltage', 790, 1360, { selectNodeId: 'unified-circuit-voltage-sensor', width: 190 }),
    createOverviewNode('overview-current', 790, 1460, { selectNodeId: 'unified-circuit-current-sensor', width: 190 }),
  ],
  edges: overviewEdgePairs.map(([source, target], index) => ({
    id: `overview-edge-${index}`,
    source,
    target,
    route: target === 'overview-homing' ? 'bottom' : 'auto',
  })),
})

export const SENSOR_MODES: SensorMode[] = [
  {
    id: 'all-sensors',
    label: 'センサー選定',
    title: '内部・外部・回路から選ぶ',
    description: 'ロボットの内部、外部、回路のどこを測るかからたどります。',
    rootId: 'unified-robot',
    nodes: unifiedNodes,
    overviewGraph: unifiedOverviewGraph,
    overviewGroups: [
      {
        label: 'IMU',
        description: '加速度センサーとジャイロセンサーを組み合わせる構成',
        members: ['unified-external-imu'],
      },
      {
        label: '計測輪',
        description: '回転を測る構成の例',
        members: ['unified-external-rotary-encoder'],
      },
    ],
  },
]

export function getSensorMode(id: SensorModeId): SensorMode {
  return SENSOR_MODES.find((mode) => mode.id === id) ?? SENSOR_MODES[0]
}

export function getSensorNode(mode: SensorMode, id: string): SensorNode {
  return mode.nodes[id] ?? mode.nodes[mode.rootId]
}

export function getSensorResult(node: SensorNode): SensorResult | undefined {
  return node.resultId ? SENSOR_RESULTS[node.resultId] : undefined
}

export function getSensorNodeTone(node: SensorNode): SensorNodeTone {
  if (node.tone) return node.tone

  const id = node.id
  if (id.includes('relative') || id.includes('incremental')) return 'encoder-relative'
  if (id.includes('absolute')) return 'encoder-absolute'
  if (id.includes('rotary-encoder')) return 'encoder'
  if (id.includes('imu')) return 'imu'
  if (id.includes('acceleration')) return 'acceleration'
  if (id.includes('angular')) return 'angular'
  if (id.includes('rotation')) return 'rotation'
  if (id.includes('speed')) return 'speed'
  if (node.kind === 'result' && (id.includes('distance') || id.includes('lidar'))) return 'distance-result'
  if (node.kind === 'result' && (id.includes('object') || id.includes('photo') || id.includes('limit'))) return 'detection-result'
  if (id.includes('external')) return 'external'
  if (id.includes('robot')) return 'root'
  if (id.includes('distance') || id.includes('lidar')) return 'distance'
  if (id.includes('object') || id.includes('photo') || id.includes('limit')) return 'detection'
  if (id.includes('color')) return 'position'
  if (id.includes('circuit') || id.includes('power') || id.includes('voltage') || id.includes('current')) return 'circuit'
  if (id.includes('angle') || id.includes('position')) return 'position'
  if (id.includes('internal') || id.includes('external')) return 'structure'
  return node.kind === 'result' ? 'result' : 'structure'
}

export function getSensorOverviewGraph(mode: SensorMode): SensorOverviewGraph {
  if (mode.overviewGraph) return mode.overviewGraph

  return {
    width: 1200,
    height: 800,
    nodes: [],
    edges: [],
  }
}

export function findSensorPath(mode: SensorMode, targetId: string): string[] | undefined {
  const visit = (nodeId: string, path: string[]): string[] | undefined => {
    if (nodeId === targetId) return path

    const node = getSensorNode(mode, nodeId)
    for (const childId of node.children ?? []) {
      const result = visit(childId, [...path, childId])
      if (result) return result
    }

    return undefined
  }

  return visit(mode.rootId, [mode.rootId])
}

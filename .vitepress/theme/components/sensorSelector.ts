export type SensorModeId = 'all-sensors'

export type SensorNodeKind = 'branch' | 'result'
export type SensorNodeTone = 'root' | 'structure' | 'motion' | 'position' | 'distance' | 'detection' | 'circuit' | 'result'

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

export const SENSOR_MODES: SensorMode[] = [
  {
    id: 'all-sensors',
    label: 'センサー選定',
    title: '内部・外部・回路から選ぶ',
    description: 'ロボットの内部、外部、回路のどこを測るかからたどります。',
    rootId: 'unified-robot',
    nodes: unifiedNodes,
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
  if (id.includes('robot')) return 'root'
  if (id.includes('speed') || id.includes('acceleration') || id.includes('angular') || id.includes('rotation')) return 'motion'
  if (id.includes('distance') || id.includes('lidar')) return 'distance'
  if (id.includes('object') || id.includes('photo') || id.includes('limit')) return 'detection'
  if (id.includes('color')) return 'position'
  if (id.includes('circuit') || id.includes('power') || id.includes('voltage') || id.includes('current')) return 'circuit'
  if (id.includes('angle') || id.includes('position')) return 'position'
  if (id.includes('internal') || id.includes('external')) return 'structure'
  return node.kind === 'result' ? 'result' : 'structure'
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

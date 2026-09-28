<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  getSensorNode,
  getSensorNodeTone,
  getSensorOverviewGraph,
  getSensorResult,
  type SensorMode,
  type SensorOverviewGraphNode,
} from './sensorSelector'

const props = defineProps<{
  mode: SensorMode
  selectedPath: string[]
  zoom?: number
}>()

const emit = defineEmits<{
  select: [nodeId: string]
}>()

type ConnectorPath = {
  d: string
  arrow: boolean
}

const graph = computed(() => getSensorOverviewGraph(props.mode))
const rootElement = ref<HTMLElement | null>(null)
const connectorSize = ref({ width: 1, height: 1 })
const connectorPaths = ref<ConnectorPath[]>([])
let resizeObserver: ResizeObserver | null = null
let measurementTimer: number | undefined

function sourceNode(graphNode: SensorOverviewGraphNode) {
  return graphNode.selectNodeId ? getSensorNode(props.mode, graphNode.selectNodeId) : undefined
}

function toneClass(graphNode: SensorOverviewGraphNode): string {
  const source = sourceNode(graphNode)
  return `is-tone-${graphNode.tone ?? (source ? getSensorNodeTone(source) : 'structure')}`
}

function description(graphNode: SensorOverviewGraphNode): string | undefined {
  const source = sourceNode(graphNode)
  return source?.hint ?? (source ? getSensorResult(source)?.description : undefined)
}

function isCurrent(graphNode: SensorOverviewGraphNode): boolean {
  return Boolean(graphNode.selectNodeId && props.selectedPath.at(-1) === graphNode.selectNodeId)
}

function isSelected(graphNode: SensorOverviewGraphNode): boolean {
  return Boolean(graphNode.selectNodeId && props.selectedPath.includes(graphNode.selectNodeId))
}

function selectNode(graphNode: SensorOverviewGraphNode): void {
  if (graphNode.selectNodeId) emit('select', graphNode.selectNodeId)
}

function roundedOrthogonalPath(startX: number, startY: number, endX: number, endY: number, elbowX: number): string {
  if (Math.abs(endY - startY) < 2) return `M ${startX} ${startY} H ${endX}`

  const direction = endY > startY ? 1 : -1
  const radius = Math.min(10, Math.abs(endY - startY) / 2, Math.abs(elbowX - startX) / 2, Math.abs(endX - elbowX) / 2)
  const firstTurn = startY + direction * radius
  const secondTurn = endY - direction * radius

  return `M ${startX} ${startY} H ${elbowX - radius} Q ${elbowX} ${startY} ${elbowX} ${firstTurn} V ${secondTurn} Q ${elbowX} ${endY} ${elbowX + radius} ${endY} H ${endX}`
}

function measureConnectors(): void {
  const root = rootElement.value
  if (!root) return

  const rootRect = root.getBoundingClientRect()
  const scaleX = root.clientWidth > 0 ? rootRect.width / root.clientWidth : 1
  const scaleY = root.clientHeight > 0 ? rootRect.height / root.clientHeight : 1

  const groupedEdges = new Map<string, {
    source: { left: number; top: number; width: number; height: number }
    route: 'auto' | 'bottom'
    targets: Array<{ left: number; top: number; width: number; height: number }>
  }>()

  graph.value.edges.forEach((edge) => {
    const source = root.querySelector<HTMLElement>(`[data-overview-node-id="${edge.source}"]`)
    const target = root.querySelector<HTMLElement>(`[data-overview-node-id="${edge.target}"]`)
    if (!source || !target) return

    const sourceRect = source.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const toLayoutRect = (rect: DOMRect) => ({
      left: (rect.left - rootRect.left) / scaleX,
      top: (rect.top - rootRect.top) / scaleY,
      width: rect.width / scaleX,
      height: rect.height / scaleY,
    })
    const sourceLayoutRect = toLayoutRect(sourceRect)
    const targetLayoutRect = toLayoutRect(targetRect)
    const route = edge.route ?? 'auto'
    const groupKey = `${edge.source}:${route}`
    const existing = groupedEdges.get(groupKey)
    if (existing) {
      existing.targets.push(targetLayoutRect)
    } else {
      groupedEdges.set(groupKey, { source: sourceLayoutRect, route, targets: [targetLayoutRect] })
    }
  })

  connectorPaths.value = [...groupedEdges.values()].flatMap(({ source, route, targets }) => {
    const sourceRight = source.left + source.width
    const sourceCenterX = source.left + source.width / 2
    const sourceCenterY = source.top + source.height / 2

    if (route === 'bottom') {
      const targetBottoms = targets.map((target) => target.top + target.height)
      const laneY = Math.max(source.top + source.height + 32, ...targetBottoms.map((bottom) => bottom + 32))
      const trunkX = sourceRight + Math.max(18, Math.min(70, (Math.min(...targets.map((target) => target.left)) - sourceRight) / 2))
      const branchPaths: ConnectorPath[] = [
        { d: `M ${sourceRight} ${sourceCenterY} H ${trunkX} V ${laneY}`, arrow: false },
      ]
      targets.forEach((target) => {
        const targetCenterX = target.left + target.width / 2
        branchPaths.push({ d: `M ${trunkX} ${laneY} H ${targetCenterX} V ${target.top + target.height}`, arrow: true })
      })
      return branchPaths
    }

    const allTargetsToRight = targets.every((target) => target.left > sourceRight + 12)

    if (allTargetsToRight) {
      const firstTarget = targets[0]
      if (targets.length === 1) {
        const targetCenterY = firstTarget.top + firstTarget.height / 2
        const elbowX = sourceRight + Math.max(18, Math.min(70, (firstTarget.left - sourceRight) / 2))
        return [{
          d: roundedOrthogonalPath(sourceRight, sourceCenterY, firstTarget.left, targetCenterY, elbowX),
          arrow: true,
        }]
      }

      const targetYs = targets.map((target) => target.top + target.height / 2)
      const trunkX = sourceRight + Math.max(18, Math.min(70, (Math.min(...targets.map((target) => target.left)) - sourceRight) / 2))
      const branchPaths: ConnectorPath[] = [
        { d: `M ${sourceRight} ${sourceCenterY} H ${trunkX}`, arrow: false },
      ]
      const minY = Math.min(sourceCenterY, ...targetYs)
      const maxY = Math.max(sourceCenterY, ...targetYs)
      if (maxY - minY > 2) branchPaths.push({ d: `M ${trunkX} ${minY} V ${maxY}`, arrow: false })
      targets.forEach((target, index) => {
        branchPaths.push({ d: `M ${trunkX} ${targetYs[index]} H ${target.left}`, arrow: true })
      })
      return branchPaths
    }

    return targets.map((target) => {
      const startY = source.top + source.height
      const endY = target.top
      const targetCenterX = target.left + target.width / 2
      const x = Math.max(sourceCenterX, targetCenterX)
      return { d: `M ${x} ${startY} V ${endY}`, arrow: true }
    })
  })

  connectorSize.value = { width: root.clientWidth, height: root.clientHeight }
}

function scheduleMeasurement(): void {
  nextTick(() => {
    measureConnectors()
    if (measurementTimer) window.clearTimeout(measurementTimer)
    measurementTimer = window.setTimeout(measureConnectors, 90)
  })
}

watch(() => [props.zoom, props.selectedPath], scheduleMeasurement, { deep: true })

onMounted(() => {
  scheduleMeasurement()
  resizeObserver = new ResizeObserver(scheduleMeasurement)
  if (rootElement.value) resizeObserver.observe(rootElement.value)
})

onBeforeUnmount(() => {
  if (measurementTimer) window.clearTimeout(measurementTimer)
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    ref="rootElement"
    class="sensor-overview-graph"
    :style="{ width: `${graph.width}px`, height: `${graph.height}px` }"
    aria-label="センサー選定ツリー"
  >
    <div
      v-for="group in graph.groups ?? []"
      :key="group.id"
      class="sensor-overview-graph__group"
      :class="[`is-tone-${group.tone ?? 'structure'}`, group.className]"
      :style="{ left: `${group.x}px`, top: `${group.y}px`, width: `${group.width}px`, height: `${group.height}px` }"
    >
      <span>{{ group.label }}</span>
    </div>

    <svg
      v-if="connectorPaths.length"
      class="sensor-overview-graph__connectors"
      :viewBox="`0 0 ${connectorSize.width} ${connectorSize.height}`"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <marker id="sensor-overview-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 7 3.5 L 0 7 Z" />
        </marker>
      </defs>
      <path v-for="(path, index) in connectorPaths" :key="index" :d="path.d" :marker-end="path.arrow ? 'url(#sensor-overview-arrow)' : undefined" />
    </svg>

    <template v-for="graphNode in graph.nodes" :key="graphNode.id">
      <button
        v-if="graphNode.selectNodeId"
        type="button"
        class="sensor-overview-graph__node"
        :class="[toneClass(graphNode), graphNode.className, { 'is-selected': isSelected(graphNode), 'is-current': isCurrent(graphNode) }]"
        :style="{ left: `${graphNode.x}px`, top: `${graphNode.y}px`, width: `${graphNode.width ?? 150}px`, height: `${graphNode.height ?? 52}px` }"
        :data-overview-node-id="graphNode.id"
        :title="description(graphNode)"
        :aria-current="isCurrent(graphNode) ? 'step' : undefined"
        @click="selectNode(graphNode)"
      >
        {{ graphNode.label }}
      </button>
      <span
        v-else
        class="sensor-overview-graph__node sensor-overview-graph__label-node"
        :class="graphNode.className"
        :style="{ left: `${graphNode.x}px`, top: `${graphNode.y}px`, width: `${graphNode.width ?? 150}px`, height: `${graphNode.height ?? 52}px` }"
        :data-overview-node-id="graphNode.id"
        aria-hidden="true"
      >
        {{ graphNode.label }}
      </span>
    </template>
  </div>
</template>

<style scoped>
.sensor-overview-graph {
  position: relative;
  flex: 0 0 auto;
  min-width: max-content;
}

.sensor-overview-graph__group,
.sensor-overview-graph__node {
  position: absolute;
  box-sizing: border-box;
}

.sensor-overview-graph__group {
  z-index: 0;
  display: block;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 0.9rem;
  font-weight: 800;
  pointer-events: none;
}

.sensor-overview-graph__group.is-panel {
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--sensor-node-color, #06b5d2) 76%, var(--vp-c-divider));
  border-radius: 1.35rem;
  background: color-mix(in srgb, var(--sensor-node-color, #06b5d2) 78%, var(--vp-c-bg));
}

.sensor-overview-graph__group.is-panel > span {
  position: absolute;
  top: -1.15rem;
  left: 0.25rem;
  color: var(--vp-c-text-2);
}

.sensor-overview-graph__group span {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border: 1px solid color-mix(in srgb, var(--sensor-node-color, #06b5d2) 48%, var(--vp-c-divider));
  border-radius: 999px;
  background: color-mix(in srgb, var(--sensor-node-color, #06b5d2) 10%, var(--vp-c-bg));
  white-space: nowrap;
}

.sensor-overview-graph__node {
  --sensor-node-color: var(--vp-c-brand-1);
  z-index: 1;
  display: grid;
  place-items: center;
  padding: 0.65rem 0.7rem;
  border: 1px solid color-mix(in srgb, var(--sensor-node-color) 66%, var(--vp-c-divider));
  border-radius: 1.1rem;
  color: var(--sensor-node-ink, var(--sensor-ink, var(--vp-c-text-1)));
  background: color-mix(in srgb, var(--sensor-node-color) 68%, var(--vp-c-bg));
  cursor: pointer;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
}

.sensor-overview-graph__node:hover,
.sensor-overview-graph__node:focus-visible {
  border-color: var(--sensor-node-color);
  background: color-mix(in srgb, var(--sensor-node-color) 82%, var(--vp-c-bg));
}

.sensor-overview-graph__node.is-current {
  border-color: var(--sensor-node-color);
  color: var(--sensor-current-ink, #263746);
  background: var(--sensor-node-color);
}

.sensor-overview-graph__label-node {
  border: 0;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: default;
  font-size: 1.2rem;
}

.sensor-overview-graph__connectors {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.sensor-overview-graph__connectors path {
  fill: none;
  stroke: var(--sensor-line, #b9b9b9);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.sensor-overview-graph__connectors marker path {
  fill: var(--sensor-line, #b9b9b9);
  stroke: none;
  marker-end: none;
}

.is-tone-root { --sensor-node-color: var(--sensor-node-root, #9fc3ee); --sensor-node-ink: #fff; }
.is-tone-structure { --sensor-node-color: var(--sensor-node-structure, #b0c3e8); --sensor-node-ink: #fff; }
.is-tone-external { --sensor-node-color: var(--sensor-node-external, #0eb5b5); --sensor-node-ink: #fff; }
.is-tone-circuit { --sensor-node-color: var(--sensor-node-circuit, #a8d9d8); --sensor-node-ink: #fff; }
.is-tone-speed { --sensor-node-color: var(--sensor-node-speed, #0b83bb); --sensor-node-ink: #fff; }
.is-tone-acceleration { --sensor-node-color: var(--sensor-node-acceleration, #08478e); --sensor-node-ink: #fff; }
.is-tone-angular { --sensor-node-color: var(--sensor-node-angular, #0879b0); --sensor-node-ink: #fff; }
.is-tone-rotation { --sensor-node-color: var(--sensor-node-rotation, #06b4d1); --sensor-node-ink: #fff; }
.is-tone-position { --sensor-node-color: var(--sensor-node-position, #b0cbe6); --sensor-node-ink: #fff; }
.is-tone-distance { --sensor-node-color: var(--sensor-node-distance, #afdabb); --sensor-node-ink: #fff; }
.is-tone-distance-result { --sensor-node-color: var(--sensor-node-distance-result, #a9dfc0); --sensor-node-ink: #173047; --sensor-current-ink: #173047; }
.is-tone-detection { --sensor-node-color: var(--sensor-node-detection, #a9d9df); --sensor-node-ink: #fff; }
.is-tone-detection-result { --sensor-node-color: var(--sensor-node-detection-result, #8dd8e5); --sensor-node-ink: #173047; --sensor-current-ink: #173047; }
.is-tone-encoder { --sensor-node-color: var(--sensor-node-encoder, #06b5d2); --sensor-node-ink: #fff; }
.is-tone-encoder-relative { --sensor-node-color: var(--sensor-node-encoder-relative, #1888a7); --sensor-node-ink: #fff; }
.is-tone-encoder-absolute { --sensor-node-color: var(--sensor-node-encoder-absolute, #3ca5aa); --sensor-node-ink: #fff; }
.is-tone-imu { --sensor-node-color: var(--sensor-node-imu, #548be7); --sensor-node-ink: #fff; }

.is-combination {
  border-radius: 0.95rem;
}

.is-plus {
  z-index: 2;
  padding: 0;
  border: 0;
  color: #fff;
  background: transparent;
  cursor: default;
  font-size: 1.8rem;
}

@media (prefers-reduced-motion: reduce) {
  .sensor-overview-graph__node {
    transition: none;
  }
}
</style>

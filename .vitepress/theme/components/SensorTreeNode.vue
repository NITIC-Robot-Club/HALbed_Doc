<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { SensorMode, SensorNode } from './sensorSelector'
import { getSensorNode, getSensorNodeTone, getSensorResult } from './sensorSelector'

defineOptions({ name: 'SensorTreeNode' })

const props = defineProps<{
  mode: SensorMode
  nodeId: string
  selectedPath: string[]
  focusOnly?: boolean
  expandedNodeIds?: string[]
}>()

const emit = defineEmits<{
  select: [nodeId: string]
  expand: [nodeId: string]
}>()

const node = computed(() => getSensorNode(props.mode, props.nodeId))
const children = computed(() => node.value.children ?? [])
const nodeDescription = computed(() => node.value.hint
  ?? getSensorResult(node.value)?.description
  ?? (node.value.kind === 'branch' ? `${node.value.label}から次の候補を選びます。` : undefined))
const tooltipId = computed(() => `sensor-node-hint-${node.value.id}`)
const groupNotes = computed(() => props.mode.overviewGroups.filter((group) => group.members.includes(node.value.id)))
const isSelected = computed(() => props.selectedPath.includes(node.value.id))
const isCurrent = computed(() => props.selectedPath.at(-1) === node.value.id)
const isExpanded = computed(() => props.expandedNodeIds?.includes(node.value.id) ?? false)
const shouldRenderChildren = computed(() => children.value.length > 0
  && (!props.focusOnly || isSelected.value || isExpanded.value))
const shouldShowExpand = computed(() => props.focusOnly && children.value.length > 0 && !shouldRenderChildren.value)
const isNext = computed(() => {
  const currentId = props.selectedPath.at(-1)
  if (!currentId || currentId === node.value.id) return false
  return getSensorNode(props.mode, currentId).children?.includes(node.value.id) ?? false
})
const rootElement = ref<HTMLElement | null>(null)
const buttonElement = ref<HTMLButtonElement | null>(null)
const connectorSize = ref({ width: 1, height: 1 })
const connectorPaths = ref<string[]>([])
let resizeObserver: ResizeObserver | null = null
let measurementTimer: number | undefined

function getToneClass(sensorNode: SensorNode): string {
  return `is-tone-${getSensorNodeTone(sensorNode)}`
}

function roundedOrthogonalPath(startX: number, startY: number, endX: number, endY: number, elbowX: number): string {
  if (Math.abs(endY - startY) < 2) return `M ${startX} ${startY} H ${endX}`

  const direction = endY > startY ? 1 : -1
  const radius = Math.min(8, Math.abs(endY - startY) / 2, Math.abs(elbowX - startX) / 2, Math.abs(endX - elbowX) / 2)
  const firstTurn = startY + direction * radius
  const secondTurn = endY - direction * radius

  return `M ${startX} ${startY} H ${elbowX - radius} Q ${elbowX} ${startY} ${elbowX} ${firstTurn} V ${secondTurn} Q ${elbowX} ${endY} ${elbowX + radius} ${endY} H ${endX}`
}

function measureConnectors(): void {
  const root = rootElement.value
  const parentButton = buttonElement.value
  if (!root || !parentButton || !shouldRenderChildren.value) {
    connectorPaths.value = []
    return
  }

  const rootRect = root.getBoundingClientRect()
  const parentRect = parentButton.getBoundingClientRect()
  const parentCenterX = parentRect.left - rootRect.left + parentRect.width / 2
  const parentCenterY = parentRect.top - rootRect.top + parentRect.height / 2
  const elbowX = parentRect.right - rootRect.left + 24

  connectorPaths.value = children.value.flatMap((childId) => {
    const childButton = root.querySelector<HTMLElement>(`[data-sensor-node-id="${childId}"]`)
    if (!childButton) return []

    const childRect = childButton.getBoundingClientRect()
    const childCenterX = childRect.left - rootRect.left + childRect.width / 2
    const childCenterY = childRect.top - rootRect.top + childRect.height / 2

    return [roundedOrthogonalPath(parentCenterX, parentCenterY, childCenterX, childCenterY, elbowX)]
  })
  connectorSize.value = { width: root.clientWidth, height: root.clientHeight }
}

onMounted(() => {
  nextTick(() => {
    measureConnectors()
    measurementTimer = window.setTimeout(measureConnectors, 80)
    resizeObserver = new ResizeObserver(measureConnectors)
    if (rootElement.value) resizeObserver.observe(rootElement.value)
  })
})

onBeforeUnmount(() => {
  if (measurementTimer) window.clearTimeout(measurementTimer)
  resizeObserver?.disconnect()
})
</script>

<template>
  <li ref="rootElement" class="sensor-tree-node" :class="{ 'is-selected': isSelected, 'is-current': isCurrent, 'is-next': isNext }">
    <button
      ref="buttonElement"
      type="button"
      class="sensor-tree-node__button"
      :class="[getToneClass(node), { 'is-result': node.kind === 'result' }]"
      :data-sensor-node-id="node.id"
      :title="nodeDescription"
      :aria-describedby="nodeDescription ? tooltipId : undefined"
      :aria-current="node.id === selectedPath[selectedPath.length - 1] ? 'step' : undefined"
      @click="emit('select', node.id)"
    >
      <span>{{ node.label }}</span>
      <span v-if="nodeDescription" :id="tooltipId" class="sensor-tree-node__tooltip" role="tooltip">{{ nodeDescription }}</span>
    </button>

    <aside v-for="group in groupNotes" :key="group.label" class="sensor-tree-node__group-note" :aria-label="`${group.label}の注記`">
      <strong>{{ group.label }}</strong>
      <span>{{ group.description }}</span>
    </aside>

    <svg
      v-if="shouldRenderChildren && connectorPaths.length"
      class="sensor-tree-node__connectors"
      :viewBox="`0 0 ${connectorSize.width} ${connectorSize.height}`"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path v-for="(path, index) in connectorPaths" :key="index" :d="path" />
    </svg>

    <button
      v-if="shouldShowExpand"
      type="button"
      class="sensor-tree-node__expand"
      :aria-label="`${node.label}の下位を1段表示`"
      :title="`${node.label}の下位を1段表示`"
      @click.stop="emit('expand', node.id)"
    >
      ＋ 下位を表示
    </button>

    <div v-if="shouldRenderChildren" class="sensor-tree-node__branch">
      <ul class="sensor-tree-node__children">
        <SensorTreeNode
          v-for="childId in children"
          :key="childId"
          :mode="mode"
          :node-id="childId"
          :selected-path="selectedPath"
          :focus-only="focusOnly"
          :expanded-node-ids="expandedNodeIds"
          @select="emit('select', $event)"
          @expand="emit('expand', $event)"
        />
      </ul>
    </div>
  </li>
</template>

<style scoped>
.sensor-tree-node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 3rem;
  min-width: 12rem;
}

.sensor-tree-node__button {
  --sensor-node-color: var(--vp-c-brand-1);
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3rem;
  min-width: 6.5rem;
  max-width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid color-mix(in srgb, var(--sensor-node-color) 66%, var(--vp-c-divider));
  border-radius: 1.1rem;
  color: var(--sensor-ink, var(--vp-c-text-1));
  background: color-mix(in srgb, var(--sensor-node-color) 24%, var(--vp-c-bg));
  cursor: pointer;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
  scroll-margin: 40vh 40vw;
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
}

.sensor-tree-node__button:hover,
.sensor-tree-node__button:focus-visible {
  border-color: var(--sensor-node-color);
  color: var(--sensor-ink, var(--vp-c-text-1));
  background: color-mix(in srgb, var(--sensor-node-color) 38%, var(--vp-c-bg));
}

.sensor-tree-node.is-selected > .sensor-tree-node__button {
  border-color: var(--sensor-node-color);
  color: var(--sensor-ink, var(--vp-c-text-1));
  background: color-mix(in srgb, var(--sensor-node-color) 30%, var(--vp-c-bg));
}

.sensor-tree-node.is-current > .sensor-tree-node__button {
  border-color: var(--sensor-node-color);
  color: var(--sensor-current-ink, #263746);
  background: var(--sensor-node-color);
}

.sensor-tree-node.is-next > .sensor-tree-node__button {
  border-width: 2px;
  box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--sensor-node-color) 16%, transparent);
}

.sensor-tree-node__button.is-result {
  border-color: color-mix(in srgb, var(--sensor-node-color) 72%, var(--vp-c-divider));
}

.sensor-tree-node__button small {
  color: var(--vp-c-text-3);
  font-size: 0.72rem;
  white-space: nowrap;
}

.sensor-tree-node__tooltip {
  position: absolute;
  top: calc(100% + 0.55rem);
  left: 50%;
  z-index: 5;
  width: max-content;
  max-width: min(18rem, 70vw);
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.45rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  box-shadow: 0 0.45rem 1.2rem color-mix(in srgb, #000 14%, transparent);
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.45;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -0.25rem);
  transition: opacity 140ms ease, transform 140ms ease;
  white-space: normal;
}

.sensor-tree-node__expand {
  position: relative;
  z-index: 1;
  margin-top: 0.7rem;
  padding: 0.3rem 0.6rem;
  border: 1px dashed var(--sensor-line, var(--vp-c-divider));
  border-radius: 999px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  cursor: pointer;
  font: inherit;
  font-size: 0.72rem;
  white-space: nowrap;
}

.sensor-tree-node__expand::before {
  position: absolute;
  bottom: 100%;
  left: 50%;
  width: 1px;
  height: 0.7rem;
  background: var(--sensor-line, var(--vp-c-divider));
  content: '';
  transform: translateX(-50%);
}

.sensor-tree-node__expand:hover,
.sensor-tree-node__expand:focus-visible {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.sensor-tree-node__button:hover .sensor-tree-node__tooltip,
.sensor-tree-node__button:focus-visible .sensor-tree-node__tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

.sensor-tree-node__button.is-tone-root {
  --sensor-node-color: var(--sensor-node-root, #9fc3ee);
}

.sensor-tree-node__button.is-tone-structure {
  --sensor-node-color: var(--sensor-node-structure, #b0c3e8);
}

.sensor-tree-node__button.is-tone-motion {
  --sensor-node-color: var(--sensor-node-motion, #a8dce5);
}

.sensor-tree-node__button.is-tone-position {
  --sensor-node-color: var(--sensor-node-position, #b0cbe6);
}

.sensor-tree-node__button.is-tone-distance {
  --sensor-node-color: var(--sensor-node-distance, #afdabb);
}

.sensor-tree-node__button.is-tone-detection {
  --sensor-node-color: var(--sensor-node-detection, #a9d9df);
}

.sensor-tree-node__button.is-tone-circuit {
  --sensor-node-color: var(--sensor-node-circuit, #a8d9d8);
}

.sensor-tree-node__button.is-tone-result {
  --sensor-node-color: var(--sensor-node-result, #b9dfe1);
}

.sensor-tree-node__group-note {
  display: grid;
  gap: 0.15rem;
  min-width: 12rem;
  max-width: 18rem;
  padding: 0.65rem 0.8rem;
  border-left: 2px solid var(--sensor-note-border, var(--vp-c-brand-1));
  color: var(--sensor-ink, var(--vp-c-text-1));
  font-size: 0.78rem;
  line-height: 1.45;
}

.sensor-tree-node__group-note strong {
  color: var(--sensor-ink, var(--vp-c-brand-1));
  font-size: 0.82rem;
}

.sensor-tree-node__branch {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-width: max-content;
}

.sensor-tree-node__connectors {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.sensor-tree-node__connectors path {
  fill: none;
  stroke: var(--sensor-line, var(--vp-c-text-2));
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.sensor-tree-node__children {
  display: grid;
  gap: 1.4rem;
  margin: 0.4rem 0;
  padding: 0;
  list-style: none;
}

@media (prefers-reduced-motion: reduce) {
  .sensor-tree-node__button {
    transition: none;
  }
}

@media (max-width: 700px) {
  .sensor-tree-node {
    gap: 1.25rem;
    min-width: 10rem;
  }

  .sensor-tree-node__button {
    min-width: 6rem;
    padding: 0.65rem 0.75rem;
    font-size: 0.9rem;
  }

  .sensor-tree-node__group-note {
    min-width: 10rem;
    max-width: 14rem;
    padding: 0.55rem 0.65rem;
    font-size: 0.72rem;
  }

  .sensor-tree-node__children {
    gap: 1rem;
  }
}
</style>

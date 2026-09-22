<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import SensorTreeNode from './SensorTreeNode.vue'
import {
  findSensorPath,
  getSensorMode,
  getSensorNode,
  getSensorNodeTone,
  getSensorResult,
  type SensorNode,
  type SensorModeId,
} from './sensorSelector'

type ModeChoice = SensorNode & { modeId: SensorModeId; entryNodeId: string }

const startNode: SensorNode = {
  id: 'sensor-selector-start',
  label: 'ロボット',
  kind: 'branch',
  tone: 'root',
  hint: '内部・外部・回路から、知りたい内容を選択してください。',
}

const modeChoices: ModeChoice[] = [
  {
    id: 'mode-choice-internal',
    label: '内部',
    kind: 'branch',
    tone: 'structure',
    modeId: 'all-sensors',
    entryNodeId: 'unified-internal',
    hint: 'ロボットの中で、機構の動きや位置を測るもの',
  },
  {
    id: 'mode-choice-external',
    label: '外部',
    kind: 'branch',
    tone: 'distance',
    modeId: 'all-sensors',
    entryNodeId: 'unified-external',
    hint: 'フィールドや周囲に対するロボットの位置を測るもの',
  },
  {
    id: 'mode-choice-circuit',
    label: '回路',
    kind: 'branch',
    tone: 'circuit',
    modeId: 'all-sensors',
    entryNodeId: 'unified-circuit',
    hint: '回路の電圧や電流から選ぶ',
  },
]

const activeModeId = ref<SensorModeId | null>(null)
const selectedPath = ref<string[]>([startNode.id])
const expandedTreeNodes = ref<string[]>([])
const isOverviewVisible = ref(false)
const isOverviewFullscreen = ref(false)
const overviewPanel = ref<HTMLElement | null>(null)
const treeZoom = ref(1)
const isTreeTransitioning = ref(false)
const stepHeading = ref<HTMLElement | null>(null)
const currentFlowNode = ref<HTMLElement | null>(null)
const flowTrack = ref<HTMLElement | null>(null)
const treeViewport = ref<HTMLElement | null>(null)
const flowConnectorSize = ref({ width: 1, height: 1 })
const flowConnectorPaths = ref<string[]>([])
let flowResizeObserver: ResizeObserver | null = null
let flowMeasurementTimer: number | undefined
let overviewResizeTimer: number | undefined
let treeTransitionTimer: number | undefined

const activeMode = computed(() => activeModeId.value ? getSensorMode(activeModeId.value) : null)

function getSelectionNode(nodeId: string): SensorNode {
  if (nodeId === startNode.id) return startNode

  const modeChoice = modeChoices.find((choice) => choice.id === nodeId)
  if (modeChoice) return modeChoice

  return activeMode.value ? getSensorNode(activeMode.value, nodeId) : startNode
}

function getToneClass(node: SensorNode): string {
  return `is-tone-${getSensorNodeTone(node)}`
}

function getNodeDescription(node: SensorNode): string | undefined {
  return node.hint
    ?? getSensorResult(node)?.description
    ?? (node.kind === 'branch' ? `${node.label}から次の候補を選びます。` : undefined)
}

const currentNode = computed(() => getSelectionNode(selectedPath.value.at(-1) ?? startNode.id))
const currentChildren = computed(() => {
  if (currentNode.value.id === startNode.id) return modeChoices.map((choice) => choice.id)
  const modeChoice = modeChoices.find((choice) => choice.id === currentNode.value.id)
  if (modeChoice) {
    return activeMode.value ? getSensorNode(activeMode.value, modeChoice.entryNodeId).children ?? [] : []
  }
  return currentNode.value.children ?? []
})
const currentSelectionNeighbors = computed(() => {
  const currentId = selectedPath.value.at(-1) ?? startNode.id
  let siblingIds: string[] = []

  const modeChoiceIndex = modeChoices.findIndex((choice) => choice.id === currentId)
  if (modeChoiceIndex >= 0) {
    siblingIds = modeChoices.map((choice) => choice.id)
  } else if (activeMode.value && currentId !== startNode.id) {
    const path = findSensorPath(activeMode.value, currentId)
    const parentId = path?.at(-2)
    siblingIds = parentId ? getSensorNode(activeMode.value, parentId).children ?? [] : []
  }

  const currentIndex = siblingIds.indexOf(currentId)
  return {
    before: currentIndex > 0 ? siblingIds[currentIndex - 1] : undefined,
    after: currentIndex >= 0 ? siblingIds[currentIndex + 1] : undefined,
  }
})
const currentResult = computed(() => getSensorResult(currentNode.value))
const isDeadEnd = computed(() => currentNode.value.kind === 'branch' && currentChildren.value.length === 0)
const selectionStatus = computed(() => {
  if (currentResult.value) return `${currentResult.value.label}を選択しています。`
  if (isDeadEnd.value) return `${currentNode.value.label}の詳細を確認できます。`
  return `${currentNode.value.label}から次の分岐を選択してください。`
})

function setCurrentFlowNode(element: Element | null): void {
  currentFlowNode.value = element instanceof HTMLElement ? element : null
}

function roundedOrthogonalPath(startX: number, startY: number, endX: number, endY: number, elbowX: number): string {
  if (Math.abs(endY - startY) < 2) return `M ${startX} ${startY} H ${endX}`
  if (Math.abs(endX - startX) < 2) return `M ${startX} ${startY} V ${endY}`

  const direction = endY > startY ? 1 : -1
  const radius = Math.min(10, Math.abs(endY - startY) / 2, Math.abs(elbowX - startX) / 2, Math.abs(endX - elbowX) / 2)
  const firstTurn = startY + direction * radius
  const secondTurn = endY - direction * radius

  return `M ${startX} ${startY} H ${elbowX - radius} Q ${elbowX} ${startY} ${elbowX} ${firstTurn} V ${secondTurn} Q ${elbowX} ${endY} ${elbowX + radius} ${endY} H ${endX}`
}

function roundedVerticalBranchPath(startX: number, startY: number, endX: number, endY: number, branchY: number): string {
  if (Math.abs(endX - startX) < 2) return `M ${startX} ${startY} V ${endY}`

  const direction = endY > startY ? 1 : -1
  const horizontalDirection = endX > startX ? 1 : -1
  const radius = Math.min(
    8,
    Math.abs(endX - startX) / 2,
    Math.abs(branchY - startY) / 2,
    Math.abs(endY - branchY) / 2,
  )
  if (radius < 1) return `M ${startX} ${startY} V ${branchY} H ${endX} V ${endY}`

  const firstVerticalTurn = branchY - direction * radius
  const secondVerticalTurn = branchY + direction * radius
  const firstHorizontalTurn = startX + horizontalDirection * radius
  const secondHorizontalTurn = endX - horizontalDirection * radius

  return `M ${startX} ${startY} V ${firstVerticalTurn} Q ${startX} ${branchY} ${firstHorizontalTurn} ${branchY} H ${secondHorizontalTurn} Q ${endX} ${branchY} ${endX} ${secondVerticalTurn} V ${endY}`
}

function measureFlowConnectors(): void {
  const track = flowTrack.value
  const parentButton = track?.querySelector<HTMLElement>('.sensor-selector__flow-node.is-current')
  const choices = track ? [...track.querySelectorAll<HTMLElement>('.sensor-selector__flow-choice')] : []
  if (!track || !parentButton || !choices.length) {
    flowConnectorPaths.value = []
    return
  }

  const trackRect = track.getBoundingClientRect()
  const parentRect = parentButton.getBoundingClientRect()
  const startX = parentRect.left - trackRect.left + parentRect.width / 2
  const startY = parentRect.top - trackRect.top + parentRect.height / 2
  const firstChoiceRect = choices[0].getBoundingClientRect()
  const isCompact = window.matchMedia('(max-width: 700px)').matches
  const elbowX = isCompact
    ? firstChoiceRect.left - trackRect.left - 16
    : parentRect.right - trackRect.left + 24
  const compactBranchY = startY + Math.max(
    12,
    Math.min(28, firstChoiceRect.top - trackRect.top - startY - 8),
  )

  flowConnectorPaths.value = choices.map((choice) => {
    const choiceRect = choice.getBoundingClientRect()
    const endX = choiceRect.left - trackRect.left + choiceRect.width / 2
    const endY = choiceRect.top - trackRect.top + choiceRect.height / 2
    return isCompact
      ? roundedVerticalBranchPath(startX, startY, endX, endY, compactBranchY)
      : roundedOrthogonalPath(startX, startY, endX, endY, elbowX)
  })
  flowConnectorSize.value = { width: track.clientWidth, height: track.clientHeight }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncOverviewFullscreen)
  window.addEventListener('resize', handleWindowResize)
  nextTick(() => {
    measureFlowConnectors()
    flowMeasurementTimer = window.setTimeout(measureFlowConnectors, 80)
    flowResizeObserver = new ResizeObserver(measureFlowConnectors)
    if (flowTrack.value) flowResizeObserver.observe(flowTrack.value)
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncOverviewFullscreen)
  window.removeEventListener('resize', handleWindowResize)
  if (flowMeasurementTimer) window.clearTimeout(flowMeasurementTimer)
  if (overviewResizeTimer) window.clearTimeout(overviewResizeTimer)
  if (treeTransitionTimer) window.clearTimeout(treeTransitionTimer)
  flowResizeObserver?.disconnect()
})

function handleWindowResize(): void {
  measureFlowConnectors()
  if (!isOverviewVisible.value) return

  if (overviewResizeTimer) window.clearTimeout(overviewResizeTimer)
  overviewResizeTimer = window.setTimeout(() => {
    nextTick(centerOverviewSelection)
  }, 80)
}

function syncOverviewFullscreen(): void {
  isOverviewFullscreen.value = document.fullscreenElement === overviewPanel.value
}

async function toggleOverviewFullscreen(): Promise<void> {
  if (!overviewPanel.value) return

  if (document.fullscreenElement === overviewPanel.value) {
    await document.exitFullscreen?.()
    return
  }

  if (document.fullscreenElement) await document.exitFullscreen?.()
  await overviewPanel.value.requestFullscreen?.()
}

function setTreeZoom(nextZoom: number): void {
  treeZoom.value = Math.min(1.6, Math.max(0.7, Number(nextZoom.toFixed(2))))
  nextTick(centerOverviewSelection)
}

function changeTreeZoom(delta: number): void {
  setTreeZoom(treeZoom.value + delta)
}

function playTreeTransition(): void {
  if (treeTransitionTimer) window.clearTimeout(treeTransitionTimer)
  isTreeTransitioning.value = false

  requestAnimationFrame(() => {
    isTreeTransitioning.value = true
    treeTransitionTimer = window.setTimeout(() => {
      isTreeTransitioning.value = false
    }, 280)
  })
}

function handleTreeWheel(event: WheelEvent): void {
  if (!event.ctrlKey || event.deltaY === 0) return

  event.preventDefault()
  changeTreeZoom(event.deltaY < 0 ? 0.1 : -0.1)
}

function resetTreeExpansion(): void {
  expandedTreeNodes.value = []
}

function expandTreeNode(nodeId: string): void {
  if (expandedTreeNodes.value.includes(nodeId)) return
  expandedTreeNodes.value = [...expandedTreeNodes.value, nodeId]
  nextTick(centerOverviewSelection)
}

function centerTreeSelection(element: HTMLElement): void {
  const viewport = treeViewport.value
  if (!viewport) return

  const viewportRect = viewport.getBoundingClientRect()
  const relatedNodes = [element]
  const bounds = relatedNodes.reduce((current, node) => {
    const rect = node.getBoundingClientRect()
    return {
      top: Math.min(current.top, rect.top),
      right: Math.max(current.right, rect.right),
      bottom: Math.max(current.bottom, rect.bottom),
      left: Math.min(current.left, rect.left),
    }
  }, { top: Number.POSITIVE_INFINITY, right: Number.NEGATIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY, left: Number.POSITIVE_INFINITY })
  const regionWidth = bounds.right - bounds.left
  const regionHeight = bounds.bottom - bounds.top
  const top = viewport.scrollTop + bounds.top - viewportRect.top - (viewport.clientHeight - regionHeight) / 2
  const left = viewport.scrollLeft + bounds.left - viewportRect.left - (viewport.clientWidth - regionWidth) / 2
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  viewport.scrollTo({ top: Math.max(0, top), left: Math.max(0, left), behavior })
}

function centerOverviewSelection(): void {
  const currentTreeNode = treeViewport.value?.querySelector<HTMLElement>('.sensor-tree-node.is-current > .sensor-tree-node__button')
  if (!currentTreeNode) return

  revealTreeViewport()
  centerTreeSelection(currentTreeNode)
}

function revealTreeViewport(): void {
  const viewport = treeViewport.value
  if (!viewport) return

  const rect = viewport.getBoundingClientRect()
  const topInset = 80
  const bottomInset = 48
  const delta = rect.top < topInset
    ? rect.top - topInset
    : rect.bottom > window.innerHeight - bottomInset
      ? rect.bottom - (window.innerHeight - bottomInset)
      : 0

  if (delta) {
    window.scrollBy({
      top: delta,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }
}

function focusStepHeading(): void {
  nextTick(() => {
    measureFlowConnectors()
    requestAnimationFrame(() => requestAnimationFrame(measureFlowConnectors))
    stepHeading.value?.focus({ preventScroll: true })
    if (isOverviewVisible.value) {
      playTreeTransition()
      nextTick(() => {
        centerOverviewSelection()
        requestAnimationFrame(() => {
          centerOverviewSelection()
          window.setTimeout(centerOverviewSelection, 80)
        })
      })
    } else if (selectedPath.value.length > 1) {
      currentFlowNode.value?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
        inline: 'center',
      })
    }
  })
}

function resetSelection(): void {
  activeModeId.value = null
  selectedPath.value = [startNode.id]
  resetTreeExpansion()
  isOverviewVisible.value = false
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  focusStepHeading()
}

function appendSingleChildNodes(path: string[], startNodeId?: string): string[] {
  if (!activeMode.value) return path

  let current = startNodeId
    ? getSensorNode(activeMode.value, startNodeId)
    : getSensorNode(activeMode.value, path.at(-1) ?? activeMode.value.rootId)

  while (current.kind === 'branch' && current.children?.length === 1) {
    const [childId] = current.children
    path.push(childId)
    current = getSensorNode(activeMode.value, childId)
  }

  return path
}

function selectMode(modeId: SensorModeId, choiceId?: string): void {
  activeModeId.value = modeId
  const modeChoice = modeChoices.find((choice) => choice.id === choiceId) ?? modeChoices.find((choice) => choice.modeId === modeId)
  const nextPath = [startNode.id, modeChoice?.id ?? startNode.id]
  selectedPath.value = modeChoice
    ? appendSingleChildNodes(nextPath, modeChoice.entryNodeId)
    : nextPath
  resetTreeExpansion()
  isOverviewVisible.value = false
  focusStepHeading()
}

function selectNode(nodeId: string): void {
  const modeChoice = modeChoices.find((choice) => choice.id === nodeId)
  if (modeChoice) {
    selectMode(modeChoice.modeId, modeChoice.id)
    return
  }

  if (!activeMode.value) return

  const path = findSensorPath(activeMode.value, nodeId)
  if (!path) return

  const wasOverviewVisible = isOverviewVisible.value
  const pathChoiceId = modeChoices.find((choice) => choice.entryNodeId === path[1])?.id
  const modeChoiceId = wasOverviewVisible
    ? pathChoiceId ?? selectedPath.value[1]
    : selectedPath.value[1] ?? pathChoiceId
  const nextPath = [startNode.id, ...(modeChoiceId ? [modeChoiceId] : []), ...path.slice(2)]
  selectedPath.value = appendSingleChildNodes(nextPath)
  resetTreeExpansion()
  isOverviewVisible.value = wasOverviewVisible
  focusStepHeading()
}

function goBack(): void {
  if (selectedPath.value.length <= 1) return
  selectedPath.value = selectedPath.value.slice(0, -1)
  resetTreeExpansion()
  if (selectedPath.value.length === 1) {
    activeModeId.value = null
    isOverviewVisible.value = false
  }
  focusStepHeading()
}

function selectBreadcrumb(index: number): void {
  selectedPath.value = selectedPath.value.slice(0, index + 1)
  resetTreeExpansion()
  if (index === 0) activeModeId.value = null
  isOverviewVisible.value = false
  focusStepHeading()
}

const overviewSelectedPath = computed(() => {
  if (!activeMode.value) return []
  const modeChoice = modeChoices.find((choice) => choice.id === selectedPath.value[1])
  if (modeChoice) {
    return [activeMode.value.rootId, modeChoice.entryNodeId, ...selectedPath.value.slice(2)]
  }
  return [activeMode.value.rootId, ...selectedPath.value.slice(2)]
})

function switchToExternalMode(): void {
  selectMode('all-sensors', 'mode-choice-external')
}

function showOverviewFromStart(): void {
  activeModeId.value = 'all-sensors'
  selectedPath.value = [startNode.id]
  resetTreeExpansion()
  isOverviewVisible.value = true
  focusStepHeading()
}

async function toggleOverview(): Promise<void> {
  if (isOverviewVisible.value && document.fullscreenElement === overviewPanel.value) {
    await document.exitFullscreen?.()
  }
  isOverviewVisible.value = !isOverviewVisible.value
  focusStepHeading()
}
</script>

<template>
  <section class="sensor-selector" :class="{ 'is-start': !activeMode }" aria-label="センサー選定">
    <section class="sensor-selector__workspace" :class="{ 'is-start': !activeMode }" :aria-label="activeMode?.title ?? '測る場所を選ぶ'">
      <div class="sensor-selector__workspace-header">
        <div v-if="!activeMode">
          <h2>測る場所を選ぶ</h2>
        </div>
        <div class="sensor-selector__actions">
          <button v-if="selectedPath.length > 1" type="button" class="sensor-selector__text-button" @click="goBack">
            戻る
          </button>
          <button v-if="activeMode" type="button" class="sensor-selector__text-button" @click="resetSelection">
            最初から
          </button>
          <button v-if="activeMode" type="button" class="sensor-selector__primary-button" @click="toggleOverview">
            {{ isOverviewVisible ? '選定画面に戻る' : '全体表示' }}
          </button>
          <button v-else type="button" class="sensor-selector__primary-button" @click="showOverviewFromStart">
            全体表示
          </button>
        </div>
      </div>

      <div v-if="!isOverviewVisible" class="sensor-selector__step-view">
        <nav class="sensor-selector__breadcrumb" aria-label="選択経路">
          <ol>
            <li v-for="(nodeId, index) in selectedPath" :key="nodeId">
              <button
                type="button"
                :disabled="index === selectedPath.length - 1"
                :aria-current="index === selectedPath.length - 1 ? 'step' : undefined"
                @click="selectBreadcrumb(index)"
              >
                {{ getSelectionNode(nodeId).label }}
              </button>
            </li>
          </ol>
        </nav>

        <div class="sensor-selector__step-content">
          <p class="sensor-selector__sr-only" role="status" aria-live="polite">{{ selectionStatus }}</p>
          <div class="sensor-selector__step-copy">
            <h3 ref="stepHeading" tabindex="-1">{{ currentNode.label }}</h3>
            <p>{{ currentNode.hint ?? selectionStatus }}</p>
          </div>

          <div class="sensor-selector__flow-viewport" aria-label="選定経路と次の分岐">
            <div ref="flowTrack" class="sensor-selector__flow-track">
              <svg
                v-if="flowConnectorPaths.length"
                class="sensor-selector__branch-connectors"
                :viewBox="`0 0 ${flowConnectorSize.width} ${flowConnectorSize.height}`"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <marker id="sensor-flow-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
                    <path d="M 0 0 L 7 3.5 L 0 7 Z" />
                  </marker>
                </defs>
                <path v-for="(path, index) in flowConnectorPaths" :key="index" :d="path" />
              </svg>

              <div
                v-for="(nodeId, index) in selectedPath"
                :key="nodeId"
                class="sensor-selector__flow-column"
                :class="{
                  'is-current': index === selectedPath.length - 1,
                  'has-context': index === selectedPath.length - 1 && (currentSelectionNeighbors.before || currentSelectionNeighbors.after),
                  'has-next-node': index < selectedPath.length - 1,
                }"
              >
                <button
                  v-if="index === selectedPath.length - 1 && currentSelectionNeighbors.before"
                  type="button"
                  class="sensor-selector__flow-context-node"
                  :class="['is-before', getToneClass(getSelectionNode(currentSelectionNeighbors.before))]"
                  :aria-label="`前の選択肢: ${getSelectionNode(currentSelectionNeighbors.before).label}`"
                  :title="getNodeDescription(getSelectionNode(currentSelectionNeighbors.before))"
                  @click="selectNode(currentSelectionNeighbors.before)"
                >
                  {{ getSelectionNode(currentSelectionNeighbors.before).label }}
                </button>

                <button
                  type="button"
                  class="sensor-selector__flow-node"
                  :ref="index === selectedPath.length - 1 ? setCurrentFlowNode : undefined"
                  :class="[getToneClass(getSelectionNode(nodeId)), { 'is-current': index === selectedPath.length - 1, 'is-result': getSelectionNode(nodeId).kind === 'result' }]"
                  :disabled="index === selectedPath.length - 1"
                  :aria-current="index === selectedPath.length - 1 ? 'step' : undefined"
                  :title="getNodeDescription(getSelectionNode(nodeId))"
                  @click="selectBreadcrumb(index)"
                >
                  <span>{{ getSelectionNode(nodeId).label }}</span>
                  <span v-if="getNodeDescription(getSelectionNode(nodeId))" class="sensor-selector__flow-tooltip" role="tooltip">
                    {{ getNodeDescription(getSelectionNode(nodeId)) }}
                  </span>
                </button>

                <button
                  v-if="index === selectedPath.length - 1 && currentSelectionNeighbors.after"
                  type="button"
                  class="sensor-selector__flow-context-node"
                  :class="['is-after', getToneClass(getSelectionNode(currentSelectionNeighbors.after))]"
                  :aria-label="`次の選択肢: ${getSelectionNode(currentSelectionNeighbors.after).label}`"
                  :title="getNodeDescription(getSelectionNode(currentSelectionNeighbors.after))"
                  @click="selectNode(currentSelectionNeighbors.after)"
                >
                  {{ getSelectionNode(currentSelectionNeighbors.after).label }}
                </button>
              </div>

              <div v-if="currentChildren.length" class="sensor-selector__flow-choices" aria-label="次の分岐">
                <button
                  v-for="childId in currentChildren"
                  :key="childId"
                  type="button"
                  class="sensor-selector__flow-choice"
                  :class="[getToneClass(getSelectionNode(childId)), { 'is-result': getSelectionNode(childId).kind === 'result' }]"
                  :aria-label="`${getSelectionNode(childId).label}。${getSelectionNode(childId).hint ?? 'この分岐を選択する'}`"
                  :title="getNodeDescription(getSelectionNode(childId)) ?? 'この分岐を選択する'"
                  @click="selectNode(childId)"
                >
                  <strong>{{ getSelectionNode(childId).label }}</strong>
                  <span v-if="getNodeDescription(getSelectionNode(childId))" class="sensor-selector__flow-tooltip" role="tooltip">
                    {{ getNodeDescription(getSelectionNode(childId)) }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="currentResult" class="sensor-selector__result" aria-label="選定結果">
            <p class="sensor-selector__result-label">選定結果</p>
            <h3>{{ currentResult.label }}</h3>
            <p>{{ currentResult.description }}</p>
            <p class="sensor-selector__path-label">選択経路</p>
            <p class="sensor-selector__result-path">{{ selectedPath.map((nodeId) => getSelectionNode(nodeId).label).join(' → ') }}</p>
          </div>

          <div v-else-if="isDeadEnd" class="sensor-selector__notice">
            <p>{{ selectionStatus }}</p>
            <button type="button" class="sensor-selector__link-button" @click="switchToExternalMode">
              「外部」から選ぶ →
            </button>
          </div>
        </div>
      </div>

      <div
        v-else-if="activeMode"
        ref="overviewPanel"
        class="sensor-selector__overview"
        :class="{ 'is-fullscreen': isOverviewFullscreen }"
        aria-labelledby="sensor-overview-title"
      >
        <div class="sensor-selector__overview-header">
          <div>
            <p class="sensor-selector__eyebrow">全体図</p>
            <h3 id="sensor-overview-title" ref="stepHeading">{{ activeMode.label }}の全体図</h3>
          </div>
          <div class="sensor-selector__overview-meta">
            <p v-if="activeMode.note">{{ activeMode.note }}</p>
            <p class="sensor-selector__overview-path">
              選択経路: {{ selectedPath.map((nodeId) => getSelectionNode(nodeId).label).join(' → ') }}
            </p>
          </div>
        </div>

        <div class="sensor-selector__overview-tools" aria-label="全体図の表示操作">
          <div class="sensor-selector__zoom-control" role="group" aria-label="ツリーの拡大縮小">
            <button
              type="button"
              class="sensor-selector__icon-button"
              aria-label="ツリーを縮小"
              title="縮小"
              :disabled="treeZoom <= 0.7"
              @click="changeTreeZoom(-0.1)"
            >
              −
            </button>
            <output class="sensor-selector__zoom-value" aria-live="polite">{{ Math.round(treeZoom * 100) }}%</output>
            <button
              type="button"
              class="sensor-selector__icon-button"
              aria-label="ツリーを拡大"
              title="拡大"
              :disabled="treeZoom >= 1.6"
              @click="changeTreeZoom(0.1)"
            >
              ＋
            </button>
            <button
              type="button"
              class="sensor-selector__zoom-reset"
              aria-label="ツリーの倍率を100%に戻す"
              title="倍率を100%に戻す"
              @click="setTreeZoom(1)"
            >
              100%
            </button>
          </div>
          <button
            type="button"
            class="sensor-selector__fullscreen-button"
            :aria-label="isOverviewFullscreen ? '全画面表示を終了' : '全体図を全画面表示'"
            @click="toggleOverviewFullscreen"
          >
            <span aria-hidden="true">{{ isOverviewFullscreen ? '↙' : '↗' }}</span>
            {{ isOverviewFullscreen ? '全画面を終了' : '全画面表示' }}
          </button>
        </div>

        <div
          ref="treeViewport"
          class="sensor-selector__tree-wrap"
          title="Ctrlキーを押しながらスクロールすると拡大縮小できます"
          @wheel="handleTreeWheel"
        >
          <div
            class="sensor-selector__tree-zoom"
            :class="{ 'is-transitioning': isTreeTransitioning }"
            :style="{ '--sensor-tree-zoom': treeZoom }"
          >
            <ul class="sensor-selector__tree" aria-label="センサー選定ツリー">
              <SensorTreeNode
                :mode="activeMode"
                :node-id="activeMode.rootId"
                :selected-path="overviewSelectedPath"
                :expanded-node-ids="expandedTreeNodes"
                @select="selectNode"
                @expand="expandTreeNode"
              />
            </ul>
          </div>
        </div>

        <div v-if="currentResult" class="sensor-selector__result" aria-label="選定結果" aria-live="polite">
          <p class="sensor-selector__result-label">選定結果</p>
          <h3>{{ currentResult.label }}</h3>
          <p>{{ currentResult.description }}</p>
          <p class="sensor-selector__path-label">選択経路</p>
          <p class="sensor-selector__result-path">{{ selectedPath.map((nodeId) => getSelectionNode(nodeId).label).join(' → ') }}</p>
        </div>

        <div v-else-if="isDeadEnd" class="sensor-selector__notice" aria-live="polite">
          <p>{{ selectionStatus }}</p>
          <button type="button" class="sensor-selector__link-button" @click="switchToExternalMode">
            「外部」から選ぶ →
          </button>
        </div>

      </div>
    </section>
  </section>
</template>

<style scoped>
.sensor-selector {
  --sensor-ink: #173047;
  --sensor-current-ink: #fff;
  --sensor-line: #b7b7b7;
  --sensor-note-border: #06b5d2;
  --sensor-node-root: #2d8fd4;
  --sensor-node-structure: #3f63c7;
  --sensor-node-external: #0eb5b5;
  --sensor-node-motion: #1682b4;
  --sensor-node-speed: #0b83bb;
  --sensor-node-acceleration: #08478e;
  --sensor-node-angular: #0879b0;
  --sensor-node-rotation: #06b4d1;
  --sensor-node-position: #176db0;
  --sensor-node-distance: #429b72;
  --sensor-node-distance-result: #a9dfc0;
  --sensor-node-detection: #12b6d1;
  --sensor-node-detection-result: #8dd8e5;
  --sensor-node-circuit: #2fa7a1;
  --sensor-node-encoder: #06b5d2;
  --sensor-node-encoder-relative: #1888a7;
  --sensor-node-encoder-absolute: #3ca5aa;
  --sensor-node-imu: #548be7;
  --sensor-node-result: #46bfda;
  color-scheme: light;
  width: min(100% - 2rem, 1280px);
  margin: 0 auto;
  padding: 0.5rem 0 3.5rem;
  color: var(--vp-c-text-1);
}

html.dark .sensor-selector {
  --sensor-ink: #f1f6fc;
  --sensor-current-ink: #f7fbff;
  --sensor-line: #9ea4aa;
  --sensor-note-border: #54c9dd;
  --sensor-node-root: #2f7fc0;
  --sensor-node-structure: #40568f;
  --sensor-node-external: #258d8d;
  --sensor-node-motion: #2f7888;
  --sensor-node-speed: #2b83a5;
  --sensor-node-acceleration: #164f84;
  --sensor-node-angular: #277a9d;
  --sensor-node-rotation: #19a2bd;
  --sensor-node-position: #356f98;
  --sensor-node-distance: #36745d;
  --sensor-node-distance-result: #6ba989;
  --sensor-node-detection: #2c7781;
  --sensor-node-detection-result: #5caebb;
  --sensor-node-circuit: #327c7a;
  --sensor-node-encoder: #2c9daf;
  --sensor-node-encoder-relative: #28798e;
  --sensor-node-encoder-absolute: #3d999d;
  --sensor-node-imu: #4c78c2;
  --sensor-node-result: #397579;
  color-scheme: dark;
}

.sensor-selector__workspace {
  border-bottom: 1px solid var(--vp-c-divider);
}

.sensor-selector__eyebrow {
  margin: 0 0 0.55rem;
  color: var(--vp-c-brand-1);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sensor-selector h2,
.sensor-selector h3,
.sensor-selector p {
  margin: 0;
}

.sensor-selector h2,
.sensor-selector h3,
.sensor-selector__flow-node,
.sensor-selector__flow-choice,
.sensor-selector__breadcrumb button,
.sensor-selector__result h3,
.sensor-selector__notice strong {
  font-weight: 750;
}

.sensor-selector h2 {
  font-size: clamp(1.35rem, 3vw, 1.9rem);
  letter-spacing: -0.03em;
  line-height: 1.25;
}

.sensor-selector h3 {
  line-height: 1.25;
}

.sensor-selector__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sensor-selector__flow-node,
.sensor-selector__flow-choice,
.sensor-selector__primary-button,
.sensor-selector__text-button,
.sensor-selector__link-button {
  font: inherit;
  cursor: pointer;
}

.sensor-selector__workspace {
  padding: 1.6rem 0 0;
}

.sensor-selector__workspace-header,
.sensor-selector__overview-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.sensor-selector__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 0.7rem;
}

.sensor-selector__text-button,
.sensor-selector__primary-button,
.sensor-selector__link-button {
  border: 0;
  color: var(--vp-c-brand-1);
  background: transparent;
  font-size: 0.88rem;
  font-weight: 750;
}

.sensor-selector__text-button {
  min-height: 2.5rem;
  padding: 0.45rem 0.7rem;
  border-radius: 0.35rem;
}

.sensor-selector__text-button:hover:not(:disabled),
.sensor-selector__text-button:focus-visible {
  background: var(--vp-c-default-soft);
}

.sensor-selector__text-button:disabled {
  color: var(--vp-c-text-3);
  cursor: not-allowed;
}

.sensor-selector__primary-button {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 0.35rem;
}

.sensor-selector__text-button:hover:not(:disabled),
.sensor-selector__link-button:hover,
.sensor-selector__primary-button:hover {
  text-decoration: underline;
}

.sensor-selector__step-view {
  padding: 1.25rem 0 2.5rem;
}

.sensor-selector__breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.9rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sensor-selector__breadcrumb li {
  position: relative;
}

.sensor-selector__breadcrumb li:not(:last-child)::after {
  position: absolute;
  top: 50%;
  right: -0.62rem;
  color: var(--vp-c-text-3);
  content: '›';
  transform: translateY(-50%);
}

.sensor-selector__breadcrumb button {
  border: 0;
  padding: 0;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: 0.84rem;
}

.sensor-selector__breadcrumb button:disabled {
  color: var(--vp-c-text-1);
  font-weight: 700;
  cursor: default;
}

.sensor-selector__step-content {
  display: grid;
  gap: 1.15rem;
  padding-top: 1.7rem;
}

.sensor-selector__step-copy {
  align-self: start;
}

.sensor-selector__step-count,
.sensor-selector__result-label,
.sensor-selector__path-label {
  color: var(--vp-c-brand-1);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sensor-selector__step-copy h3 {
  margin-top: 0;
  font-size: clamp(1.5rem, 3vw, 2.15rem);
  letter-spacing: -0.035em;
}

.sensor-selector__step-copy > p:last-child {
  margin-top: 0.75rem;
  color: var(--vp-c-text-1);
  line-height: 1.75;
}

.sensor-selector__flow-viewport {
  overflow-x: auto;
  display: flex;
  align-items: center;
  min-height: clamp(27rem, 58vh, 38rem);
  padding: 1.5rem 1rem 1.75rem;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  scroll-behavior: smooth;
}

.sensor-selector__workspace.is-start .sensor-selector__step-view {
  padding-top: 0.5rem;
  padding-bottom: 1.5rem;
}

.sensor-selector.is-start .sensor-selector__workspace {
  padding-top: 1rem;
}

.sensor-selector.is-start .sensor-selector__breadcrumb,
.sensor-selector.is-start .sensor-selector__step-copy {
  display: none;
}

.sensor-selector__workspace.is-start .sensor-selector__step-content {
  gap: 0.8rem;
  padding-top: 0;
}

.sensor-selector__workspace.is-start .sensor-selector__flow-viewport {
  min-height: 9rem;
  padding-block: 0.75rem;
}

.sensor-selector__workspace.is-start .sensor-selector__flow-track,
.sensor-selector__workspace.is-start .sensor-selector__flow-column.is-current {
  min-height: 0;
}

.sensor-selector__workspace.is-start .sensor-selector__flow-choices {
  min-height: 7rem;
  gap: 0.75rem;
  padding-block: 0.75rem;
}

.sensor-selector__flow-track {
  position: relative;
  display: flex;
  align-items: center;
  gap: 3rem;
  min-width: max-content;
  min-height: clamp(27rem, 58vh, 38rem);
}

.sensor-selector__flow-column {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 1;
}

.sensor-selector__flow-column.is-current {
  position: relative;
  flex-direction: column;
  justify-content: center;
  min-height: clamp(27rem, 58vh, 38rem);
}

.sensor-selector__flow-column.is-current.has-context::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  z-index: 0;
  border-left: 1px solid color-mix(in srgb, var(--vp-c-text-3) 42%, var(--vp-c-divider));
  content: '';
  pointer-events: none;
  transform: translateX(-50%);
}

.sensor-selector__flow-context-node {
  position: absolute;
  left: 50%;
  z-index: 1;
  min-width: 7.8rem;
  max-width: 14rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid color-mix(in srgb, var(--vp-c-text-3) 45%, var(--vp-c-divider));
  border-radius: 1.1rem;
  color: var(--vp-c-text-3);
  background: color-mix(in srgb, var(--vp-c-text-3) 7%, var(--vp-c-bg));
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  opacity: 0.78;
  text-align: center;
  transform: translateX(-50%);
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease, opacity 160ms ease;
}

.sensor-selector__flow-context-node.is-before {
  top: 0;
}

.sensor-selector__flow-context-node.is-after {
  bottom: 0;
}

.sensor-selector__flow-context-node:hover,
.sensor-selector__flow-context-node:focus-visible {
  border-color: var(--vp-c-text-2);
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
  opacity: 1;
}

.sensor-selector__flow-column.has-next-node::after {
  position: absolute;
  top: 50%;
  right: -3rem;
  width: 3rem;
  border-top: 2px solid var(--sensor-line);
  content: '';
}

.sensor-selector__flow-node,
.sensor-selector__flow-choice {
  --sensor-node-color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--sensor-node-color) 66%, var(--vp-c-divider));
  color: var(--sensor-ink);
  background: color-mix(in srgb, var(--sensor-node-color) 24%, var(--vp-c-bg));
  text-align: left;
}

.sensor-selector__flow-node {
  position: relative;
  display: grid;
  gap: 0.2rem;
  min-width: 7.8rem;
  max-width: 14rem;
  padding: 0.7rem 0.95rem;
  border-radius: 1.3rem;
  font-weight: 700;
  text-align: center;
}

.sensor-selector__flow-node:not(:disabled):hover,
.sensor-selector__flow-node:not(:disabled):focus-visible {
  border-color: var(--sensor-node-color);
  color: var(--sensor-ink);
  background: color-mix(in srgb, var(--sensor-node-color) 38%, var(--vp-c-bg));
}

.sensor-selector__flow-node.is-current {
  border-color: var(--sensor-node-color);
  color: var(--sensor-current-ink);
  background: var(--sensor-node-color);
}

.sensor-selector__flow-tooltip {
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

.sensor-selector__flow-node:hover .sensor-selector__flow-tooltip,
.sensor-selector__flow-node:focus-visible .sensor-selector__flow-tooltip,
.sensor-selector__flow-choice:hover .sensor-selector__flow-tooltip,
.sensor-selector__flow-choice:focus-visible .sensor-selector__flow-tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

.sensor-selector__flow-node.is-result {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 55%, var(--vp-c-divider));
}

.sensor-selector__flow-choices {
  position: relative;
  display: grid;
  z-index: 1;
  gap: 1.4rem;
  align-content: center;
  min-height: 14rem;
  padding: 1.5rem 0 1.5rem 3rem;
}

.sensor-selector__branch-connectors {
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

.sensor-selector__branch-connectors path {
  fill: none;
  stroke: var(--sensor-line);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
  vector-effect: non-scaling-stroke;
  marker-end: url('#sensor-flow-arrow');
}

.sensor-selector__branch-connectors marker path {
  fill: var(--sensor-line);
  stroke: none;
  marker-end: none;
}

.sensor-selector__flow-choice {
  position: relative;
  display: block;
  min-width: 12rem;
  padding: 0.7rem 0.95rem;
  border-radius: 1.3rem;
  font-weight: 700;
  text-align: center;
}

.sensor-selector__flow-choice:hover,
.sensor-selector__flow-choice:focus-visible {
  border-color: var(--sensor-node-color);
  color: var(--sensor-ink);
  background: color-mix(in srgb, var(--sensor-node-color) 38%, var(--vp-c-bg));
}

.sensor-selector__flow-node.is-tone-root,
.sensor-selector__flow-choice.is-tone-root {
  --sensor-node-color: var(--sensor-node-root);
}

.sensor-selector__flow-node.is-tone-external,
.sensor-selector__flow-choice.is-tone-external {
  --sensor-node-color: var(--sensor-node-external);
}

.sensor-selector__flow-node.is-tone-structure,
.sensor-selector__flow-choice.is-tone-structure {
  --sensor-node-color: var(--sensor-node-structure);
}

.sensor-selector__flow-node.is-tone-motion,
.sensor-selector__flow-choice.is-tone-motion {
  --sensor-node-color: var(--sensor-node-motion);
}

.sensor-selector__flow-node.is-tone-speed,
.sensor-selector__flow-choice.is-tone-speed {
  --sensor-node-color: var(--sensor-node-speed);
}

.sensor-selector__flow-node.is-tone-acceleration,
.sensor-selector__flow-choice.is-tone-acceleration {
  --sensor-node-color: var(--sensor-node-acceleration);
}

.sensor-selector__flow-node.is-tone-angular,
.sensor-selector__flow-choice.is-tone-angular {
  --sensor-node-color: var(--sensor-node-angular);
}

.sensor-selector__flow-node.is-tone-rotation,
.sensor-selector__flow-choice.is-tone-rotation {
  --sensor-node-color: var(--sensor-node-rotation);
}

.sensor-selector__flow-node.is-tone-position,
.sensor-selector__flow-choice.is-tone-position {
  --sensor-node-color: var(--sensor-node-position);
}

.sensor-selector__flow-node.is-tone-distance,
.sensor-selector__flow-choice.is-tone-distance {
  --sensor-node-color: var(--sensor-node-distance);
}

.sensor-selector__flow-node.is-tone-distance-result,
.sensor-selector__flow-choice.is-tone-distance-result {
  --sensor-node-color: var(--sensor-node-distance-result);
  --sensor-current-ink: #173047;
}

.sensor-selector__flow-node.is-tone-detection,
.sensor-selector__flow-choice.is-tone-detection {
  --sensor-node-color: var(--sensor-node-detection);
}

.sensor-selector__flow-node.is-tone-detection-result,
.sensor-selector__flow-choice.is-tone-detection-result {
  --sensor-node-color: var(--sensor-node-detection-result);
  --sensor-current-ink: #173047;
}

.sensor-selector__flow-node.is-tone-circuit,
.sensor-selector__flow-choice.is-tone-circuit {
  --sensor-node-color: var(--sensor-node-circuit);
}

.sensor-selector__flow-node.is-tone-encoder,
.sensor-selector__flow-choice.is-tone-encoder {
  --sensor-node-color: var(--sensor-node-encoder);
}

.sensor-selector__flow-node.is-tone-encoder-relative,
.sensor-selector__flow-choice.is-tone-encoder-relative {
  --sensor-node-color: var(--sensor-node-encoder-relative);
}

.sensor-selector__flow-node.is-tone-encoder-absolute,
.sensor-selector__flow-choice.is-tone-encoder-absolute {
  --sensor-node-color: var(--sensor-node-encoder-absolute);
}

.sensor-selector__flow-node.is-tone-imu,
.sensor-selector__flow-choice.is-tone-imu {
  --sensor-node-color: var(--sensor-node-imu);
}

.sensor-selector__flow-node.is-tone-result,
.sensor-selector__flow-choice.is-tone-result {
  --sensor-node-color: var(--sensor-node-result);
  --sensor-current-ink: #173047;
}

.sensor-selector__flow-choice.is-result {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 50%, var(--vp-c-divider));
}

.sensor-selector__flow-choice strong {
}

.sensor-selector__result,
.sensor-selector__notice {
  padding: 1.25rem 1.35rem;
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.sensor-selector__result h3 {
  margin-top: 0.45rem;
  font-size: 1.5rem;
}

.sensor-selector__result > p:not(.sensor-selector__result-label):not(.sensor-selector__path-label) {
  margin-top: 0.75rem;
  color: var(--vp-c-text-1);
  line-height: 1.75;
}

.sensor-selector__path-label {
  margin-top: 1.3rem;
}

.sensor-selector__result-path {
  margin-top: 0.35rem;
  color: var(--vp-c-text-1);
  font-size: 0.88rem;
  line-height: 1.65;
}

.sensor-selector__notice p {
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.sensor-selector__link-button {
  margin-top: 0.75rem;
  padding: 0;
}

.sensor-selector__overview {
  padding: 1.4rem 0 2.5rem;
}

.sensor-selector__overview-header {
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.sensor-selector__overview-header h3 {
  font-size: 1.25rem;
}

.sensor-selector__overview-meta {
  max-width: 34rem;
  text-align: right;
}

.sensor-selector__overview-meta p {
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  line-height: 1.65;
}

.sensor-selector__overview-path {
  margin-top: 0.45rem;
}

.sensor-selector__overview-tools {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-soft) 68%, var(--vp-c-bg));
}

.sensor-selector__zoom-control {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.sensor-selector__icon-button,
.sensor-selector__zoom-reset,
.sensor-selector__fullscreen-button {
  min-height: 2.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.45rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.sensor-selector__icon-button {
  width: 2.25rem;
  padding: 0;
  font-size: 1.15rem;
  line-height: 1;
}

.sensor-selector__zoom-reset {
  padding: 0.35rem 0.6rem;
}

.sensor-selector__fullscreen-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.7rem;
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.sensor-selector__icon-button:hover:not(:disabled),
.sensor-selector__zoom-reset:hover,
.sensor-selector__fullscreen-button:hover,
.sensor-selector__icon-button:focus-visible,
.sensor-selector__zoom-reset:focus-visible,
.sensor-selector__fullscreen-button:focus-visible {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-default-soft);
}

.sensor-selector__icon-button:disabled {
  color: var(--vp-c-text-3);
  cursor: not-allowed;
  opacity: 0.55;
}

.sensor-selector__zoom-value {
  min-width: 3.2rem;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.sensor-selector__tree-wrap {
  overflow: auto;
  height: clamp(24rem, 64vh, 42rem);
  max-height: calc(100vh - 5rem);
  min-height: 20rem;
  margin-top: 1.4rem;
  padding: 2.5rem 2rem 3rem;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 34%, var(--vp-c-bg));
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  scroll-padding: 40vh 40vw;
}

.sensor-selector__tree-zoom {
  width: max-content;
  min-width: 100%;
  zoom: var(--sensor-tree-zoom);
  transition: zoom 220ms ease;
}

.sensor-selector__tree-zoom.is-transitioning {
  animation: sensor-tree-soft-transition 280ms ease both;
}

@keyframes sensor-tree-soft-transition {
  from {
    opacity: 0.58;
  }

  to {
    opacity: 1;
  }
}

.sensor-selector__tree {
  display: grid;
  width: max-content;
  min-width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sensor-selector__overview:fullscreen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  padding: clamp(1rem, 3vw, 3rem);
  overflow: hidden;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.sensor-selector__overview:fullscreen .sensor-selector__overview-header {
  flex: 0 0 auto;
}

.sensor-selector__overview:fullscreen .sensor-selector__tree-wrap {
  flex: 1 1 auto;
  min-height: 0;
  height: auto;
  max-height: none;
}

.sensor-selector button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

@media (max-width: 700px) {
  .sensor-selector {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    padding-right: 0.75rem;
    padding-left: 0.75rem;
  }

  .sensor-selector__step-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .sensor-selector__workspace-header,
  .sensor-selector__overview-header {
    display: grid;
    min-width: 0;
  }

  .sensor-selector__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    justify-content: start;
    gap: 0.5rem;
  }

  .sensor-selector__text-button,
  .sensor-selector__primary-button {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .sensor-selector__primary-button {
    grid-column: 1 / -1;
  }

  .sensor-selector__overview-meta {
    min-width: 0;
    text-align: left;
  }

  .sensor-selector__overview-path {
    overflow-wrap: anywhere;
  }

  .sensor-selector__overview-tools {
    align-items: stretch;
  }

  .sensor-selector__zoom-control,
  .sensor-selector__fullscreen-button {
    width: 100%;
  }

  .sensor-selector__zoom-control {
    justify-content: center;
  }

  .sensor-selector__fullscreen-button {
    justify-content: center;
  }

  .sensor-selector__tree {
    padding-right: clamp(4rem, 36vw, 10rem);
    padding-left: clamp(4rem, 36vw, 10rem);
  }

  .sensor-selector__flow-viewport {
    overflow-x: hidden;
    box-sizing: border-box;
    width: 100%;
    min-height: 0;
    padding: 1.25rem 0;
  }

  .sensor-selector__flow-track {
    width: 100%;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 1.75rem;
  }

  .sensor-selector__flow-column {
    width: 100%;
    min-width: 0;
    justify-content: center;
  }

  .sensor-selector__flow-column.has-next-node::after {
    top: 100%;
    right: auto;
    left: 50%;
    width: 0;
    height: 1.75rem;
    border-top: 0;
    border-left: 2px solid var(--sensor-line);
    transform: translateX(-1px);
  }

  .sensor-selector__flow-node,
  .sensor-selector__flow-choice {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    max-width: none;
    border-radius: 0.75rem;
  }

  .sensor-selector__flow-choice strong {
    overflow-wrap: anywhere;
  }

  .sensor-selector__flow-choices {
    position: relative;
    width: min(calc(100% - 2.5rem), 22rem);
    min-height: 0;
    margin: 0 0 0 clamp(1.5rem, 12vw, 3.5rem);
    gap: 1rem;
    padding: 1.5rem 0 0;
  }

  .sensor-selector__flow-choices::before {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sensor-selector__flow-viewport {
    transition: none;
    scroll-behavior: auto;
  }

  .sensor-selector__tree-zoom {
    transition: none;
  }

  .sensor-selector__tree-zoom.is-transitioning {
    animation: none;
  }
}
</style>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Option = { value: string; label: string }

const props = defineProps<{
  id: string
  label: string
  modelValue: string
  options: Option[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const listbox = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const activeIndex = ref(-1)
const opensAbove = ref(false)
const listboxMaxHeight = ref<number>()
let typeahead = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined

const selectedOption = computed(
  () => props.options.find((option) => option.value === props.modelValue),
)
const listboxId = computed(() => `${props.id}-listbox`)
const activeOptionId = computed(() =>
  isOpen.value && activeIndex.value >= 0
    ? `${props.id}-option-${activeIndex.value}`
    : undefined,
)

function initialIndex() {
  const selected = props.options.findIndex((option) => option.value === props.modelValue)
  return selected >= 0 ? selected : props.options.length ? 0 : -1
}

function openList() {
  if (!props.options.length) return
  activeIndex.value = initialIndex()
  isOpen.value = true
}

function closeList(commit = false) {
  if (commit && activeIndex.value >= 0) {
    const option = props.options[activeIndex.value]
    if (option && option.value !== props.modelValue) emit('update:modelValue', option.value)
  }
  isOpen.value = false
  activeIndex.value = -1
  clearTypeahead()
}

function moveActive(next: number) {
  if (!props.options.length) return
  activeIndex.value = Math.max(0, Math.min(props.options.length - 1, next))
}

function handleKeydown(event: KeyboardEvent) {
  if (event.isComposing || event.ctrlKey || event.metaKey) return
  if (event.altKey) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (event.key === 'ArrowDown' && !isOpen.value) openList()
      if (event.key === 'ArrowUp' && isOpen.value) closeList(true)
    }
    return
  }

  if (event.key === 'Tab') {
    if (isOpen.value) closeList(true)
    return
  }

  if (event.key === 'Escape') {
    if (isOpen.value) {
      event.preventDefault()
      closeList()
    }
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isOpen.value) openList()
    else moveActive(activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1))
    return
  }

  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    if (!isOpen.value) openList()
    if (props.options.length) moveActive(event.key === 'Home' ? 0 : props.options.length - 1)
    return
  }

  if (isOpen.value && (event.key === 'PageDown' || event.key === 'PageUp')) {
    event.preventDefault()
    moveActive(activeIndex.value + (event.key === 'PageDown' ? 10 : -10))
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (!isOpen.value) openList()
    else closeList(true)
    return
  }

  if (event.key.length === 1 && !event.isComposing) {
    event.preventDefault()
    searchByTypeahead(event.key)
  }
}

function searchByTypeahead(character: string) {
  if (!props.options.length) return
  const normalized = character.toLocaleLowerCase()
  const repeated = typeahead.length > 0 && [...typeahead].every((char) => char === normalized)
  typeahead = repeated ? normalized : typeahead + normalized
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
  typeaheadTimer = setTimeout(clearTypeahead, 700)

  const start = isOpen.value ? activeIndex.value : initialIndex()
  for (let offset = 1; offset <= props.options.length; offset += 1) {
    const index = (start + offset) % props.options.length
    if (props.options[index].label.toLocaleLowerCase().startsWith(typeahead)) {
      if (!isOpen.value) isOpen.value = true
      activeIndex.value = index
      return
    }
  }
}

function clearTypeahead() {
  typeahead = ''
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
  typeaheadTimer = undefined
}

function handleOutsidePointer(event: PointerEvent) {
  if (isOpen.value && !root.value?.contains(event.target as Node)) closeList()
}

function updateListboxPlacement() {
  const triggerRect = trigger.value?.getBoundingClientRect()
  if (!triggerRect) return

  const preferredMax = Math.min(320, window.innerHeight * 0.45)
  const availableBelow = Math.max(0, window.innerHeight - triggerRect.bottom - 8)
  const availableAbove = Math.max(0, triggerRect.top - 8)
  opensAbove.value = availableBelow < preferredMax && availableAbove > availableBelow
  listboxMaxHeight.value = Math.max(
    0,
    Math.min(preferredMax, opensAbove.value ? availableAbove : availableBelow),
  )
}

watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    if (!isOpen.value) return
    updateListboxPlacement()
    window.addEventListener('resize', updateListboxPlacement)
    window.addEventListener('scroll', updateListboxPlacement, true)
    return
  }

  window.removeEventListener('resize', updateListboxPlacement)
  window.removeEventListener('scroll', updateListboxPlacement, true)
  opensAbove.value = false
  listboxMaxHeight.value = undefined
})

function handleFocusOut(event: FocusEvent) {
  if (isOpen.value && !root.value?.contains(event.relatedTarget as Node | null)) closeList(true)
}

function handleOptionClick(index: number) {
  activeIndex.value = index
  closeList(true)
  trigger.value?.focus()
}

watch(
  () => [props.modelValue, props.options] as const,
  () => {
    if (isOpen.value) activeIndex.value = initialIndex()
  },
)

watch([isOpen, activeIndex, listboxMaxHeight], () => {
  const panel = listbox.value
  const option = panel?.children[activeIndex.value] as HTMLElement | undefined
  if (!panel || !option) return
  if (option.offsetTop < panel.scrollTop) panel.scrollTop = option.offsetTop
  else if (option.offsetTop + option.offsetHeight > panel.scrollTop + panel.clientHeight) {
    panel.scrollTop = option.offsetTop + option.offsetHeight - panel.clientHeight
  }
}, { flush: 'post' })

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsidePointer)
  window.removeEventListener('resize', updateListboxPlacement)
  window.removeEventListener('scroll', updateListboxPlacement, true)
  clearTypeahead()
})
</script>

<template>
  <div ref="root" class="directory-select" @focusout="handleFocusOut">
    <button
      :id="id"
      ref="trigger"
      class="directory-select__trigger"
      type="button"
      role="combobox"
      :aria-label="label"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      aria-haspopup="listbox"
      :aria-activedescendant="activeOptionId"
      @click="isOpen ? closeList() : openList()"
      @keydown="handleKeydown"
    >
      <span class="directory-select__value">{{ selectedOption?.label ?? modelValue }}</span>
      <svg class="directory-select__chevron" aria-hidden="true" viewBox="0 0 16 16">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      ref="listbox"
      :id="listboxId"
      class="directory-select__listbox"
      :class="{ 'is-above': opensAbove }"
      :style="{ maxHeight: listboxMaxHeight === undefined ? undefined : `${listboxMaxHeight}px` }"
      role="listbox"
      :aria-label="label"
    >
      <div
        v-for="(option, index) in options"
        :id="`${id}-option-${index}`"
        :key="option.value"
        class="directory-select__option"
        :class="{
          'is-active': index === activeIndex,
          'is-selected': option.value === modelValue,
        }"
        role="option"
        :aria-selected="option.value === modelValue"
        @pointerdown.prevent
        @pointermove="activeIndex = index"
        @click="handleOptionClick(index)"
      >
        <span class="directory-select__option-label">{{ option.label }}</span>
        <svg
          v-if="option.value === modelValue"
          class="directory-select__check"
          aria-hidden="true"
          viewBox="0 0 16 16"
        >
          <path d="m3 8 3.2 3.2L13 4.5" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.directory-select {
  position: relative;
  width: 100%;
  min-width: 0;
  color: var(--vp-c-text-1);
}

.directory-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  min-width: 0;
  min-height: 46px;
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.directory-select__trigger:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.directory-select__value {
  min-width: 0;
  overflow-wrap: anywhere;
}

.directory-select__chevron,
.directory-select__check {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.directory-select__chevron {
  color: var(--vp-c-text-2);
}

.directory-select__listbox {
  position: absolute;
  z-index: 30;
  top: calc(100% + 2px);
  left: 0;
  width: 100%;
  min-width: 0;
  max-height: min(320px, 45vh);
  overflow-y: auto;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.directory-select__listbox.is-above {
  top: auto;
  bottom: calc(100% + 2px);
}

.directory-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
  min-height: 44px;
  padding: 0.65rem 0.8rem;
  cursor: pointer;
  overflow-wrap: anywhere;
}

.directory-select__option-label {
  min-width: 0;
  overflow-wrap: anywhere;
}

.directory-select__option.is-active {
  background: var(--vp-c-bg-soft);
}

.directory-select__option.is-selected {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.directory-select__check {
  color: var(--vp-c-brand-1);
}
</style>

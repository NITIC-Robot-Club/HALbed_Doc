import { computed, onBeforeUnmount, ref } from 'vue'
import type { Ref } from 'vue'
import type { ControlState, SimulationConfig, SimulationMetrics, SimulationSample } from './types'
import { analyzeResponse } from './utils'

interface RunnerOptions {
  config: Ref<SimulationConfig>
  initialState: () => ControlState
  step: (state: ControlState) => {
    state: ControlState
    controlInput: number
    sample: SimulationSample
  }
  requireLowVelocity?: boolean
}

export function useSimulationRunner(options: RunnerOptions) {
  const state = ref<ControlState>(options.initialState())
  const samples = ref<SimulationSample[]>([])
  const isRunning = ref(false)
  const controlInput = ref(0)
  const timerId = ref<number | null>(null)

  const metrics = computed<SimulationMetrics>(() =>
    analyzeResponse(samples.value, options.config.value, options.requireLowVelocity ?? false),
  )

  function tick(): void {
    if (samples.value.length >= options.config.value.maxSteps) {
      stop()
      return
    }

    const result = options.step(state.value)
    state.value = result.state
    controlInput.value = result.controlInput
    samples.value = [...samples.value, result.sample]
  }

  function start(): void {
    if (isRunning.value) {
      return
    }

    isRunning.value = true
    timerId.value = window.setInterval(() => {
      tick()
      if (samples.value.length >= options.config.value.maxSteps || metrics.value.converged) {
        stop()
      }
    }, Math.max(options.config.value.dt * 1000, 16))
  }

  function stop(): void {
    isRunning.value = false
    if (timerId.value !== null) {
      window.clearInterval(timerId.value)
      timerId.value = null
    }
  }

  function reset(nextState?: ControlState): void {
    stop()
    state.value = nextState ?? options.initialState()
    samples.value = []
    controlInput.value = 0
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    state,
    samples,
    isRunning,
    controlInput,
    metrics,
    start,
    stop,
    reset,
    tick,
  }
}

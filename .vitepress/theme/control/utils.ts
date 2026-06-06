import type {
  ControlState,
  SimulationConfig,
  SimulationMetrics,
  SimulationSample,
} from './types'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

export function createInitialState(target = 1): ControlState {
  return {
    position: 0,
    velocity: 0,
    acceleration: 0,
    target,
    time: 0,
    error: target,
    integral: 0,
  }
}

export function buildSample(state: ControlState, controlInput: number): SimulationSample {
  return {
    time: state.time,
    target: state.target,
    value: state.position,
    controlInput,
    error: state.error,
    velocity: state.velocity,
  }
}

export function analyzeResponse(
  samples: SimulationSample[],
  config: SimulationConfig,
  requireLowVelocity = false,
): SimulationMetrics {
  if (samples.length === 0) {
    return {
      overshoot: 0,
      settlingTime: null,
      converged: false,
      peakError: 0,
    }
  }

  const target = samples[samples.length - 1]?.target ?? 0
  const amplitudeBase = Math.max(Math.abs(target), 1)
  const tolerance = amplitudeBase * config.toleranceRatio
  const settleWindow = Math.max(8, Math.ceil(Math.min(samples.length, 0.6 / Math.max(config.dt, 1e-6))))

  let maxValue = -Infinity
  let minValue = Infinity
  let peakError = 0
  for (const sample of samples) {
    maxValue = Math.max(maxValue, sample.value)
    minValue = Math.min(minValue, sample.value)
    peakError = Math.max(peakError, Math.abs(sample.error))
  }

  let settlingTime: number | null = null
  for (let index = 0; index <= samples.length - settleWindow; index += 1) {
    const window = samples.slice(index, index + settleWindow)
    const settled = window.every((sample) => {
      const withinPosition = Math.abs(sample.value - sample.target) <= tolerance
      const withinVelocity = !requireLowVelocity || Math.abs(sample.velocity ?? 0) <= 0.05 * amplitudeBase
      return withinPosition && withinVelocity
    })

    if (settled) {
      settlingTime = samples[index]?.time ?? null
      break
    }
  }

  const lastSample = samples[samples.length - 1]
  const overshoot =
    target >= 0
      ? Math.max(0, maxValue - target)
      : Math.max(0, target - minValue)
  const converged =
    Math.abs(lastSample.value - lastSample.target) <= tolerance &&
    (!requireLowVelocity || Math.abs(lastSample.velocity ?? 0) <= 0.05 * amplitudeBase) &&
    settlingTime !== null &&
    overshoot <= tolerance * 0.25 &&
    samples.length <= config.maxSteps

  return {
    overshoot,
    settlingTime,
    converged,
    peakError,
  }
}

export function makeDisturbance(level: number): number {
  const sign = Math.random() > 0.5 ? 1 : -1
  return sign * level
}

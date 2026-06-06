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
  const settleWindow = Math.max(10, Math.ceil(Math.min(samples.length, 1.2 / Math.max(config.dt, 1e-6))))

  let maxValue = -Infinity
  let minValue = Infinity
  let peakError = 0
  for (const sample of samples) {
    maxValue = Math.max(maxValue, sample.value)
    minValue = Math.min(minValue, sample.value)
    peakError = Math.max(peakError, Math.abs(sample.error))
  }

  function isWithinBand(sample: SimulationSample): boolean {
    const withinPosition = Math.abs(sample.value - sample.target) <= tolerance
    const withinVelocity = !requireLowVelocity || Math.abs(sample.velocity ?? 0) <= 0.12 * amplitudeBase
    return withinPosition && withinVelocity
  }

  let stableRunLength = 0
  for (let index = samples.length - 1; index >= 0; index -= 1) {
    if (!isWithinBand(samples[index])) {
      break
    }
    stableRunLength += 1
  }

  const settlingTime =
    stableRunLength >= settleWindow
      ? samples[samples.length - stableRunLength]?.time ?? null
      : null

  const lastSample = samples[samples.length - 1]
  const overshoot =
    target >= 0
      ? Math.max(0, maxValue - target)
      : Math.max(0, target - minValue)
  const converged =
    isWithinBand(lastSample) &&
    settlingTime !== null &&
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

export function sampleRandomDisturbance(enabled: boolean, amplitude: number): number {
  if (!enabled) {
    return 0
  }

  return (Math.random() * 2 - 1) * amplitude
}

export type Numeric = number

export interface ControlState {
  position: number
  velocity: number
  acceleration: number
  target: number
  time: number
  error: number
  integral: number
}

export interface SimulationSample {
  time: number
  target: number
  value: number
  controlInput: number
  error: number
  velocity?: number
}

export interface SimulationResult {
  state: ControlState
  controlInput: number
  sample: SimulationSample
}

export interface SimulationMetrics {
  overshoot: number
  settlingTime: number | null
  converged: boolean
  peakError: number
}

export interface SimulationConfig {
  dt: number
  maxSteps: number
  toleranceRatio: number
}

export interface PidGains {
  kp: number
  ki: number
  kd: number
}

export interface PidBreakdown {
  proportional: number
  integral: number
  derivative: number
  rawOutput: number
  output: number
}

export interface InterpreterState {
  position: number
  velocity: number
  acceleration: number
  target: number
  time: number
  error: number
  integral: number
}

export interface InterpreterSuccess {
  ok: true
  value: number
  steps: number
}

export interface InterpreterFailure {
  ok: false
  error: string
  steps: number
}

export type InterpreterResult = InterpreterSuccess | InterpreterFailure

export interface ControllerExecution {
  ok: boolean
  controlInput: number
  error?: string
}

export type ControllerMode = 'pid' | 'code'

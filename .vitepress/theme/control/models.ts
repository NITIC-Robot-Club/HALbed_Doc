import type { ControlState, SimulationResult } from './types'
import { buildSample, clamp } from './utils'

export interface FirstOrderModelOptions {
  gain: number
  timeConstant: number
  disturbance?: number
}

export interface MotorSpeedModelOptions {
  torqueGain: number
  inertia: number
  friction: number
  load: number
  disturbance?: number
}

export interface PositionModelOptions {
  driveGain: number
  damping: number
  stiffness: number
  disturbance?: number
}

export interface CartModelOptions {
  motorGain: number
  damping: number
  friction: number
  disturbance?: number
}

export function stepFirstOrderModel(
  state: ControlState,
  controlInput: number,
  dt: number,
  options: FirstOrderModelOptions,
): SimulationResult {
  const u = clamp(controlInput, -1, 1)
  const disturbance = options.disturbance ?? 0
  const valueRate = (options.gain * u + disturbance - state.position) / Math.max(options.timeConstant, 0.01)
  const position = state.position + valueRate * dt
  const nextState: ControlState = {
    ...state,
    position,
    velocity: valueRate,
    acceleration: (valueRate - state.velocity) / Math.max(dt, 1e-6),
    time: state.time + dt,
    error: state.target - position,
    integral: state.integral + (state.target - position) * dt,
  }

  return {
    state: nextState,
    controlInput: u,
    sample: buildSample(nextState, u),
  }
}

export function stepMotorSpeedModel(
  state: ControlState,
  controlInput: number,
  dt: number,
  options: MotorSpeedModelOptions,
): SimulationResult {
  const u = clamp(controlInput, -1, 1)
  const disturbance = options.disturbance ?? 0
  const acceleration =
    (options.torqueGain * u - options.friction * state.position - options.load + disturbance) /
    Math.max(options.inertia, 0.05)
  const speed = state.position + acceleration * dt
  const nextState: ControlState = {
    ...state,
    position: speed,
    velocity: acceleration,
    acceleration: (acceleration - state.velocity) / Math.max(dt, 1e-6),
    time: state.time + dt,
    error: state.target - speed,
    integral: state.integral + (state.target - speed) * dt,
  }

  return {
    state: nextState,
    controlInput: u,
    sample: buildSample(nextState, u),
  }
}

export function stepPositionModel(
  state: ControlState,
  controlInput: number,
  dt: number,
  options: PositionModelOptions,
): SimulationResult {
  const u = clamp(controlInput, -1, 1)
  const disturbance = options.disturbance ?? 0
  const acceleration =
    options.driveGain * u -
    options.damping * state.velocity -
    options.stiffness * state.position +
    disturbance
  const velocity = state.velocity + acceleration * dt
  const position = state.position + velocity * dt
  const nextState: ControlState = {
    ...state,
    position,
    velocity,
    acceleration,
    time: state.time + dt,
    error: state.target - position,
    integral: state.integral + (state.target - position) * dt,
  }

  return {
    state: nextState,
    controlInput: u,
    sample: buildSample(nextState, u),
  }
}

export function stepCartModel(
  state: ControlState,
  controlInput: number,
  dt: number,
  options: CartModelOptions,
): SimulationResult {
  const u = clamp(controlInput, -1, 1)
  const disturbance = options.disturbance ?? 0
  const frictionForce = Math.sign(state.velocity) * options.friction
  const acceleration = options.motorGain * u - options.damping * state.velocity - frictionForce + disturbance
  const velocity = state.velocity + acceleration * dt
  const position = state.position + velocity * dt
  const nextState: ControlState = {
    ...state,
    position,
    velocity,
    acceleration,
    time: state.time + dt,
    error: state.target - position,
    integral: state.integral + (state.target - position) * dt,
  }

  return {
    state: nextState,
    controlInput: u,
    sample: buildSample(nextState, u),
  }
}

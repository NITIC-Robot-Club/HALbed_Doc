import type { ControlState, PidBreakdown, PidGains } from './types'
import { clamp } from './utils'

export class PidController {
  private previousError = 0

  private integral = 0

  reset(): void {
    this.previousError = 0
    this.integral = 0
  }

  update(state: ControlState, gains: PidGains, dt: number): PidBreakdown {
    const error = state.target - state.position
    this.integral += error * dt
    const derivative = dt > 0 ? (error - this.previousError) / dt : 0
    this.previousError = error

    const proportional = gains.kp * error
    const integral = gains.ki * this.integral
    const differential = gains.kd * derivative
    const output = clamp(proportional + integral + differential, -1, 1)

    return {
      proportional,
      integral,
      derivative: differential,
      output,
    }
  }

  getIntegral(): number {
    return this.integral
  }
}

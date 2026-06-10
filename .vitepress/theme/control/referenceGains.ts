import type { PidGains } from './types'
import { clamp } from './utils'

export interface ReferenceGainPreset {
  gains: PidGains
  explanation: string
}

interface FirstOrderTuningOptions {
  plantGain: number
  timeConstant: number
  settlingTime: number
}

function formatGains(gains: PidGains, digits: 3): string {
  return `P ${gains.kp.toFixed(digits)} / I ${gains.ki.toFixed(digits)} / D ${gains.kd.toFixed(digits)}`
}

function tuneFirstOrderPlant(options: FirstOrderTuningOptions): ReferenceGainPreset {
  const dampingRatio = 1.05
  const normalizedSettling = Math.max(options.settlingTime, 0.4)
  const naturalFrequency = 4 / (dampingRatio * normalizedSettling)
  const proportional = (2 * dampingRatio * naturalFrequency * options.timeConstant - 1) / options.plantGain
  const integral = (naturalFrequency * naturalFrequency * options.timeConstant) / options.plantGain

  const gains: PidGains = {
    kp: clamp(proportional, 0.02 / options.plantGain, 20),
    ki: clamp(integral, 0.001 / options.plantGain, 20),
    kd: 0,
  }

  return {
    gains,
    explanation: `一次遅れモデル K=${options.plantGain}, τ=${options.timeConstant} から PI を逆算します。${formatGains(gains)} を基準にします。`,
  }
}

export function getPlaygroundReferenceGains(target: number): ReferenceGainPreset {
  const targetScale = clamp(Math.abs(target) / 1.8, 0.75, 1.35)
  const tuned = tuneFirstOrderPlant({
    plantGain: 1.35,
    timeConstant: 0.55,
    settlingTime: clamp(2.8 * targetScale, 2.0, 3.8),
  })

  return {
    gains: {
      kp: clamp(tuned.gains.kp * targetScale, 0.02, 20),
      ki: clamp(tuned.gains.ki * targetScale, 0.001, 20),
      kd: 0,
    },
    explanation: `${tuned.explanation} 目標の大きさに応じて少しだけ強さを変えます。`,
  }
}

export function getMotorSpeedReferenceGains(target: number, load: number): ReferenceGainPreset {
  const loadScale = clamp(1 + load / 12000, 1, 1.18)
  const targetScale = clamp(Math.abs(target) / 5000, 0.7, 1.3)
  const tuned = tuneFirstOrderPlant({
    plantGain: 6200,
    timeConstant: 0.58,
    settlingTime: clamp(2.4 * loadScale / targetScale, 1.8, 4.2),
  })

  return {
    gains: {
      kp: clamp(tuned.gains.kp * loadScale * targetScale, 0.000001, 0.01),
      ki: clamp(tuned.gains.ki * loadScale, 0.000001, 0.02),
      kd: 0,
    },
    explanation: `回転数制御も一次遅れモデル K=6200, τ=0.58 から PI を逆算します。負荷と目標値の大きさを少し反映して ${formatGains({
      kp: tuned.gains.kp * loadScale * targetScale,
      ki: tuned.gains.ki * loadScale,
      kd: 0,
    }, 6)} を基準にします。`,
  }
}

export function getPositionReferenceGains(target: number): ReferenceGainPreset {
  const driveGain = 2.5
  const stiffness = 0.08
  const gravity = 1.2
  const targetMagnitude = Math.max(Math.abs(target), 0.5)
  const holdInput = (gravity + stiffness * targetMagnitude) / driveGain

  const gains: PidGains = {
    kp: clamp(holdInput * 1.05, 0.35, 1.5),
    ki: clamp(holdInput * 0.22, 0.03, 0.45),
    kd: clamp(holdInput * 0.28, 0.04, 0.55),
  }

  return {
    gains,
    explanation: `重力を打ち消す分を見込みつつ、P で押し返し、D で振動を抑えます。${formatGains(gains)} が目安です。`,
  }
}

import { ref } from 'vue'

export type TorqueUnit = 'N·m' | 'kgf·cm' | 'kgf·m' | 'lbf·ft'
export type SpeedUnit = 'rpm' | 'rps' | 'rad/s'
export type ForceUnit = 'N' | 'kN'
export type LengthUnit = 'm' | 'cm' | 'mm'
export type PowerUnit = 'W' | 'kW' | 'hp'

export const torqueUnitMultipliers: Record<TorqueUnit, number> = {
  'N·m': 1,
  'kgf·cm': 0.0980665,
  'kgf·m': 9.80665,
  'lbf·ft': 1.3558179483314004,
}

export const speedUnitMultipliers: Record<SpeedUnit, number> = {
  rpm: Math.PI / 30,
  rps: 2 * Math.PI,
  'rad/s': 1,
}

export const forceUnitMultipliers: Record<ForceUnit, number> = {
  N: 1,
  kN: 1_000,
}

export const lengthUnitMultipliers: Record<LengthUnit, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
}

export const powerUnitMultipliers: Record<PowerUnit, number> = {
  W: 1,
  kW: 1_000,
  hp: 745.6998715822702,
}

export function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

export function formatNumber(value: number, digits = 6): string {
  if (!Number.isFinite(value)) {
    return '-'
  }

  const rounded = Number(value.toFixed(digits))
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toString()
}

export function toTorqueNm(value: number, unit: TorqueUnit): number {
  return isFiniteNumber(value) ? value * torqueUnitMultipliers[unit] : Number.NaN
}

export function toRadPerSec(value: number, unit: SpeedUnit): number {
  return isFiniteNumber(value) ? value * speedUnitMultipliers[unit] : Number.NaN
}

export function toWatt(value: number, unit: PowerUnit): number {
  return isFiniteNumber(value) ? value * powerUnitMultipliers[unit] : Number.NaN
}

export function toNewton(value: number, unit: ForceUnit): number {
  return isFiniteNumber(value) ? value * forceUnitMultipliers[unit] : Number.NaN
}

export function toMeter(value: number, unit: LengthUnit): number {
  return isFiniteNumber(value) ? value * lengthUnitMultipliers[unit] : Number.NaN
}

export function formatTorqueNm(value: number): string {
  return `${formatNumber(value, 6)} N·m`
}

export function formatSpeedRpm(value: number): string {
  return `${formatNumber(value / speedUnitMultipliers.rpm, 6)} rpm`
}

export function formatPowerW(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${formatNumber(value / powerUnitMultipliers.hp, 6)} hp`
  }

  if (Math.abs(value) >= 1_000) {
    return `${formatNumber(value / 1_000, 6)} kW`
  }

  return `${formatNumber(value, 6)} W`
}

export function useCopyLabel() {
  const copied = ref('')

  async function copy(value: string, label = value): Promise<void> {
    if (!value) {
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      copied.value = label
      window.setTimeout(() => {
        if (copied.value === label) {
          copied.value = ''
        }
      }, 1200)
    } catch {
      copied.value = ''
    }
  }

  return { copied, copy }
}

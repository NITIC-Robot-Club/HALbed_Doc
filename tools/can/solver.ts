import {
  bxCanProfile,
  DEFAULT_RESULT_LIMIT,
} from './constants'
import type {
  CanBitTimingCandidate,
  CanBitTimingInput,
  CanBitTimingResult,
  TimingProfile,
} from './types'

function assertFinitePositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a finite positive number`)
  }
}

function formatCubeMxConfig(candidate: CanBitTimingCandidate): string {
  return [
    `hcan.Init.Prescaler = ${candidate.prescaler};`,
    `hcan.Init.SyncJumpWidth = CAN_SJW_${candidate.sjw}TQ;`,
    `hcan.Init.TimeSeg1 = CAN_BS1_${candidate.tseg1}TQ;`,
    `hcan.Init.TimeSeg2 = CAN_BS2_${candidate.tseg2}TQ;`,
  ].join('\n')
}

function compareCandidates(
  left: CanBitTimingCandidate,
  right: CanBitTimingCandidate,
): number {
  return (
    left.score - right.score ||
    left.bitrateErrorPercent - right.bitrateErrorPercent ||
    left.samplePointErrorPercent - right.samplePointErrorPercent ||
    left.prescaler - right.prescaler ||
    left.tseg1 - right.tseg1 ||
    left.tseg2 - right.tseg2
  )
}

export function solveCanBitTiming(
  input: CanBitTimingInput,
  resultLimit: number = DEFAULT_RESULT_LIMIT,
  profile: TimingProfile = bxCanProfile,
): CanBitTimingResult {
  assertFinitePositive(input.clockMHz, 'clockMHz')
  assertFinitePositive(input.bitrateKbps, 'bitrateKbps')
  assertFinitePositive(input.samplePointPercent, 'samplePointPercent')
  assertFinitePositive(input.sjw, 'sjw')

  if (input.sjw < profile.sjwMin || input.sjw > profile.sjwMax) {
    throw new Error(`sjw must be between ${profile.sjwMin} and ${profile.sjwMax}`)
  }

  if (!Number.isInteger(resultLimit) || resultLimit <= 0) {
    throw new Error('resultLimit must be a positive integer')
  }

  const candidates: CanBitTimingCandidate[] = []

  for (
    let prescaler = profile.prescalerMin;
    prescaler <= profile.prescalerMax;
    prescaler += 1
  ) {
    for (let tseg1 = profile.tseg1Min; tseg1 <= profile.tseg1Max; tseg1 += 1) {
      for (let tseg2 = profile.tseg2Min; tseg2 <= profile.tseg2Max; tseg2 += 1) {
        if (input.sjw > tseg2) {
          continue
        }

        const timeQuanta = 1 + tseg1 + tseg2
        const bitrateKbps = input.clockMHz * 1000 / (prescaler * timeQuanta)
        const samplePointPercent = ((1 + tseg1) / timeQuanta) * 100
        const timeQuantumNs = prescaler / input.clockMHz * 1000
        const bitrateErrorPercent =
          Math.abs(input.bitrateKbps - bitrateKbps) / input.bitrateKbps * 100
        const samplePointErrorPercent =
          Math.abs(input.samplePointPercent - samplePointPercent)
        const score =
          Math.abs(input.bitrateKbps - bitrateKbps) * 10 + samplePointErrorPercent

        const candidate: CanBitTimingCandidate = {
          prescaler,
          tseg1,
          tseg2,
          sjw: input.sjw,
          timeQuantumNs,
          bitrateKbps,
          samplePointPercent,
          bitrateErrorPercent,
          samplePointErrorPercent,
          score,
          cubeMxConfig: '',
        }

        candidate.cubeMxConfig = formatCubeMxConfig(candidate)
        candidates.push(candidate)
      }
    }
  }

  candidates.sort(compareCandidates)

  return {
    input,
    candidates: candidates.slice(0, resultLimit),
  }
}

export function solveCanBitTimingCandidates(
  input: CanBitTimingInput,
  resultLimit: number = DEFAULT_RESULT_LIMIT,
  profile: TimingProfile = bxCanProfile,
): CanBitTimingCandidate[] {
  return solveCanBitTiming(input, resultLimit, profile).candidates
}
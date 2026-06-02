export type CanTimingMode = 'bxcan' | 'fdcan-classic' | 'fdcan-fd'

export interface TimingProfile {
  prescalerMin: number
  prescalerMax: number
  tseg1Min: number
  tseg1Max: number
  tseg2Min: number
  tseg2Max: number
  sjwMin: number
  sjwMax: number
}

export interface CanBitTimingInput {
  clockMHz: number
  bitrateKbps: number
  samplePointPercent: number
  sjw: number
}

export interface CanBitTimingCandidate {
  prescaler: number
  tseg1: number
  tseg2: number
  sjw: number
  timeQuantumNs: number
  bitrateKbps: number
  samplePointPercent: number
  bitrateErrorPercent: number
  samplePointErrorPercent: number
  score: number
  cubeMxConfig: string
}

export interface CanBitTimingResult {
  input: CanBitTimingInput
  candidates: CanBitTimingCandidate[]
}
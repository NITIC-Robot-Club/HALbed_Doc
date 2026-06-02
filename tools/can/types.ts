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
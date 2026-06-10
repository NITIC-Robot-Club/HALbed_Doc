import { stepFirstOrderModel } from './models'
import { PidController } from './pid'
import type { PidGains, SimulationConfig, SimulationMetrics, SimulationSample } from './types'
import { analyzeResponse, clamp, createInitialState } from './utils'

export interface FritFirstOrderPlant {
  gain: number
  timeConstant: number
}

export interface FritTuneOptions {
  target: number
  plant: FritFirstOrderPlant
  config: Pick<SimulationConfig, 'dt' | 'maxSteps' | 'toleranceRatio'>
  currentGains: PidGains
}

export interface FritTuneResult {
  gains: PidGains
  loss: number
  metrics: SimulationMetrics
  explanation: string
}

interface EvaluationResult {
  gains: PidGains
  loss: number
  metrics: SimulationMetrics
  samples: SimulationSample[]
}

function simulateClosedLoop(
  target: number,
  plant: FritFirstOrderPlant,
  config: FritTuneOptions['config'],
  gains: PidGains,
): EvaluationResult {
  const controller = new PidController()
  const samples: SimulationSample[] = []
  let state = createInitialState(target)

  for (let step = 0; step < config.maxSteps; step += 1) {
    const breakdown = controller.update(state, gains, config.dt)
    const result = stepFirstOrderModel(state, breakdown.output, config.dt, {
      gain: plant.gain,
      timeConstant: plant.timeConstant,
      disturbance: 0,
    })

    state = result.state
    samples.push(result.sample)
  }

  const metrics = analyzeResponse(samples, config)
  return {
    gains,
    loss: evaluateLoss(samples, target, gains, metrics),
    metrics,
    samples,
  }
}

function evaluateLoss(
  samples: SimulationSample[],
  target: number,
  gains: PidGains,
  metrics: SimulationMetrics,
): number {
  const desiredTau = 0.35
  let trajectoryLoss = 0
  let effortLoss = 0
  let modelLoss = 0

  for (const sample of samples) {
    const desiredValue = target * (1 - Math.exp(-sample.time / desiredTau))
    const error = sample.value - desiredValue
    trajectoryLoss += error * error
    effortLoss += sample.controlInput * sample.controlInput
    modelLoss += Math.abs(sample.error)
  }

  const finalSample = samples[samples.length - 1]
  const finalError = finalSample ? Math.abs(finalSample.value - target) : Math.abs(target)
  const overshootPenalty = metrics.overshoot * metrics.overshoot
  const settlePenalty = metrics.converged ? 0 : 8
  const gainPenalty = 0.02 * gains.kp + 0.002 * gains.ki + 0.01 * gains.kd

  return trajectoryLoss * 0.12 + effortLoss * 0.01 + modelLoss * 0.08 + finalError * finalError * 14 + overshootPenalty * 10 + settlePenalty + gainPenalty
}

export function fritTuneFirstOrder(options: FritTuneOptions): FritTuneResult {
  const seed = clamp(options.currentGains.kp, 0.02, 20)
  let best: EvaluationResult = simulateClosedLoop(options.target, options.plant, options.config, {
    ...options.currentGains,
  })

  if (!Number.isFinite(best.loss)) {
    best = simulateClosedLoop(options.target, options.plant, options.config, {
      kp: seed,
      ki: Math.max(seed * 0.2, 0.001),
      kd: 0,
    })
  }

  const scalesByRound = [
    [0.5, 0.8, 1, 1.2, 1.5],
    [0.75, 0.9, 1, 1.1, 1.25],
    [0.85, 0.95, 1, 1.05, 1.15],
  ]

  let iterations = 0
  for (const scales of scalesByRound) {
    let improved = false
    const baseline = best.gains
    for (const kpScale of scales) {
      for (const kiScale of scales) {
        for (const kdScale of [0, 0.5, 1]) {
          iterations += 1
          const candidate: PidGains = {
            kp: clamp(baseline.kp * kpScale, 0.02 / options.plant.gain, 20),
            ki: clamp(baseline.ki * kiScale, 0.001 / options.plant.gain, 20),
            kd: clamp(baseline.kd * (kdScale === 0 ? 0 : kdScale), 0, 2),
          }
          const evaluation = simulateClosedLoop(options.target, options.plant, options.config, candidate)
          if (evaluation.loss < best.loss) {
            best = evaluation
            improved = true
          }
        }
      }
    }

    if (!improved) {
      break
    }
  }

  return {
    gains: best.gains,
    loss: best.loss,
    metrics: best.metrics,
    explanation: `FRIT風の1回応答ベース最適化で P=${best.gains.kp.toFixed(3)}, I=${best.gains.ki.toFixed(3)}, D=${best.gains.kd.toFixed(3)} に調整しました。`,
  }
}

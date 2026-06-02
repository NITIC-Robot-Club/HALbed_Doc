export const BXCAN_PRESCALER_MIN = 1
export const BXCAN_PRESCALER_MAX = 1024

export const BXCAN_TSEG1_MIN = 1
export const BXCAN_TSEG1_MAX = 16

export const BXCAN_TSEG2_MIN = 1
export const BXCAN_TSEG2_MAX = 8

export const BXCAN_SJW_MIN = 1
export const BXCAN_SJW_MAX = 4

export const bxCanProfile = {
	prescalerMin: BXCAN_PRESCALER_MIN,
	prescalerMax: BXCAN_PRESCALER_MAX,
	tseg1Min: BXCAN_TSEG1_MIN,
	tseg1Max: BXCAN_TSEG1_MAX,
	tseg2Min: BXCAN_TSEG2_MIN,
	tseg2Max: BXCAN_TSEG2_MAX,
	sjwMin: BXCAN_SJW_MIN,
	sjwMax: BXCAN_SJW_MAX,
} as const

export const fdcanNominalProfile = {
	prescalerMin: 1,
	prescalerMax: 512,
	tseg1Min: 1,
	tseg1Max: 256,
	tseg2Min: 1,
	tseg2Max: 128,
	sjwMin: 1,
	sjwMax: 128,
} as const

export const fdcanDataProfile = {
	prescalerMin: 1,
	prescalerMax: 32,
	tseg1Min: 1,
	tseg1Max: 32,
	tseg2Min: 1,
	tseg2Max: 16,
	sjwMin: 1,
	sjwMax: 16,
} as const

export const DEFAULT_CLOCK_MHZ = 80
export const DEFAULT_BITRATE_KBPS = 1000
export const DEFAULT_SAMPLE_POINT_PERCENT = 80
export const DEFAULT_SJW = 1

export const DEFAULT_RESULT_LIMIT = 20
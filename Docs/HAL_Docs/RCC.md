---
title: RCC・時刻 HAL API
---
# RCC・時刻 HAL API

## 概要

このページでは、クロックの取得・設定とHALのtick関数を扱います。

---

## 関数概要

<ApiSignature :signature="'HAL_StatusTypeDef HAL_Init(void);'" />

HALドライバーを初期化します。通常は`main()`の先頭で一度呼び出してください。その後、クロック、GPIO、ペリフェラルを設定します。

<ApiSignature :signature="'void HAL_IncTick(void);'" />

HALのtickカウンターを進めます。CubeMXが生成するSysTickハンドラーから呼び出されます。独自の時間基準を使わない場合は、この呼び出しを残してください。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_PWREx_ControlVoltageScaling(uint32_t VoltageScaling);'" />

内部レギュレーターの電圧スケールを設定します。クロックを上げる場合は、対象シリーズでその周波数に対応する設定を選び、クロック構成より先に適用してください。

<ApiSignature :signature="'void HAL_PWREx_DisableUCPDDeadBattery(void);'" />

UCPDのdead-batteryピンにある内部プルアップを無効にします。UCPD対応MCUでは、CubeMXがMSP初期化にこの呼び出しを生成する場合があります。ピンや電源設計に関わるため、削除する前にMCUと基板の回路を確認してください。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_RCC_OscConfig(const RCC_OscInitTypeDef *RCC_OscInitStruct);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_RCC_ClockConfig( const RCC_ClkInitTypeDef *RCC_ClkInitStruct, uint32_t FLatency);'" />

`HAL_RCC_OscConfig()`は発振器とPLLを設定します。`HAL_RCC_ClockConfig()`はSYSCLK、AHB、APBのクロック源と分周比を設定し、Flash wait stateを適用します。通常はCubeMXが生成する`SystemClock_Config()`から呼び出します。戻り値が`HAL_OK`以外なら、クロック設定の失敗として処理してください。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_RCCEx_PeriphCLKConfig( const RCC_PeriphCLKInitTypeDef *PeriphClkInit);'" />

FDCAN、USB、UARTなどのクロック源を設定します。選べるペリフェラルやクロック源はシリーズごとに異なります。CubeMXが生成した`RCC_PeriphCLKInitTypeDef`と対象シリーズのHALヘッダを確認してください。

<ApiSignature :signature="'__HAL_RCC_GPIOA_CLK_ENABLE();'" />

<ApiSignature :signature="'__HAL_RCC_FDCAN_CLK_ENABLE();'" />

<ApiSignature :signature="'__HAL_RCC_TIM2_CLK_DISABLE();'" />

ペリフェラルのバスクロックを有効または無効にするHALマクロです。GPIOやタイマのレジスタへアクセスする前に、対応するクロックを有効にしてください。マクロ名はMCUシリーズごとに異なります。通常はCubeMXが生成するMSP Init/DeInitで管理します。

<ApiSignature :signature="'void HAL_RCC_GetClockConfig( RCC_ClkInitTypeDef *RCC_ClkInitStruct, uint32_t *pFlashLatency);'" />

現在のAHB/APB分周設定とFlash latencyを取得する。APBタイマクロックの計算で `APB1CLKDivider`、`APB2CLKDivider` を参照する。

<ApiSignature :signature="'uint32_t HAL_RCC_GetPCLK1Freq(void);'" />

<ApiSignature :signature="'uint32_t HAL_RCC_GetPCLK2Freq(void);'" />

APB1またはAPB2のペリフェラルクロック周波数をHzで返す。

APBプリスケーラが1以外の場合、STM32のタイマクロックはPCLKの2倍になるシリーズがある。タイマの実クロックを求めるときは、`RCC_ClkInitTypeDef` の分周値も確認する。

<ApiSignature :signature="'uint32_t HAL_RCC_GetHCLKFreq(void);'" />

AHBクロック（HCLK）の周波数をHzで返します。CPUやAPBの周波数を求める場合は、クロックツリーと分周設定も確認してください。

<ApiSignature :signature="'uint32_t HAL_GetTick(void);'" />

HALの起動後経過時間をmsで返す。

<ApiSignature :signature="'void HAL_Delay(uint32_t Delay);'" />

指定msだけ待つ。

---

## クロック設定構造体

### `RCC_OscInitTypeDef` {#type-rcc-oscinittype-def}

発振器とPLLの有効状態、クロック源、分周設定などを `HAL_RCC_OscConfig()` へ渡します。

| メンバー | 内容 |
| --- | --- |
| `OscillatorType` | 設定対象にする発振器の選択ビット |
| `HSEState`、`LSEState` | 外部高速・低速発振器のON/OFFやバイパス状態 |
| `HSIState`、`HSICalibrationValue` | 内部高速発振器の状態と校正値 |
| `LSIState` | 内部低速発振器の状態 |
| `HSI48State` | 48MHz内部発振器の状態。搭載MCUのみ |
| `PLL` | PLLの有効状態、入力源、分周・逓倍値。次項の構造体 |

使える発振器やメンバーはMCUごとに異なります。未搭載の発振器項目は使わず、CubeMXのクロック画面と生成コードを基準にしてください。

### `RCC_PLLInitTypeDef` {#type-rcc-pllinittype-def}

`RCC_OscInitTypeDef.PLL`に入るPLL設定です。

| メンバー | 内容 |
| --- | --- |
| `PLLState` | PLLを有効・無効にするか |
| `PLLSource` | PLL入力に使う発振器 |
| `PLLM`、`PLLN` | 入力分周とVCO逓倍の設定 |
| `PLLP`、`PLLQ`、`PLLR` | PLL各出力の分周値。どの出力が使えるかはシリーズによる |

### `RCC_ClkInitTypeDef` {#type-rcc-clkinittype-def}

SYSCLK、AHB、APBのクロック源と分周設定を保持します。現在の設定取得にも使います。

### `RCC_PeriphCLKInitTypeDef` {#type-rcc-periphclkinittype-def}

ペリフェラルごとのクロック源と分周設定を `HAL_RCCEx_PeriphCLKConfig()` へ渡します。利用可能な項目はシリーズにより異なります。

STM32G4 HALの代表的なメンバーは次のとおりです。F4では同じ構造体名でも項目が異なります。

| メンバー | 対象ペリフェラル |
| --- | --- |
| `PeriphClockSelection` | 下記のうち変更するクロック選択の指定 |
| `Usart1ClockSelection`、`Usart2ClockSelection`、`Usart3ClockSelection` | USART1～3 |
| `Uart4ClockSelection`、`Uart5ClockSelection`、`Lpuart1ClockSelection` | UART4、UART5、LPUART1 |
| `I2c1ClockSelection`～`I2c4ClockSelection` | I2C1～4 |
| `Lptim1ClockSelection` | LPTIM1 |
| `Sai1ClockSelection`、`I2sClockSelection` | SAI1、I2S |
| `FdcanClockSelection` | FDCAN |
| `UsbClockSelection` | USB |
| `RngClockSelection` | RNG |
| `Adc12ClockSelection`、`Adc345ClockSelection` | ADC1/2、ADC3/4/5の共有クロック群 |

### `RCC_ClkInitTypeDef`の主な項目

| メンバー | 内容 |
| --- | --- |
| `ClockType` | 変更するSYSCLK、HCLK、PCLKの対象 |
| `SYSCLKSource` | CPUとバスの元になるシステムクロック源 |
| `AHBCLKDivider` | HCLKの分周 |
| `APB1CLKDivider`、`APB2CLKDivider` | 各APBバスの分周 |

発振器とPLLの入力・分周・逓倍値は`RCC_OscInitTypeDef`に入り、システム・バス側の切り替え値は`RCC_ClkInitTypeDef`に入る。さらに、ADC、FDCAN、USBなど一部ペリフェラルは独立したクロック源を`RCC_PeriphCLKInitTypeDef`で選ぶ。1つの構造体だけ読んでも全体のクロック経路は分からないので、`SystemClock_Config()`とCubeMXのClock Configuration画面を合わせて確認する。

---


## 注意事項

- `HAL_GetTick()` のオーバーフローを考慮し、時間差は符号なし整数の差として扱う。
- `HAL_Delay()` はSysTickなどのHAL tickが動作していることを前提とする。
- 低消費電力モードや割り込み優先度を変更する場合、HAL tickの進み方が変わらないか確認する。
- APBタイマクロックの2倍則はシリーズやタイマによって条件が異なるため、リファレンスマニュアルを確認する。
- クロックを変更するとUARTのボーレート、タイマ周期、ADC変換速度なども変わる。変更後は`HAL_RCC_Get*Freq()`の値と各ペリフェラル設定を再確認する。
- 発振器の起動失敗やPLL設定の不整合は、`HAL_RCC_OscConfig()`などの戻り値で検出する。無条件に次の初期化へ進まない。

---
title: GPIO HAL API
---
# GPIO HAL API

## 概要

STM32 HALのGPIO APIを説明します。GPIOポートとピンマスクを使う読み取り・書き込み関数、初期化方法、関連する型を扱います。

---

## 関数概要

<ApiSignature :signature="'GPIO_PinState HAL_GPIO_ReadPin( GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin);'" />

指定したピンの入力状態を返す。戻り値は `GPIO_PIN_SET` または `GPIO_PIN_RESET`。

<ApiSignature :signature="'void HAL_GPIO_WritePin( GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin, GPIO_PinState PinState);'" />

指定した出力ピンへ値を書き込む。複数ピンを同時に指定する場合は、ピンマスクをORで結合する。

<ApiSignature :signature="'void HAL_GPIO_TogglePin( GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin);'" />

指定した出力ピンの状態を反転する。

<ApiSignature :signature="'void HAL_GPIO_Init( GPIO_TypeDef *GPIOx, GPIO_InitTypeDef *GPIO_Init);'" />

GPIOのモード、プルアップ・プルダウン、速度、Alternate Functionを設定する。通常はCubeMXが生成する `MX_GPIO_Init()` の中で呼ばれる。

<ApiSignature :signature="'void HAL_GPIO_DeInit(GPIO_TypeDef *GPIOx, uint32_t GPIO_Pin);'" />

指定したピンを初期化前の状態へ戻す。ペリフェラルのMSP DeInit関数が、Alternate Functionに割り当てたGPIOを解放するときなどに使う。

<ApiSignature :signature="'void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin);'" />

外部割り込みの共通コールバック。HALの割り込みハンドラから呼び出されるユーザー実装の入口である。

---

## GPIOの構造体・型

### `GPIO_TypeDef` {#type-gpio-typedef}

GPIOポートのレジスタ配置を表します。`GPIOA`や`GPIOB`などのポート識別子を各HAL関数へ渡します。

| レジスタ | 内容 |
| --- | --- |
| `MODER` | 各ピンの入力、出力、Alternate Function、Analogの選択 |
| `OTYPER` | 出力をPush-PullまたはOpen-Drainにする設定 |
| `OSPEEDR` | 出力端子のスイッチング速度 |
| `PUPDR` | 内部プルアップ・プルダウン |
| `IDR`、`ODR` | ピン入力値と出力ラッチ値 |
| `BSRR` | ピンを原子的にSet/Resetする書き込みレジスタ |
| `LCKR` | GPIO設定のロック |
| `AFR[0]`、`AFR[1]` | 各ピンのAlternate Function番号 |

これらは周辺回路レジスタです。`HAL_GPIO_Init()`や`HAL_GPIO_WritePin()`などを使う場合、通常アプリケーションが直接書き換える必要はありません。

### `GPIO_InitTypeDef` {#type-gpio-inittype-def}

GPIOのモード、出力形式、プルアップ・プルダウン、速度、Alternate Functionをまとめて指定する初期化構造体です。

| メンバー | 内容 | 選び方 |
| --- | --- | --- |
| `Pin` | ポート内のピンマスク | `GPIO_PIN_0`などを指定。複数ピンはORでまとめられる |
| `Mode` | Input、Output、Alternate Function、Analog、EXTIなど | 接続するペリフェラルと入出力方向に合わせる |
| `Pull` | 内部プルアップ、プルダウン、なし | 外部抵抗を含めた回路設計に合わせる |
| `Speed` | 出力エッジの速度設定 | 信号速度とEMIを考慮して必要な範囲にする |
| `Alternate` | Alternate Function番号 | 対象ピンで選べるAF番号をデータシートで確認する |

CubeMX生成コードでは、GPIOクロックを有効にしてから`HAL_GPIO_Init()`を呼び、AFピンでは同じピンに対して周辺機能に対応するAlternate Functionを指定する。ピン番号だけでなく、ポート、AF番号、ピンの電気特性をセットで確認する。

---

## 注意事項

- `GPIO_Pin` は `GPIO_PIN_0`～`GPIO_PIN_15` のビットマスクで指定する。
- GPIOポートのクロックが有効でなければ読み書きできない。
- EXTIのコールバックは割り込みコンテキストから呼ばれるため、重い処理はメインループへ通知して処理する。
- 同一ピンを入力、出力、EXTIで同時に使用しない。
- `HAL_GPIO_WritePin()`の値はピンの論理レベルであり、基板上のLEDやトランジスタのON/OFFと一致するとは限らない。回路がアクティブLowか確認する。
- `GPIO_SPEED_FREQ_*`はCPU周波数や割り込み速度ではなく、出力端子の立ち上がり・立ち下がり特性を調整する設定。

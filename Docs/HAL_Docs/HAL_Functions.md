---
title: STM32 HAL 関数一覧
---
# STM32 HAL 関数一覧

## 概要

HALbedの実装で使用しているSTM32 HAL関数を、周辺機能ごとに整理する。HALbedのクラスやメソッドではなく、CubeMXが生成するハンドルを直接使うHAL APIの説明である。

添付の `hal_api_docs` は、STM32 HAL/LLの分類と用語を確認するための参考資料として使用した。関数の引数や定数はSTM32シリーズ、HALのバージョン、CubeMXの生成設定によって異なるため、対象MCUのヘッダとリファレンスマニュアルを優先すること。

---

## HALbed APIとの区別

| 種類 | 掲載場所 | 内容 |
| --- | --- | --- |
| HALbed API | [HALbed 関数一覧](../API/HALbed_Functions.md) | HALbedの公開クラス・構造体・コールバック |
| STM32 HAL API | 本ページと下記の各ページ | HALbedが内部で呼び出している低レイヤー関数 |
| STM32 HAL/LL全体 | 添付の `hal_api_docs` | MCUシリーズごとの詳細な公式API資料 |

---

## 機能一覧

| 機能 | HALbedでの対応 | HAL関数ドキュメント |
| --- | --- | --- |
| ADC | `AnalogIn` | [ADC](./ADC.md) |
| GPIO | `DigitalIn`、`DigitalOut` | [GPIO](./GPIO.md) |
| Classic CAN | `CAN`、`CANAlt` | [CAN](./CAN.md) |
| FDCAN | `CANFD`、`CANAlt` | [FDCAN](./FDCAN.md) |
| I2C | `I2C` | [I2C](./I2C.md) |
| タイマ・PWM・エンコーダ | `Ticker`、`PWMOut`、`Encoder`、`TimerManager` | [TIM](./TIM.md) |
| UART | `UART`、`LogManager` | [UART](./UART.md) |
| クロック・時刻 | `Ticker`、`TimerAPB`、`TimerManager`、`Encoder` | [RCC・時刻](./RCC.md) |

---
---
title: STM32 HAL 関数一覧
---
# STM32 HAL 関数一覧

## 概要

STM32 HALの関数を周辺機能ごとにまとめています。CubeMXが生成するハンドルを使うAPIを扱います。HALの上位にあるMiddlewareとの違いは[STM32Cube Middleware](./STM32Cube_Middleware.md)を参照してください。

関数の引数や定数はSTM32シリーズ、HALのバージョン、CubeMXの設定によって異なります。対象MCUのヘッダとリファレンスマニュアルを基準にしてください。

---

## APIの種類

| 種類 | 掲載場所 | 内容 |
| --- | --- | --- |
| STM32 HAL API | 本ページと下記の各ページ | 周辺機能を初期化・制御するAPI |
| STM32Cube Middleware | [Middlewareの説明](./STM32Cube_Middleware.md) | USB Deviceなど、HALの上位で動く機能コンポーネント |

---

## 機能一覧

| 機能 | HAL関数ドキュメント |
| --- | --- |
| ADC | [ADC](./ADC.md) |
| GPIO | [GPIO](./GPIO.md) |
| Classic CAN | [CAN](./CAN.md) |
| FDCAN | [FDCAN](./FDCAN.md) |
| DMA | [DMA](./DMA.md) |
| Flash | [Flash](./Flash.md) |
| NVIC | [NVIC](./NVIC.md) |
| I2C | [I2C](./I2C.md) |
| タイマ・PWM・エンコーダ | [TIM](./TIM.md) |
| USB Device CDC | [USB CDC](./USB_CDC.md) |
| STM32Cube Middleware | [Middlewareの説明](./STM32Cube_Middleware.md) |
| UART | [UART](./UART.md) |
| クロック・時刻 | [RCC・時刻](./RCC.md) |

---

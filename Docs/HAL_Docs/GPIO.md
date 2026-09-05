---
title: GPIO HAL API
---
# GPIO HAL API

## 概要

STM32 HALのGPIO APIを説明する。HALbedの `DigitalIn` と `DigitalOut` は、GPIOポートとピンマスクを保持し、ここで説明する読み取り・書き込み関数を呼び出している。

---

## 関数概要

### `HAL_GPIO_ReadPin`

```cpp
GPIO_PinState HAL_GPIO_ReadPin(
    GPIO_TypeDef *GPIOx,
    uint16_t GPIO_Pin);
```

指定したピンの入力状態を返す。戻り値は `GPIO_PIN_SET` または `GPIO_PIN_RESET`。

### `HAL_GPIO_WritePin`

```cpp
void HAL_GPIO_WritePin(
    GPIO_TypeDef *GPIOx,
    uint16_t GPIO_Pin,
    GPIO_PinState PinState);
```

指定した出力ピンへ値を書き込む。複数ピンを同時に指定する場合は、ピンマスクをORで結合する。

### `HAL_GPIO_TogglePin`

```cpp
void HAL_GPIO_TogglePin(
    GPIO_TypeDef *GPIOx,
    uint16_t GPIO_Pin);
```

指定した出力ピンの状態を反転する。

### `HAL_GPIO_Init`

```cpp
void HAL_GPIO_Init(
    GPIO_TypeDef *GPIOx,
    GPIO_InitTypeDef *GPIO_Init);
```

GPIOのモード、プルアップ・プルダウン、速度、Alternate Functionを設定する。通常はCubeMXが生成する `MX_GPIO_Init()` の中で呼ばれる。

### `HAL_GPIO_EXTI_Callback`

```cpp
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin);
```

外部割り込みの共通コールバック。HALの割り込みハンドラから呼び出されるユーザー実装の入口である。

---

## 使用方法

### CubeMXの設定

1. 出力に使うピンをGPIO_Outputへ設定する。
2. 入力に使うピンをGPIO_Inputへ設定する。
3. 外部割り込みに使うピンをGPIO_EXTIへ設定する。
4. 必要に応じてPull-up/Pull-down、GPIO speed、割り込み優先度を設定する。
5. GPIOクロックとEXTI IRQを有効にする。

### HALbed APIとの対応

| HALbed | 内部で対応するHAL |
| --- | --- |
| `DigitalIn::read()` | `HAL_GPIO_ReadPin()` |
| `DigitalOut::write()` | `HAL_GPIO_WritePin()` |
| `DigitalOut::toggle()` | `HAL_GPIO_TogglePin()` |
| `DigitalIn::attach()` | `HAL_GPIO_EXTI_Callback()` からコールバックを実行 |

---

## 注意事項

- `GPIO_Pin` は `GPIO_PIN_0`～`GPIO_PIN_15` のビットマスクで指定する。
- GPIOポートのクロックが有効でなければ読み書きできない。
- EXTIのコールバックは割り込みコンテキストから呼ばれるため、重い処理はメインループへ通知して処理する。
- 同一ピンを入力、出力、EXTIで同時に使用しない。

---

## サンプルコード

### LEDを出力し、ボタンを読む

```cpp
#include "main.h"

void gpio_example(void) {
    HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_SET);

    if (HAL_GPIO_ReadPin(USER_Btn_GPIO_Port, USER_Btn_Pin) == GPIO_PIN_SET) {
        HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
    }
}
```

### 外部割り込みを受ける

```cpp
volatile bool button_pressed = false;

void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
    if (GPIO_Pin == USER_Btn_Pin) {
        button_pressed = true;
    }
}
```

`LED_GPIO_Port`、`LED_Pin`、`USER_Btn_GPIO_Port`、`USER_Btn_Pin` はCubeMXの設定に合わせて置き換える。

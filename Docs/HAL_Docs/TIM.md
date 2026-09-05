---
title: TIM HAL API
---
# TIM HAL API

## 概要

STM32 HALのタイマAPIを説明する。HALbedの `Ticker`、`PWMOut`、`Encoder`、`TimerManager` は、タイマの基本動作、PWM、エンコーダ、更新割り込みをこのAPIで実装している。

---

## 関数・マクロ概要

### `HAL_TIM_Base_Init`

```cpp
HAL_StatusTypeDef HAL_TIM_Base_Init(TIM_HandleTypeDef *htim);
```

タイマの基本設定を初期化する。`htim->Init.Prescaler`、`htim->Init.Period` などを設定してから呼ぶ。

### `HAL_TIM_Base_Start_IT` / `HAL_TIM_Base_Stop_IT`

```cpp
HAL_StatusTypeDef HAL_TIM_Base_Start_IT(TIM_HandleTypeDef *htim);

HAL_StatusTypeDef HAL_TIM_Base_Stop_IT(TIM_HandleTypeDef *htim);
```

更新イベント割り込みを開始・停止する。開始後は `HAL_TIM_PeriodElapsedCallback()` が呼ばれる。

### `HAL_TIM_PeriodElapsedCallback`

```cpp
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim);
```

タイマ更新割り込みのユーザー実装入口。複数タイマを使う場合は `htim` を比較して処理を分ける。

### `HAL_TIM_PWM_Start` / `HAL_TIM_PWM_Stop`

```cpp
HAL_StatusTypeDef HAL_TIM_PWM_Start(
    TIM_HandleTypeDef *htim,
    uint32_t Channel);

HAL_StatusTypeDef HAL_TIM_PWM_Stop(
    TIM_HandleTypeDef *htim,
    uint32_t Channel);
```

指定チャネルのPWMを開始・停止する。周波数はタイマクロック、Prescaler、ARRで決まり、デューティ比はCCRで決まる。

### PWMのDMA版

```cpp
HAL_StatusTypeDef HAL_TIM_PWM_Start_DMA(
    TIM_HandleTypeDef *htim,
    uint32_t Channel,
    const uint32_t *pData,
    uint16_t Length);

HAL_StatusTypeDef HAL_TIM_PWM_Stop_DMA(
    TIM_HandleTypeDef *htim,
    uint32_t Channel);
```

CCRへDMAで値を転送し、波形やデューティ比を連続更新する。DMAバッファと転送モードをCubeMXで設定する。

### `HAL_TIM_Encoder_Init`

```cpp
HAL_StatusTypeDef HAL_TIM_Encoder_Init(
    TIM_HandleTypeDef *htim,
    const TIM_Encoder_InitTypeDef *sConfig);
```

タイマをエンコーダインターフェースとして初期化する。エンコーダモード、入力極性、入力フィルタなどを `TIM_Encoder_InitTypeDef` で指定する。

### `HAL_TIM_Encoder_Start` / `HAL_TIM_Encoder_Stop`

```cpp
HAL_StatusTypeDef HAL_TIM_Encoder_Start(
    TIM_HandleTypeDef *htim,
    uint32_t Channel);

HAL_StatusTypeDef HAL_TIM_Encoder_Stop(
    TIM_HandleTypeDef *htim,
    uint32_t Channel);
```

エンコーダカウントを開始・停止する。通常は `TIM_CHANNEL_ALL` を指定する。

### タイマ設定マクロ

```cpp
__HAL_TIM_SET_COMPARE(htim, Channel, Compare);
__HAL_TIM_SET_AUTORELOAD(htim, Autoreload);
__HAL_TIM_IS_TIM_COUNTING_DOWN(htim);
```

CCR、ARR、カウント方向を操作・取得するHALマクロ。マクロの引数や対応タイマは対象シリーズのHALヘッダを確認する。

---

## 計算式

基本タイマの更新周波数は、概ね次式で求められる。

```text
更新周波数 = タイマクロック / ((Prescaler + 1) * (Period + 1))
```

PWMのデューティ比は、一般に次式で求められる。

```text
デューティ比 = CCR / (ARR + 1)
```

タイマクロックはAPBの分周設定によりPCLKの2倍になる場合がある。詳細は [RCC・時刻](./RCC.md) を参照する。

---

## 使用方法

### CubeMXの設定

1. 基本タイマ、PWM、またはEncoder Modeを選択する。
2. Prescaler、Counter Period、Clock Division、カウンタモードを設定する。
3. PWMではチャネルとPulseを設定する。
4. エンコーダではTIM入力ピンとEncoder Modeを設定する。
5. 更新割り込みを使う場合はTIM interruptを有効にする。

---

## 注意事項

- `HAL_TIM_Base_Init()` だけではタイマは動作しない。用途に応じてStart関数を呼ぶ。
- PWMのCCRがARRを超えないようにする。
- エンコーダのカウント値はタイマのビット幅でオーバーフローする。
- コールバックは割り込みコンテキストから呼ばれるため、重い処理やブロッキング処理をしない。
- DMA使用時は、バッファの配置、転送完了、Cache整合性を確認する。

---

## サンプルコード

### PWM出力のデューティ比を変更する

```cpp
#include "main.h"

extern TIM_HandleTypeDef htim3;

void pwm_start(void) {
    if (HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1) != HAL_OK) {
        Error_Handler();
    }
}

void pwm_set_duty(uint32_t compare) {
    if (compare > htim3.Instance->ARR) {
        compare = htim3.Instance->ARR;
    }
    __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, compare);
}
```

### タイマ更新割り込みを使う

```cpp
#include "main.h"

extern TIM_HandleTypeDef htim6;
static volatile bool tick_1ms = false;

void timer_start(void) {
    if (HAL_TIM_Base_Start_IT(&htim6) != HAL_OK) {
        Error_Handler();
    }
}

void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim) {
    if (htim == &htim6) {
        tick_1ms = true;
    }
}
```

### エンコーダのカウント値を読む

```cpp
#include "main.h"

extern TIM_HandleTypeDef htim2;

void encoder_start(void) {
    if (HAL_TIM_Encoder_Start(&htim2, TIM_CHANNEL_ALL) != HAL_OK) {
        Error_Handler();
    }
}

int32_t encoder_count(void) {
    const uint32_t count = __HAL_TIM_GET_COUNTER(&htim2);
    const int direction = __HAL_TIM_IS_TIM_COUNTING_DOWN(&htim2) ? -1 : 1;
    return direction * static_cast<int32_t>(count);
}
```

上の例はHALbedを使わず、TIMのHAL APIとHALマクロだけでPWM、タイマ割り込み、エンコーダを操作している。

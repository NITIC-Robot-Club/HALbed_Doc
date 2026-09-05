---
title: RCC・時刻 HAL API
---
# RCC・時刻 HAL API

## 概要

タイマや通信の設定で使うクロック取得関数と、HALのミリ秒時刻関数を説明する。HALbedの `TimerAPB`、`TimerManager`、`Ticker`、`Encoder` がこれらを使用している。

---

## 関数概要

### `HAL_RCC_GetClockConfig`

```cpp
void HAL_RCC_GetClockConfig(
    RCC_ClkInitTypeDef *RCC_ClkInitStruct,
    uint32_t *pFlashLatency);
```

現在のAHB/APB分周設定とFlash latencyを取得する。APBタイマクロックの計算で `APB1CLKDivider`、`APB2CLKDivider` を参照する。

### `HAL_RCC_GetPCLK1Freq` / `HAL_RCC_GetPCLK2Freq`

```cpp
uint32_t HAL_RCC_GetPCLK1Freq(void);
uint32_t HAL_RCC_GetPCLK2Freq(void);
```

APB1またはAPB2のペリフェラルクロック周波数をHzで返す。

APBプリスケーラが1以外の場合、STM32のタイマクロックはPCLKの2倍になるシリーズがある。タイマの実クロックを求めるときは、`RCC_ClkInitTypeDef` の分周値も確認する。

### `HAL_GetTick`

```cpp
uint32_t HAL_GetTick(void);
```

HALの起動後経過時間をmsで返す。HALbedの `Encoder::getRPS()` は、この値を使って速度計算の時間差を求めている。

### `HAL_Delay`

```cpp
void HAL_Delay(uint32_t Delay);
```

指定msだけ待つ。HALbedのAPI内部では使用していないが、HALbedと組み合わせるアプリケーションの周期処理で使われる代表的な関数である。

---

## 使用方法

### HALbed APIとの対応

| HALbed | HAL関数 |
| --- | --- |
| `TimerAPB::getAPBTimFreq()` | `HAL_RCC_GetClockConfig()`、`HAL_RCC_GetPCLK1Freq()`、`HAL_RCC_GetPCLK2Freq()` |
| `TimerManager::getTimerFrequency()` | 上記のクロック取得関数 |
| `Ticker` | `HAL_RCC_GetPCLK1Freq()` |
| `Encoder::getRPS()` | `HAL_GetTick()` |

---

## 注意事項

- `HAL_GetTick()` のオーバーフローを考慮し、時間差は符号なし整数の差として扱う。
- `HAL_Delay()` はSysTickなどのHAL tickが動作していることを前提とする。
- 低消費電力モードや割り込み優先度を変更する場合、HAL tickの進み方が変わらないか確認する。
- APBタイマクロックの2倍則はシリーズやタイマによって条件が異なるため、リファレンスマニュアルを確認する。

---

## サンプルコード

### クロック周波数と経過時間を使う

```cpp
#include "main.h"

uint32_t measure_elapsed_ms(void) {
    const uint32_t start = HAL_GetTick();

    // 実際の処理
    HAL_Delay(10);

    return HAL_GetTick() - start;
}

uint32_t timer_clock_apb1(void) {
    RCC_ClkInitTypeDef clock_config = {};
    uint32_t flash_latency = 0;
    HAL_RCC_GetClockConfig(&clock_config, &flash_latency);

    const uint32_t multiplier =
        (clock_config.APB1CLKDivider == RCC_HCLK_DIV1) ? 1u : 2u;
    return HAL_RCC_GetPCLK1Freq() * multiplier;
}
```

この例はHALbedを使わず、HALのクロック・時刻APIだけで経過時間とAPB1タイマクロックを計算している。

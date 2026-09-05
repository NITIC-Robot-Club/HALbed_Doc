---
title: ADC HAL API
---
# ADC HAL API

## 概要

STM32 HALのADC APIを説明する。HALbedの `AnalogIn` は、ここで説明するポーリング取得とDMA取得をラップしている。

`HAL_ADC_MODULE_ENABLED` が有効で、CubeMXでADCのクロック、チャネル、GPIO、必要ならDMAを設定している必要がある。

---

## 使用するハンドル

CubeMXが生成する `ADC_HandleTypeDef` を使う。

```cpp
extern ADC_HandleTypeDef hadc1;
```

ADCのチャネル設定は通常 `MX_ADC1_Init()` で行う。複数チャネルを順番に読む場合は、CubeMXでScan Conversion ModeとRankを設定する。

---

## 関数概要

### `HAL_ADC_Start`

```cpp
HAL_StatusTypeDef HAL_ADC_Start(ADC_HandleTypeDef *hadc);
```

ADC変換を開始する。ポーリングで値を取得する場合は、この関数の後に `HAL_ADC_PollForConversion()` を呼ぶ。

### `HAL_ADC_PollForConversion`

```cpp
HAL_StatusTypeDef HAL_ADC_PollForConversion(
    ADC_HandleTypeDef *hadc,
    uint32_t Timeout);
```

変換完了を待つ。`Timeout` の単位はmsである。

- `HAL_OK` : 変換完了
- `HAL_TIMEOUT` : 指定時間内に完了しなかった
- `HAL_ERROR` : ADCエラー

### `HAL_ADC_GetValue`

```cpp
uint32_t HAL_ADC_GetValue(ADC_HandleTypeDef *hadc);
```

直前に完了した変換結果を返す。戻り値の有効範囲はADCの分解能によって異なる。

### `HAL_ADC_Stop`

```cpp
HAL_StatusTypeDef HAL_ADC_Stop(ADC_HandleTypeDef *hadc);
```

通常のADC変換を停止する。

### `HAL_ADC_Start_DMA`

```cpp
HAL_StatusTypeDef HAL_ADC_Start_DMA(
    ADC_HandleTypeDef *hadc,
    uint32_t *pData,
    uint32_t Length);
```

ADC変換結果を `pData` へDMA転送する。`Length` は転送する要素数で、バッファは転送中も有効でなければならない。

### `HAL_ADC_Stop_DMA`

```cpp
HAL_StatusTypeDef HAL_ADC_Stop_DMA(ADC_HandleTypeDef *hadc);
```

ADCのDMA転送を停止する。DMAバッファを再利用する前に呼ぶ。

### ADC変換完了コールバック

```cpp
void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc);
void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *hadc);
```

DMAの全転送または半転送完了時に呼ばれるユーザー実装の入口。HALbedの現実装では登録・転送完了通知を提供していないため、DMA完了を処理する場合はアプリケーション側で実装する。

---

## 使用方法

### CubeMXの設定

1. ADCのクロックを設定する。
2. 使用するGPIOをAnalogに設定する。
3. ADCの分解能、変換チャネル、Rankを設定する。
4. DMAを使う場合はADCのDMAを追加し、NormalまたはCircularを選択する。
5. 割り込みを使う場合はADC interruptを有効にする。

### ポーリングで1回読む

```cpp
uint16_t read_adc_poll(void) {
    if (HAL_ADC_Start(&hadc1) != HAL_OK) {
        return 0;
    }

    uint16_t value = 0;
    if (HAL_ADC_PollForConversion(&hadc1, 100) == HAL_OK) {
        value = static_cast<uint16_t>(HAL_ADC_GetValue(&hadc1));
    }

    HAL_ADC_Stop(&hadc1);
    return value;
}
```

---

## 注意事項

- DMA動作中のADCに対してポーリングAPIを重ねて呼ばない。
- DMAで使うバッファは、転送完了までスコープ外へ出さない。
- 複数チャネルのDMA結果は、CubeMXで設定したRankの順に格納される。
- ADC値を電圧へ変換するときは、実際のVDDA、分圧回路、オフセット、ADCの分解能を考慮する。

---

## サンプルコード

### DMAで連続取得する

```cpp
#include "main.h"

extern ADC_HandleTypeDef hadc1;

static uint16_t adc_values[2];
static volatile bool adc_ready = false;

void start_adc_dma(void) {
    if (HAL_ADC_Start_DMA(&hadc1,
                          reinterpret_cast<uint32_t *>(adc_values),
                          2) != HAL_OK) {
        Error_Handler();
    }
}

void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc) {
    if (hadc == &hadc1) {
        adc_ready = true;
    }
}

void stop_adc_dma(void) {
    if (HAL_ADC_Stop_DMA(&hadc1) != HAL_OK) {
        Error_Handler();
    }
}
```

この例はHALbedを使わず、ADCのDMA開始・完了通知・停止をHAL APIだけで行っている。

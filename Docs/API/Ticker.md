---
title: "Ticker"
aliases:
  - "Ticker"
---
# Ticker

## 概要
HALbedライブラリはハードウェアタイマの割込み処理と設定管理を提供します。
- Ticker: タイマ割込み管理
- TimerManager: タイマ設定管理

---

## クラス概要

### `Ticker`
Tickerクラスは、指定タイマハンドルを用いて秒、ミリ秒、マイクロ秒単位の割込み処理を管理します。

#### コンストラクタ
```cpp
Ticker(TIM_HandleTypeDef* htim, uint32_t max_arr = 65535, uint32_t priority = 0);
```
- `htim` : タイマハンドルへのポインタ
- `max_arr` : タイマの最大自動リロード値（タイマ種類に応じた制限）
- `priority` : 割り込みの優先順位

#### メソッド

##### `void attach(void (*fptr)(), float time)`
指定秒間隔で割込み関数を登録してタイマを開始
> - `fptr` : 割込み処理関数へのポインタ
> - `time` : 割込み間隔（秒）

---

##### `void attach_ms(void (*fptr)(), uint32_t time)`
ミリ秒単位の割込み関数登録
> - `fptr` : 割込み処理関数へのポインタ
> - `time` : 割込み間隔（ミリ秒）

---

##### `void attach_us(void (*fptr)(), uint32_t time)`
マイクロ秒単位の割込み関数登録
> - `fptr` : 割込み処理関数へのポインタ
> - `time` : 割込み間隔（マイクロ秒）

---

##### `void detach()`
登録中の割込みを停止（登録解除はcallbackクラス側で管理）

#### `HALBED_MANUAL_TIM_CB` を使う場合

通常はHALbedが `HAL_TIM_PeriodElapsedCallback()` を提供します。アプリケーション側でタイマー割り込みをまとめて扱う場合は、アプリケーションターゲットに `HALBED_MANUAL_TIM_CB` を定義してください。対象タイマのHALハンドルを使って、登録済みコールバックを呼び出します。

```cpp
extern "C" void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    HALbed::callback::callback<void()>(
        reinterpret_cast<intptr_t>(htim));
}
```

---

## 使用方法

## タイマー割り込みの仕組み

`attach()`、`attach_ms()`、`attach_us()` は指定したタイマーを更新割り込みで動作させ、`HAL_TIM_PeriodElapsedCallback()` を経由して登録関数を呼び出します。通常はHALbedがこのHALコールバックを実装するため、アプリケーション側で同名の関数を定義する必要はありません。

CubeMXで対象タイマーの更新割り込みとIRQHandlerを有効にしてください。アプリケーション側でHALコールバックを管理する場合は、`HALBED_MANUAL_TIM_CB` をアプリケーションターゲットに定義し、`HAL_TIM_PeriodElapsedCallback()` から `HALbed::callback::callback<void()>(reinterpret_cast<intptr_t>(htim))` を呼び出します。

1. Tickerクラスのインスタンス作成
   ```cpp
   HALbed::Ticker ticker(&htim);
   ```

2. Tickerで割込み関数登録
   ```cpp
   ticker.attach(callback, time_in_seconds);
   ```

3. 割込み停止が必要な場合
   ```cpp
   ticker.detach();
   ```

---

## 注意事項
- 使用タイマが16bitまたは32bitに応じた設定を行うこと
- 割込み停止後もcallbackの管理状況を確認すること
- 割り込みコンテキストで実行されるため、登録関数では長時間の待ち処理やブロッキング処理を避ける
- 割り込みとメインループで共有する変数には、必要に応じて `volatile` や排他処理を使用する

---

## サンプルコード
```cpp
#include "main.h"
#include "../../Library/HALbed/Inc/HALbed.hpp"

using namespace HALbed;

extern UART_HandleTypeDef huart2; // 外部宣言
extern TIM_HandleTypeDef htim4; // 外部宣言: TIM4ハンドル

UART pc(&huart2);

volatile uint32_t lastTick = 0;

void tickerCallback() {
    uint32_t currentTick = HAL_GetTick();
    uint32_t elapsed = currentTick - lastTick;
    lastTick = currentTick;
    pc.xprintf("Ticker callback triggered, %lu ms \r\n", elapsed);
}



extern "C" void app_main(void) {
    pc.xprintf("main start\r\r\n");

    Ticker ticker(&htim4);
    ticker.attach_ms(tickerCallback, 100);  // 100msごとに割り込み
    pc.xprintf("Ticker started with 100ms interval\r\r\n");


    while (1) {
        pc.xprintf("in loop\r\r\n");
        HAL_Delay(1000); // 1秒待つ
    }
}
```

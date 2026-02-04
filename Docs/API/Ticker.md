# Tickerライブラリ README

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

---

## 使用方法

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



extern "C" void cppmain(void) {
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
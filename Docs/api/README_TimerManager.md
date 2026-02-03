# TimerManager クラス

## 概要
HALbedライブラリ内のタイマ設定管理クラス。タイマハンドルを用いて、プリスケーラ値や周期の取得・設定、タイマ周期（秒単位）や周波数の計算を行い、ハードウェアへの設定反映を実施する。

---

## クラス概要

### `TimerManager`
TimerManagerクラスは、ハードウェアタイマの設定値管理と計算処理を提供する。

#### コンストラクタ
```cpp
TimerManager(TIM_HandleTypeDef* timerHandle);
```
- `timerHandle` : タイマハンドルへのポインタ

#### メソッド

##### `void init();`
タイマ設定を初期化し、更新内容をハードウェアに適用する。

##### `uint32_t getPrescaler() const;`
現在のタイマプリスケーラ値を取得する。

##### `uint32_t getPeriod() const;`
現在のタイマ周期を取得する。

##### `double getTimerPeriod() const;`
タイマ周期（秒単位）を計算して取得する。

##### `double getTimerFrequency() const;`
タイマの周波数を算出して取得する。

##### `void setPrescaler(uint32_t prescaler);`
タイマプリスケーラ値を設定する。

##### `void setPeriod(uint32_t period);`
タイマ周期を設定する。

##### `void updateTimerSettings();`
更新した設定をハードウェアタイマに適用する。

---

## 使用方法

1. `TimerManager`クラスのインスタンス作成
   ```cpp
   HALbed::TimerManager tm(&htim);
   ```

2. タイマ設定の初期化
   ```cpp
   tm.init();
   ```

3. 必要に応じてプリスケーラや周期の取得および変更
   ```cpp
   uint32_t prescaler = tm.getPrescaler();
   uint32_t period = tm.getPeriod();
   tm.setPrescaler(new_value);
   tm.setPeriod(new_period);
   tm.updateTimerSettings();
   ```

---

## 依存関係
- STM32 HALライブラリ
- TimerAPB機能

---

## 注意事項
- `updateTimerSettings`で設定内容を必ずハードウェアに反映すること
- プロジェクト設定でHAL_TIM_MODULE_ENABLEDが有効であることを確認すること

---

## サンプルコード
```cpp
#include "main.h"
#include "../../Library/HALbed/Inc/HALbed.hpp"

// 外部宣言: TIM3のハンドル（CubeMXで生成される）
extern TIM_HandleTypeDef htim3;



int main(void) {
    // HAL初期化
    HAL_Init();
    
    // クロック設定とTIM3初期化
    SystemClock_Config();
    MX_TIM3_Init();
    
    // TimerManagerインスタンスの作成と初期化
    HALbed::TimerManager tm(&htim3);
    tm.init();
    
    // 現在のプリスケーラと周期の取得
    uint32_t prescaler = tm.getPrescaler();
    uint32_t period = tm.getPeriod();
    
    // タイマ設定の更新例
    tm.setPrescaler(prescaler + 5);
    tm.setPeriod(period - 50);
    tm.updateTimerSettings();
    
    // タイマ周期（秒）および周波数の計算結果取得
    double timerPeriodSec = tm.getTimerPeriod();
    double timerFrequency = tm.getTimerFrequency();
    
    // デバッグ等に利用可能（例: UART経由で出力）

    // メインループ
    while (1) {
    }
    
    return 0;
}

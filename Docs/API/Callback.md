---
title: "Callback Library"
aliases:
  - "Callback Library"
---
# Callback Library

## 概要
`Callback` は、HALbed の各APIが割り込みで発生したイベントをユーザー関数へ橋渡しするための内部ライブラリです。UARTハンドルやCANハンドル、タイマハンドルなどを識別子としてコールバックを登録し、HALのコールバックから対応する関数を呼び出します。

通常は、アプリケーションから `Callback` を直接呼び出す必要はありません。各APIの `attach()` を使用すると、HALbedが対応するHALコールバックを実装し、登録済みのユーザー関数まで呼び出します。

割り込み処理の呼び出し関係は次のとおりです。

```text
STM32 IRQHandler
    ↓
HAL_xxx_IRQHandler()
    ↓
HAL_xxx_Callback()
    ↓
HALbed::callback::callback()
    ↓
各APIの attach() で登録したユーザー関数
```

---

## 関数概要

### `attach`
コールバック関数を登録
```cpp
void attach(intptr_t handle, std::any &&fn, uint8_t priority);
```
- `handle` : コールバック関数を関連付けるハンドル
- `fn` : 登録するコールバック関数
- `priority` : コールバック関数の優先度

### `callback`
登録されたコールバック関数を実行
```cpp
template <class T, class... Args>
void callback(intptr_t handle, Args... args);
```
- `handle` : 実行するコールバック関数が関連付けられているハンドル
- `args` : コールバック関数に渡す引数

---

## 使用方法

1. コールバック関数を登録
   ```cpp
   callback::attach((intptr_t)&huart2, []() { UARTread(); }, 0);
   ```
   - `callback::attach` : `attach`関数を呼び出す
   - `(intptr_t)&huart2` : `huart2`のアドレスを整数型ポインタにキャストして渡す。これはコールバック関数を関連付けるハンドル
   - `[]() { UARTread(); }` : ラムダ式で、`UARTread`関数をコールバックとして登録
   - `0` : コールバック関数の優先度を指定

>[!Note]
> ### ラムダ式とは
> ラムダ式は、無名関数（名前のない関数）を定義するための構文。C++11以降で導入され、簡潔に関数オブジェクトを作成可能。以下はラムダ式の基本的な構文
> ```cpp
> [キャプチャ](引数) -> 戻り値の型 { 関数の本体 }
> ```
> - `[]` : キャプチャリスト。外部の変数をラムダ式内で使用するために指定
> - `()` : 引数リスト。関数に渡す引数を指定
> - `-> 型` : 戻り値の型。省略可能
> - `{}` : 関数の本体

2. 登録されたコールバック関数を実行
   ```cpp
   callback::callback<void()>((intptr_t)&huart2);
   ```

## HALコールバックとの関係

HALbedは、通常設定では次のHALコールバックを自動的に実装します。アプリケーション側でHALコールバックを用意する必要はありません。

| 機能 | HALコールバック | HALbedの登録API |
| --- | --- | --- |
| UART受信 | `HAL_UART_RxCpltCallback()` | `HALbed::UART::attach()` |
| Classic CAN受信 | `HAL_CAN_RxFifo0MsgPendingCallback()` / `HAL_CAN_RxFifo1MsgPendingCallback()` | `HALbed::CAN::attach()` |
| タイマー更新 | `HAL_TIM_PeriodElapsedCallback()` | `HALbed::Ticker::attach*()` |
| GPIO外部割り込み | `HAL_GPIO_EXTI_Callback()` | `HALbed::DigitalIn::attach()` |

CubeMXが生成するIRQHandlerは、HALの割り込みハンドラを経由してこれらのコールバックを呼び出すために必要です。生成されたIRQHandlerを削除したり、HALの呼び出しを省略したりしないでください。

## 手動コールバックへの切り替え

アプリケーション側でHALコールバックをまとめて管理したい場合は、機能ごとに次のマクロを定義します。

```text
HALBED_MANUAL_UART_CB
HALBED_MANUAL_CAN_CB
HALBED_MANUAL_TIM_CB
HALBED_MANUAL_GPIO_CB
```

マクロを定義すると、対応するHALbed側の自動コールバックはコンパイルされません。アプリケーション側で同名のHALコールバックを実装し、その中から登録ハンドルに対応する `callback()` を呼び出してください。

たとえばUARTとタイマーは次のように記述します。

```cpp
extern "C" void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    HALbed::callback::callback<void()>(reinterpret_cast<intptr_t>(huart));
}

extern "C" void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    HALbed::callback::callback<void()>(reinterpret_cast<intptr_t>(htim));
}
```

手動化した場合でも、`attach()` が登録した関数をアプリケーション側のHALコールバックから呼び出さなければ、登録処理は動作しません。また、アプリケーション側とHALbed側の両方で同じHALコールバックを定義すると、リンク時に多重定義になります。

`Src/*.cpp` に実装されているUART/CANのコールバックを手動化する場合は `halbed` ターゲットに、`Inc/*.hpp` に実装されているタイマー/GPIOのコールバックを手動化する場合は、そのヘッダをコンパイルするアプリケーションターゲットにも定義します。

```cmake
target_compile_definitions(halbed PRIVATE
    HALBED_MANUAL_UART_CB
    HALBED_MANUAL_CAN_CB
)

target_compile_definitions(${CMAKE_PROJECT_NAME} PRIVATE
    HALBED_MANUAL_TIM_CB
    HALBED_MANUAL_GPIO_CB
)
```

### 4つの手動化マクロの使い分け

手動化マクロは、HALbedが提供する自動コールバックを機能単位で無効にするためのコンパイル定義です。必要な機能だけを定義し、定義していない機能は従来どおりHALbedの自動コールバックを使用できます。

| マクロ | 対象API | HALbed側の自動コールバック | 定義するターゲット |
| --- | --- | --- | --- |
| `HALBED_MANUAL_CAN_CB` | `CAN::attach()` | Classic CAN受信 | `halbed` |
| `HALBED_MANUAL_UART_CB` | `UART::attach()` | UART受信完了 | `halbed` |
| `HALBED_MANUAL_TIM_CB` | `Ticker::attach*()` | タイマー更新 | アプリケーション |
| `HALBED_MANUAL_GPIO_CB` | `DigitalIn::attach()` | GPIO外部割り込み | アプリケーション |

たとえば、CANとUARTだけを手動管理する場合は次のようにします。

```cmake
target_compile_definitions(halbed PRIVATE
    HALBED_MANUAL_CAN_CB
    HALBED_MANUAL_UART_CB
)
```

タイマーとGPIOは、コールバックの実装がヘッダファイルに含まれるため、`halbed` だけでなく、そのヘッダをコンパイルするアプリケーションターゲットにも定義が必要です。

```cmake
target_compile_definitions(${CMAKE_PROJECT_NAME} PRIVATE
    HALBED_MANUAL_TIM_CB
    HALBED_MANUAL_GPIO_CB
)
```

手動化した場合、アプリケーション側のHALコールバックから `attach()` が登録した関数を呼び出す必要があります。マクロを定義するだけでは、ユーザー関数は呼び出されません。UARTとタイマーは次のように実装します。

```cpp
extern "C" void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    HALbed::callback::callback<void()>(reinterpret_cast<intptr_t>(huart));
}

extern "C" void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    HALbed::callback::callback<void()>(reinterpret_cast<intptr_t>(htim));
}
```

CANはFIFO 0/1ごとのHALコールバック、GPIOは割り込みピン番号を受け取るHALコールバックを実装し、使用するAPIの登録形式に合わせて `callback()` を呼び出します。HALbed側とアプリケーション側の両方で同じHALコールバックを定義すると、リンク時に多重定義になります。

---


## 注意事項
- 登録するコールバック関数は`std::function`である必要がある
- コールバック関数の実行中に例外が発生しないように注意
- コールバックは割り込みコンテキストから呼ばれるため、長時間の待ち処理やブロッキング処理を実行しない
- 共有変数を扱う場合は、必要に応じて `volatile` や排他処理を使用する

---

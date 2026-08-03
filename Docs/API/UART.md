# UART

## 概要
このライブラリは、UART通信を簡単に扱うためのC++クラスです。
HAL (Hardware Abstraction Layer) を利用した、基本的な送受信機能や割り込みを利用した非同期通信に対応しています。

## クラス概要
### `UART`
UARTクラスは、UART通信の初期化およびデータ送受信機能を提供します。

#### コンストラクタ
```cpp
UART(UART_HandleTypeDef* huart);
```
- `huart` : HALによって生成されたUARTハンドラへのポインタ

#### メソッド

##### `void enableRxInt(char *rxData, size_t size)`
受信割り込みを有効化
> - `rxData` : 受信データを格納するバッファ
> - `size` : 受信するデータのサイズ

---

##### `void write(const char* data)`
文字列をUARTで送信
> - `data` : 送信する文字列

---

##### `void read(char* buffer, size_t size)`
データを受信
> - `buffer` : 受信データを格納するバッファ
> - `size` : 受信するデータのサイズ

---

##### `bool readable()`
データが読み取り可能かを確認
> - `true` : データあり
> - `false` : データなし

---

##### `void xprintf(const char* format, ...)`
フォーマットされた文字列を送信
> - `format` : フォーマット文字列
> - `...` : 可変引数

---

##### `void attach(std::function<void()> &&fn, uint8_t priority)`
コールバック関数を設定
> - `fn` : コールバック関数
> - `priority` : コールバックの優先度

#### `HALBED_MANUAL_UART_CB` を使う場合

通常はHALbedが `HAL_UART_RxCpltCallback()` を提供します。アプリケーション側でこのHALコールバックを管理したい場合だけ、`halbed` ターゲットに `HALBED_MANUAL_UART_CB` を定義してください。HALbed側の自動実装が無効になるため、アプリケーション側のコールバックから次の処理を呼び出します。

```cpp
extern "C" void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    HALbed::callback::callback<void()>(
        reinterpret_cast<intptr_t>(huart));
}
```

この定義を使う場合、アプリケーション側とHALbed側の両方で `HAL_UART_RxCpltCallback()` を定義しないでください。多重定義となり、リンクに失敗します。

## 使用方法
### CubeIDEの設定

### app_main.cpp内 

1. `UART`クラスのインスタンスを作成します。
   ```cpp
   UART uart(&huart);
   ```
   
2. 必要に応じて割り込みを有効にします。
   ```cpp
   uart.enableRxInt(rxData, size);
   ```

3. 送信には`write`メソッド、受信には`read`メソッドを使用します。
   ```cpp
   uart.write("Hello, UART!\r\n");
   char buffer[10];
   uart.read(buffer, sizeof(buffer));
   ```
4. また、送信には`xprintf`を使うことができます。
   ```cpp
   uart.xprintf("xprintf >>> Temperature: %d°C, Humidity: %.2f%%\r\n", 25, 60.5);
   ```

5. 受信割り込みのコールバック関数を設定します。
   ```cpp
   uart.attach(UARTread, 0);
   ```

## コールバック関数の設定
UARTの受信割り込みは、STM32のIRQHandlerからHALの受信完了コールバックを経由して、`attach()` で登録した関数へ通知されます。通常はHALbedが `HAL_UART_RxCpltCallback()` を実装するため、アプリケーション側で同名の関数を定義する必要はありません。

受信割り込みを使う場合は、受信バッファを指定して `enableRxInt()` を呼び出したあと、受信完了時の処理を `attach()` に登録します。

```cpp
uart.attach(UARTread, 0);
```

登録したコールバック関数は、データ受信時に自動で呼び出されます。

受信完了後は、コールバック内で必要な処理を行い、次の受信に備えて再度 `enableRxInt()` を呼び出してください。アプリケーション側でHALコールバックを管理する構成にする場合は、`HALBED_MANUAL_UART_CB` を定義し、`HAL_UART_RxCpltCallback()` から `HALbed::callback::callback<void()>(reinterpret_cast<intptr_t>(huart))` を呼び出します。

## 注意事項
- 本ライブラリはSTM32環境を前提として設計
- 割り込み処理内での長時間の処理やブロッキング処理は避ける

### `bool readable()`　の実装について
UARTの受信割り込みは、RXNE (Receive Not Empty) と RXFNE (Receive FIFO Not Empty) の両方のフラグに依存しています。
> - `UART_FLAG_RXNE`
> RX Not Empty
> 受信データレジスタ（RDR）に1バイトでも入ったら立つ
> 昔からあるフラグ（F1/F4系など）
> = 1バイト単位で来たかどうか

> - `UART_FLAG_RXFNE`
> RX FIFO Not Empty
> FIFOに1つでもデータがあれば立つ
> FIFO対応UART（G4 / H7 / L4以降など）
> =「FIFOバッファにデータがあるか」

| 状態           | RXNE  | RXFNE |
| ------------ | ----- | ----- |
| 1バイト受信       | 立つ    | 立つ    |
| 複数バイトFIFO内   | 微妙(?) | 常に立つ  |
| FIFOしきい値設定あり | 影響あり  | 影響なし  |

取りこぼしを避けるため、RXFNEフラグで `readable()` を実装しています。
ただし、F1/F4系などRXFNE非対応のマイコンではRXNEフラグで実装されます。


---

## サンプルコード
以下は、このライブラリを使用したサンプルコードです。

### 送信 + ポーリング方式の例
```cpp
#include "main.h"
#include "../../Library/HALbed/Inc/HALbed.hpp"
using namespace HALbed;

extern UART_HandleTypeDef huart2; // 外部宣言 (STM32CubeMXで生成されたUARTハンドル)

char txData[] = "Hello, UART (polling mode)!\r\n"; // 定期送信メッセージ
char RxByte[1];

UART uart(&huart2);

extern "C" void app_main(void) {
    uart.write("UART polling sample start\r\n");
    // フォーマット付き出力の例
    uart.xprintf("System Tick: %lu ms\r\n", HAL_GetTick());

    uint32_t lastTxTick = HAL_GetTick();
    while (1) {
        // 1秒ごとに送信
        // 受診の割り込みは使わず、readable()でポーリングして受信するためHAL_Delayは使わない
        if ((HAL_GetTick() - lastTxTick) >= 1000U) {
            uart.write(txData);
            lastTxTick = HAL_GetTick();
        }

        // 受信データがあれば1バイト読み取りして表示
        if (uart.readable()) {
            uart.read(RxByte, sizeof(RxByte));
            uart.xprintf("RxByte: 0x%02X ('%c')\r\n", (uint8_t)RxByte[0], RxByte[0]);
        }
    }
}

```

### 受信割り込みを利用した例
> [!caution]
> UARTの割り込みをUARTクラスで扱うための機能の実装が不完全です。
> コールバッククラスから登録して実行することはできます。

```cpp
#include "main.h"
#include "../../Library/HALbed/Inc/HALbed.hpp"
using namespace HALbed;

extern UART_HandleTypeDef huart2; // 外部宣言

// UARTクラスのインスタンスを作成
UART pc(&huart2);
uint8_t rxByte;

void uart_rx_callback() {
    // 受信完了時の処理 + 受信したデータを再度割り込みモードで受信するように設定
    pc.enableRxInt(reinterpret_cast<char *>(&rxByte), 1);
    pc.xprintf("Received: %c\r\n", rxByte);
}

extern "C" void app_main(void) {
    pc.enableRxInt(reinterpret_cast<char *>(&rxByte), 1);
    // コールバック関数を登録
    callback::attach<void()>(reinterpret_cast<intptr_t>(&huart2), []() { uart_rx_callback(); }, 0);
    while (1) {
        pc.xprintf("Hello, HALbed! Time: %lu ms\r\n", HAL_GetTick());
        HAL_Delay(1000);
    }
}

```

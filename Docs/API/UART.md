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
このライブラリでは、HALの割り込みを利用して非同期処理が可能です。
受信割り込みのハンドラに関数を登録するには、以下のように記述します。

```cpp
uart.attach(UARTread, 0);
```

登録したコールバック関数は、データ受信時に自動で呼び出されます。

## 注意事項
- 本ライブラリはSTM32環境を前提として設計
- 割り込み処理内での長時間の処理やブロッキング処理は避ける

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
            uart.xprintf("RxByte: 0x%02X ('%c')\r\n", (unsigned int)(uint8_t)RxByte[0], RxByte[0]);
        }
    }
}

```

### 受信割り込みを利用した例
> [!caution]
> このサンプルコードはG474REの環境で受信割り込みが行われないことを確認しています。
> 
> ライブラリの修正を行っております。

```cpp
#include "main.h"
#include "../../Library/HALbed/Inc/HALbed.hpp"
using namespace HALbed;

extern UART_HandleTypeDef huart2; // 外部宣言

char txData[] = "Hello, UART!\r\n"; // 定期送信メッセージ
void UARTread();
char RxMsg[1];

// UARTクラスのインスタンスを作成
UART uart(&huart2);

extern "C" void app_main(void) {
    uart.enableRxInt(RxMsg, sizeof(RxMsg)); // 受信割り込みを有効にする
    // 受信割り込みで関数(UARTread();)をattachする
    uart.attach([]() { UARTread(); }, 0);
    uart.xprintf("xprintf >>> Temperature: %d°C, Humidity: %.2f%%\r\n", 25, 60.5);
    while (1) {
        uart.write(txData); // 定期送信
        HAL_Delay(100); // 0.1秒待機
    }
}

void UARTread() {
    uart.read(RxMsg, sizeof(RxMsg));
    uart.write("RxMsg: ");
    uart.write(RxMsg);
    uart.write("\r\n");
}
```

---
title: UART HAL API
---
# UART HAL API

## 概要

STM32 HALのUART APIを説明する。HALbedの `UART` と `LogManager` は、同期送受信、受信割り込み、UARTフラグ確認、ログ送信にこのAPIを使っている。

---

## 関数概要

### `HAL_UART_Transmit`

```cpp
HAL_StatusTypeDef HAL_UART_Transmit(
    UART_HandleTypeDef *huart,
    uint8_t *pData,
    uint16_t Size,
    uint32_t Timeout);
```

指定バイト数を同期送信する。HALbedの `write()` と `xprintf()` が使用している。

### `HAL_UART_Receive`

```cpp
HAL_StatusTypeDef HAL_UART_Receive(
    UART_HandleTypeDef *huart,
    uint8_t *pData,
    uint16_t Size,
    uint32_t Timeout);
```

指定バイト数を同期受信する。`Timeout` の単位はms。

### `HAL_UART_Receive_IT`

```cpp
HAL_StatusTypeDef HAL_UART_Receive_IT(
    UART_HandleTypeDef *huart,
    uint8_t *pData,
    uint16_t Size);
```

割り込みで指定バイト数を受信する。受信完了時に `HAL_UART_RxCpltCallback()` が呼ばれる。

### `HAL_UART_RxCpltCallback`

```cpp
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart);
```

UART受信完了のユーザー実装入口。連続受信する場合は、コールバック内またはメイン処理で再度 `HAL_UART_Receive_IT()` を開始する。

### `__HAL_UART_GET_FLAG`

```cpp
__HAL_UART_GET_FLAG(huart, UART_FLAG_RXNE);
```

UARTステータスフラグを確認するマクロ。STM32シリーズによって受信データフラグが `UART_FLAG_RXNE` または `UART_FLAG_RXFNE` になる場合がある。

### DMA送信・受信

```cpp
HAL_StatusTypeDef HAL_UART_Transmit_DMA(
    UART_HandleTypeDef *huart,
    const uint8_t *pData,
    uint16_t Size);

HAL_StatusTypeDef HAL_UART_Receive_DMA(
    UART_HandleTypeDef *huart,
    uint8_t *pData,
    uint16_t Size);
```

HALbedの現実装ではDMA送信は使用していないが、`LogManager` のソースにはDMA送信へ置き換える候補がコメントで残っている。DMAを使う場合は送信完了コールバックとバッファの寿命を管理する。

---

## 使用方法

### CubeMXの設定

1. UARTのTX/RXピンとボーレートを設定する。
2. Word Length、Parity、Stop Bits、Modeを通信相手と合わせる。
3. 割り込み受信を使う場合はUART interruptを有効にする。
4. DMAを使う場合はUARTのTX/RX DMAを追加する。

---

## 注意事項

- 同じUARTハンドルに対して同期受信と割り込み受信を同時に開始しない。
- 割り込み受信バッファは、受信完了まで有効な領域でなければならない。
- `HAL_UART_RxCpltCallback()` 内で長い処理やブロッキング送信をしない。
- `HAL_MAX_DELAY` を使う同期送信・受信は、割り込み内から呼ばない。
- HALのUART APIとUSART APIは、CubeMXが生成するハンドル型や使用可能なオプションが異なる場合がある。

---

## サンプルコード

### 1文字を割り込み受信する

```cpp
#include "main.h"
#include <cstring>

extern UART_HandleTypeDef huart2;

static uint8_t rx_byte;
static volatile bool received = false;

void uart_start_receive(void) {
    if (HAL_UART_Receive_IT(&huart2, &rx_byte, 1) != HAL_OK) {
        Error_Handler();
    }
}

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart) {
    if (huart == &huart2) {
        received = true;
        // rx_byteを退避する場合はここで行う
        HAL_UART_Receive_IT(&huart2, &rx_byte, 1);
    }
}

void uart_send_text(const char *text) {
    HAL_UART_Transmit(
        &huart2,
        reinterpret_cast<uint8_t *>(const_cast<char *>(text)),
        static_cast<uint16_t>(strlen(text)),
        100);
}
```

サンプルはHALbedを使わず、HAL APIだけで送信・割り込み受信を行っている。

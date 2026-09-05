---
title: FDCAN HAL API
---
# FDCAN HAL API

## 概要

STM32 HALのFDCAN APIを説明する。HALbedの `CANFD` と、F3系向けの `CANAlt` のFDCAN実装は、ここで説明する関数を使っている。

---

## 関数概要

### `HAL_FDCAN_Start`

```cpp
HAL_StatusTypeDef HAL_FDCAN_Start(FDCAN_HandleTypeDef *hfdcan);
```

FDCANペリフェラルを開始する。

### `HAL_FDCAN_ConfigFilter`

```cpp
HAL_StatusTypeDef HAL_FDCAN_ConfigFilter(
    FDCAN_HandleTypeDef *hfdcan,
    const FDCAN_FilterTypeDef *sFilterConfig);
```

標準IDまたは拡張IDの受信フィルタを設定する。ID種別、フィルタ番号、マスク、転送先FIFOを `FDCAN_FilterTypeDef` で指定する。

### `HAL_FDCAN_ActivateNotification`

```cpp
HAL_StatusTypeDef HAL_FDCAN_ActivateNotification(
    FDCAN_HandleTypeDef *hfdcan,
    uint32_t ActiveITs,
    uint32_t BufferIndexes);
```

受信FIFOなどの通知を有効にする。FIFO受信では `FDCAN_IT_RX_FIFO0_NEW_MESSAGE` または `FDCAN_IT_RX_FIFO1_NEW_MESSAGE` を指定する。

### `HAL_FDCAN_AddMessageToTxFifoQ`

```cpp
HAL_StatusTypeDef HAL_FDCAN_AddMessageToTxFifoQ(
    FDCAN_HandleTypeDef *hfdcan,
    const FDCAN_TxHeaderTypeDef *pTxHeader,
    const uint8_t *pTxData);
```

送信FIFOキューへメッセージを追加する。ID種別、Classic CAN/CAN FD、ビットレートスイッチ、DLCを送信ヘッダに設定する。

### `HAL_FDCAN_GetTxFifoFreeLevel`

```cpp
uint32_t HAL_FDCAN_GetTxFifoFreeLevel(FDCAN_HandleTypeDef *hfdcan);
```

送信FIFOキューの空き数を返す。

### `HAL_FDCAN_GetRxMessage`

```cpp
HAL_StatusTypeDef HAL_FDCAN_GetRxMessage(
    FDCAN_HandleTypeDef *hfdcan,
    uint32_t RxLocation,
    FDCAN_RxHeaderTypeDef *pRxHeader,
    uint8_t *pRxData);
```

指定した受信FIFOからメッセージを取り出す。`RxLocation` は `FDCAN_RX_FIFO0` または `FDCAN_RX_FIFO1`。

### 受信コールバック

```cpp
void HAL_FDCAN_RxFifo0Callback(
    FDCAN_HandleTypeDef *hfdcan,
    uint32_t RxFifo0ITs);
void HAL_FDCAN_RxFifo1Callback(
    FDCAN_HandleTypeDef *hfdcan,
    uint32_t RxFifo1ITs);
```

新しいメッセージの通知を受けるユーザー実装の入口。コールバック内で `HAL_FDCAN_GetRxMessage()` を呼ぶ。

---

## 主要な設定値

| 設定 | 代表的な値 | 内容 |
| --- | --- | --- |
| `IdType` | `FDCAN_STANDARD_ID`、`FDCAN_EXTENDED_ID` | 標準IDまたは拡張ID |
| `FDFormat` | `FDCAN_CLASSIC_CAN`、`FDCAN_FD_CAN` | Classic CANまたはCAN FD |
| `BitRateSwitch` | `FDCAN_BRS_OFF`、`FDCAN_BRS_ON` | データビットレート切り替え |
| `DataLength` | `FDCAN_DLC_BYTES_0`～`FDCAN_DLC_BYTES_64` | DLCで表したデータ長 |
| `FilterType` | `FDCAN_FILTER_MASK` など | フィルタ方式 |
| `FilterConfig` | `FDCAN_FILTER_TO_RXFIFO0` など | 受信先 |

`DataLength` は通常のバイト数ではなくDLC定数で指定する。受信時も、ヘッダのDLCを実データ長へ変換してから使う。

---

## 注意事項

- Classic CANは最大8バイト、CAN FDは最大64バイトである。
- FDCANのMessage RAM、フィルタ数、FIFO深さはCubeMXの設定と一致させる。
- FDCANの通知コールバックは割り込みコンテキストで実行される。
- `RxFifo0ITs`、`RxFifo1ITs` の値を使って通知種別を判定する場合は、対象MCUのHAL定義を確認する。
- Classic CANの `CAN_*` APIとFDCANの `HAL_FDCAN_*` APIは型・DLC・フィルタ構造体が異なる。

---

## サンプルコード

### CAN FDメッセージを送受信する

```cpp
#include "main.h"

extern FDCAN_HandleTypeDef hfdcan1;

void fdcan_start(void) {
    FDCAN_FilterTypeDef filter = {};
    filter.IdType = FDCAN_STANDARD_ID;
    filter.FilterIndex = 0;
    filter.FilterType = FDCAN_FILTER_MASK;
    filter.FilterConfig = FDCAN_FILTER_TO_RXFIFO0;
    filter.FilterID1 = 0x000;
    filter.FilterID2 = 0x000;

    if (HAL_FDCAN_ConfigFilter(&hfdcan1, &filter) != HAL_OK) {
        Error_Handler();
    }
    if (HAL_FDCAN_Start(&hfdcan1) != HAL_OK) {
        Error_Handler();
    }
    if (HAL_FDCAN_ActivateNotification(
            &hfdcan1, FDCAN_IT_RX_FIFO0_NEW_MESSAGE, 0) != HAL_OK) {
        Error_Handler();
    }
}

bool fdcan_send(void) {
    if (HAL_FDCAN_GetTxFifoFreeLevel(&hfdcan1) == 0) {
        return false;
    }

    FDCAN_TxHeaderTypeDef header = {};
    header.Identifier = 0x123;
    header.IdType = FDCAN_STANDARD_ID;
    header.TxFrameType = FDCAN_DATA_FRAME;
    header.DataLength = FDCAN_DLC_BYTES_4;
    header.ErrorStateIndicator = FDCAN_ESI_ACTIVE;
    header.BitRateSwitch = FDCAN_BRS_OFF;
    header.FDFormat = FDCAN_CLASSIC_CAN;
    header.TxEventFifoControl = FDCAN_NO_TX_EVENTS;
    header.MessageMarker = 0;

    uint8_t data[4] = {1, 2, 3, 4};
    return HAL_FDCAN_AddMessageToTxFifoQ(&hfdcan1, &header, data) == HAL_OK;
}

void HAL_FDCAN_RxFifo0Callback(
    FDCAN_HandleTypeDef *hfdcan,
    uint32_t RxFifo0ITs) {
    (void)RxFifo0ITs;
    FDCAN_RxHeaderTypeDef header = {};
    uint8_t data[64] = {};

    if (HAL_FDCAN_GetRxMessage(
            hfdcan, FDCAN_RX_FIFO0, &header, data) == HAL_OK) {
        // header.Identifier、header.DataLength、dataを処理または退避する
    }
}
```

この例はHALbedを使わず、FDCANのHAL APIだけで設定・送信・受信を行っている。

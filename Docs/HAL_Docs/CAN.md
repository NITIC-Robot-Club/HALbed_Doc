---
title: Classic CAN HAL API
---
# Classic CAN HAL API

## 概要

STM32 HALのClassic CAN APIを説明する。HALbedの `CAN` と `CANAlt` は、CANの開始、フィルタ設定、送信、受信コールバックをこのAPIで実装している。

このページは `CAN_HandleTypeDef` と `CAN_FilterTypeDef` を使うClassic CAN向けである。FDCANを使う場合は [FDCAN](./FDCAN.md) を参照する。

---

## 関数概要

### `HAL_CAN_Start`

```cpp
HAL_StatusTypeDef HAL_CAN_Start(CAN_HandleTypeDef *hcan);
```

CANペリフェラルを開始する。フィルタ設定後、通知を有効にする前に呼び出す。

### `HAL_CAN_ConfigFilter`

```cpp
HAL_StatusTypeDef HAL_CAN_ConfigFilter(
    CAN_HandleTypeDef *hcan,
    CAN_FilterTypeDef *sFilterConfig);
```

受信フィルタを設定する。フィルタID、マスク、FIFO、フィルタバンク、フィルタスケールを `CAN_FilterTypeDef` で指定する。

### `HAL_CAN_ActivateNotification`

```cpp
HAL_StatusTypeDef HAL_CAN_ActivateNotification(
    CAN_HandleTypeDef *hcan,
    uint32_t ActiveITs);
```

指定したCAN割り込み通知を有効にする。FIFO受信では `CAN_IT_RX_FIFO0_MSG_PENDING` または `CAN_IT_RX_FIFO1_MSG_PENDING` を指定する。

### `HAL_CAN_AddTxMessage`

```cpp
HAL_StatusTypeDef HAL_CAN_AddTxMessage(
    CAN_HandleTypeDef *hcan,
    const CAN_TxHeaderTypeDef *pHeader,
    const uint8_t aData[],
    uint32_t *pTxMailbox);
```

送信メールボックスへメッセージを追加する。送信ID、標準/拡張ID、フレーム種別、DLCを `CAN_TxHeaderTypeDef` に設定する。

### `HAL_CAN_GetTxMailboxesFreeLevel`

```cpp
uint32_t HAL_CAN_GetTxMailboxesFreeLevel(
    CAN_HandleTypeDef *hcan);
```

空いている送信メールボックス数を返す。0の場合は送信を開始せず、次の機会まで待つ。

### `HAL_CAN_GetRxMessage`

```cpp
HAL_StatusTypeDef HAL_CAN_GetRxMessage(
    CAN_HandleTypeDef *hcan,
    uint32_t RxFifo,
    CAN_RxHeaderTypeDef *pHeader,
    uint8_t aData[]);
```

受信FIFOからメッセージを取り出す。`RxFifo` は `CAN_RX_FIFO0` または `CAN_RX_FIFO1`。

### 受信コールバック

```cpp
void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan);
void HAL_CAN_RxFifo1MsgPendingCallback(CAN_HandleTypeDef *hcan);
```

受信FIFOにメッセージが到着したときに呼ばれる。コールバック内で `HAL_CAN_GetRxMessage()` を呼び、ヘッダとデータを取り出す。

---

## 主要な設定構造体

### `CAN_FilterTypeDef`

代表的なメンバは次のとおり。

| メンバ | 内容 |
| --- | --- |
| `FilterBank` | 使用するフィルタバンク番号 |
| `FilterMode` | IDマスク方式など |
| `FilterScale` | 16bitまたは32bit |
| `FilterIdHigh`、`FilterIdLow` | フィルタID |
| `FilterMaskIdHigh`、`FilterMaskIdLow` | フィルタマスク |
| `FilterFIFOAssignment` | FIFO0またはFIFO1 |
| `FilterActivation` | `ENABLE` / `DISABLE` |
| `SlaveStartFilterBank` | デュアルCAN時のバンク境界。MCUにより扱いが異なる |

### `CAN_TxHeaderTypeDef`

送信時は少なくとも `StdId` または `ExtId`、`IDE`、`RTR`、`DLC`、`TransmitGlobalTime` を設定する。

### `CAN_RxHeaderTypeDef`

受信後に `StdId`、`ExtId`、`IDE`、`RTR`、`DLC` などを参照する。拡張IDを読むときは `IDE` を確認してからIDフィールドを選ぶ。

---

## 使用方法

### CubeMXの設定

1. CANのModeとピンを設定する。
2. Prescaler、Time Quanta、Sync Jump Width、Time Segmentsを設定する。
3. Auto Retransmissionなどの動作設定を確認する。
4. FIFO0またはFIFO1のRX interruptを有効にする。
5. CANトランシーバ、終端抵抗、ビットレートが実機側でも一致していることを確認する。

---

## 注意事項

- Classic CANのデータ長は最大8バイトで、`DLC` も0～8で指定する。
- 送信キューに空きがないと `HAL_CAN_AddTxMessage()` は失敗することがある。
- 受信割り込みが発生したら、できるだけ早くFIFOからメッセージを取り出す。
- フィルタのID表現は、標準ID・拡張ID、16bit・32bitスケールで配置が異なる。
- F3系などではHALのマクロや構造体の定義が他シリーズと異なる場合がある。

---

## サンプルコード

### 初期化、送信、FIFO0受信

```cpp
#include "main.h"

extern CAN_HandleTypeDef hcan1;

void can_start(void) {
    CAN_FilterTypeDef filter = {};
    filter.FilterBank = 0;
    filter.FilterMode = CAN_FILTERMODE_IDMASK;
    filter.FilterScale = CAN_FILTERSCALE_32BIT;
    filter.FilterIdHigh = 0x0000;
    filter.FilterIdLow = 0x0000;
    filter.FilterMaskIdHigh = 0x0000;
    filter.FilterMaskIdLow = 0x0000;
    filter.FilterFIFOAssignment = CAN_RX_FIFO0;
    filter.FilterActivation = ENABLE;

    if (HAL_CAN_ConfigFilter(&hcan1, &filter) != HAL_OK) {
        Error_Handler();
    }
    if (HAL_CAN_Start(&hcan1) != HAL_OK) {
        Error_Handler();
    }
    if (HAL_CAN_ActivateNotification(
            &hcan1, CAN_IT_RX_FIFO0_MSG_PENDING) != HAL_OK) {
        Error_Handler();
    }
}

bool can_send(void) {
    if (HAL_CAN_GetTxMailboxesFreeLevel(&hcan1) == 0) {
        return false;
    }

    CAN_TxHeaderTypeDef header = {};
    header.StdId = 0x123;
    header.IDE = CAN_ID_STD;
    header.RTR = CAN_RTR_DATA;
    header.DLC = 4;
    header.TransmitGlobalTime = DISABLE;

    uint8_t data[8] = {1, 2, 3, 4, 0, 0, 0, 0};
    uint32_t mailbox = 0;
    return HAL_CAN_AddTxMessage(&hcan1, &header, data, &mailbox) == HAL_OK;
}

void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan) {
    CAN_RxHeaderTypeDef header = {};
    uint8_t data[8] = {};

    if (HAL_CAN_GetRxMessage(hcan, CAN_RX_FIFO0, &header, data) == HAL_OK) {
        // header.StdId、header.DLC、dataを短時間で処理または退避する
    }
}
```

この例はHALbedを使わず、Classic CANのHAL APIだけで初期化・送信・受信を行っている。

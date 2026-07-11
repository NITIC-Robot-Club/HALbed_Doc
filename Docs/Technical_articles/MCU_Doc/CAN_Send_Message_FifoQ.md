---
tags:
  - 開発資料
  - MCU
  - CAN
  - CANFD
thumbnail:
  targets:
    - article-home
    - mcu-home
  description: 'HALでCAN送信するときの関数とモードについてまとめています。'
  order: 50
---

# CANの送信関数について

`HAL_FDCAN_AddMessageToTxFifoQ()` は、FDCANでメッセージを送信するときによく使う関数です。

似た役割の関数として、Tx Bufferを使う関数があります。  
特に混同しやすいのは次の3つです。

| 関数 | 役割 |
|---|---|
| `HAL_FDCAN_AddMessageToTxFifoQ()` | Tx FIFO/Queue にメッセージを入れて送信要求を出す |
| `HAL_FDCAN_AddMessageToTxBuffer()` | 指定した Tx Buffer にメッセージを入れる |
| `HAL_FDCAN_EnableTxBufferRequest()` | 指定した Tx Buffer の送信要求を出す |

## HAL_FDCAN_AddMessageToTxFifoQ

通常の送信では、この関数を使えばよいです。

```c
HAL_FDCAN_AddMessageToTxFifoQ(&hfdcan1, &TxHeader, TxData);
```

この関数は、Tx FIFO/Queue の空いている場所にメッセージを入れ、そのまま送信要求も出します。

そのため、基本的には1回の関数呼び出しで送信まで行えます。

送信前に空きがあるか確認する場合は、次のようにします。

```c
if (HAL_FDCAN_GetTxFifoFreeLevel(&hfdcan1) > 0) {
    HAL_FDCAN_AddMessageToTxFifoQ(&hfdcan1, &TxHeader, TxData);
}
```

Tx FIFO/Queue が満杯のときに送信しようとすると失敗するため、連続送信する場合は空き数を確認すると安全です。

## Tx FIFO と Tx Queue の違い

`HAL_FDCAN_AddMessageToTxFifoQ()` の `FifoQ` は、FIFOとQueueの両方に対応しているという意味です。

どちらとして動作するかは、初期化時の設定で決まります。

```c
hfdcan1.Init.TxFifoQueueMode = FDCAN_TX_FIFO_OPERATION;
```

または、

```c
hfdcan1.Init.TxFifoQueueMode = FDCAN_TX_QUEUE_OPERATION;
```

を設定します。

| モード | 特徴 |
|---|---|
| `FDCAN_TX_FIFO_OPERATION` | 入れた順番で送信する |
| `FDCAN_TX_QUEUE_OPERATION` | CAN IDの優先度を見て送信する |

普通に順番通り送信したい場合は、`FDCAN_TX_FIFO_OPERATION` で問題ありません。  
優先度の高いIDを先に送信したい場合は、`FDCAN_TX_QUEUE_OPERATION` を使います。

## Tx Buffer を使う場合

Tx Bufferを使う場合は、メッセージを入れる処理と送信要求を出す処理が分かれます。

```c
HAL_FDCAN_AddMessageToTxBuffer(&hfdcan1, &TxHeader, TxData, FDCAN_TX_BUFFER0);

HAL_FDCAN_EnableTxBufferRequest(&hfdcan1, FDCAN_TX_BUFFER0);
```

`HAL_FDCAN_AddMessageToTxBuffer()` は、指定したTx Bufferにデータを置くだけです。  
この時点では、まだ送信要求は出ていません。

実際に送信するには、`HAL_FDCAN_EnableTxBufferRequest()` を呼び出します。

## Tx FIFO/Queue と Tx Buffer の使い分け

通常の送信では、Tx FIFO/Queueを使う方が簡単です。

```c
HAL_FDCAN_AddMessageToTxFifoQ(&hfdcan1, &TxHeader, TxData);
```

一方、Tx Bufferは「このメッセージはこのバッファから送る」と決めたい場合に使います。

例えば、周期的に送る制御データや、特定のIDを決まったバッファで管理したい場合です。

ただし、初めのうちはTx FIFO/Queueを使う方が扱いやすいです。

## 受信側のFIFO関数

送信側だけでなく、受信側にもFIFOがあります。

受信メッセージを取り出すときは、次のような関数を使います。

```c
HAL_FDCAN_GetRxMessage(&hfdcan1, FDCAN_RX_FIFO0, &RxHeader, RxData);
```

受信FIFOに何個メッセージが入っているか確認する場合は、次の関数を使います。

```c
HAL_FDCAN_GetRxFifoFillLevel(&hfdcan1, FDCAN_RX_FIFO0);
```

Tx FIFO/Queue は送信用、Rx FIFO は受信用です。  
名前は似ていますが、役割は別です。

## まとめ

`HAL_FDCAN_AddMessageToTxFifoQ()` は、FDCANでメッセージを送信するときの基本的な関数です。

Tx FIFO/Queueにメッセージを入れるだけでなく、送信要求まで行うため、通常の送信ではこの関数を使えば十分です。

Tx Bufferを使う場合は、`HAL_FDCAN_AddMessageToTxBuffer()` でデータを入れ、`HAL_FDCAN_EnableTxBufferRequest()` で送信要求を出します。

基本的には、Tx FIFOを使うことをおすすめします。

## 参考
- [STM32G4 Series MCU RM0440 Reference Manual](https://www.st.com/resource/ja/reference_manual/rm0440-stm32g4-series-advanced-armbased-32bit-mcus-stmicroelectronics.pdf) : P.1927 ~ P.1928 あたり参照

G4シリーズ以外のマイコンにも、同様の関数が用意されていますが、詳細は各マイコンのリファレンスマニュアルを確認してください。

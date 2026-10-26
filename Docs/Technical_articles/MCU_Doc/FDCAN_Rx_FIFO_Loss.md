---
tags:
  - 開発資料
  - MCU
  - CAN
  - CAN FD
thumbnail:
  targets:
    - article-home
    - mcu-home
  description: '割り込み受信でもFDCANのRx FIFOが満杯になれば、CANフレームは失われます。まずFIFOとNVICを確認しましょう。'
  order: 60
---

# STM32G4 FDCAN：割り込み受信でもデータを取りこぼす理由

割り込み受信を有効にしていても、受信したCANフレームが必ずアプリケーションまで届くとは限りません。FDCANはフレームを先にRx FIFOへ入れ、CPUは割り込み後にFIFOから読み出します。CPUが間に合わなければ、FIFOは満杯になります。

STM32G4のRx FIFO0とRx FIFO1は、それぞれ最大3メッセージです。FIFOが満杯の状態で次のフレームを受信すると、標準のBlocking modeでは新しいフレームが破棄され、`MESSAGE_LOST` が発生します。

```text
CANフレーム受信 → Rx FIFOへ格納 → IRQ要求 → CPUがFIFOを読む
                                      ↑
                     高優先度IRQや割り込み禁止で遅れると蓄積する
```

## FIFO1はFIFO0の予備ではない

Rx FIFO0が満杯になっても、受信フレームが自動でFIFO1へ移ることはありません。どちらのFIFOへ入れるかは、Acceptance Filterで決めます。

そのため、FIFO0だけを使う設定ではFIFO1が空いていても、FIFO0の満杯によるロストは防げません。IDの種類や用途でFIFOを分ける場合は、フィルタの転送先も確認します。

## 最初に記録するもの

原因を切り分けるには、Rx FIFOのFullとMessage Lostを通知に含め、回数を記録します。FIFO0を使う例です。

```c
HAL_FDCAN_ActivateNotification(
    &hfdcan1,
    FDCAN_IT_RX_FIFO0_NEW_MESSAGE |
    FDCAN_IT_RX_FIFO0_FULL |
    FDCAN_IT_RX_FIFO0_MESSAGE_LOST,
    0);

volatile uint32_t fdcan_fifo_full_count;
volatile uint32_t fdcan_message_lost_count;

void HAL_FDCAN_RxFifo0Callback(
    FDCAN_HandleTypeDef *hfdcan,
    uint32_t RxFifo0ITs)
{
    if (RxFifo0ITs & FDCAN_IT_RX_FIFO0_FULL) {
        fdcan_fifo_full_count++;
    }
    if (RxFifo0ITs & FDCAN_IT_RX_FIFO0_MESSAGE_LOST) {
        fdcan_message_lost_count++;
    }

    while (HAL_FDCAN_GetRxFifoFillLevel(hfdcan, FDCAN_RX_FIFO0) > 0) {
        if (HAL_FDCAN_GetRxMessage(
                hfdcan, FDCAN_RX_FIFO0, &RxHeader, RxData) != HAL_OK) {
            break;
        }
        /* コピーしてソフトウェアキューへ渡す。重い処理はここで行わない。 */
    }
}
```

`fdcan_message_lost_count` が増えるなら、ハードウェアFIFOから取り出す前に後続フレームが到着しています。通信プロトコルや上位処理を疑う前に、まず割り込み遅延を確認します。

## NVICと割り込みラインを確認する

FDCANのRx FIFOと、NVICの `FDCANx_IT0_IRQn` / `FDCANx_IT1_IRQn` は別のものです。FIFOの通知イベントをInterrupt Line 0または1へ割り当て、そのラインに対応するNVIC IRQを有効にします。

FIFO0をLine 0へ割り当てた構成なら、少なくとも次を確認します。

```c
HAL_NVIC_SetPriority(FDCAN1_IT0_IRQn, 1, 0);
HAL_NVIC_EnableIRQ(FDCAN1_IT0_IRQn);

void FDCAN1_IT0_IRQHandler(void)
{
    HAL_FDCAN_IRQHandler(&hfdcan1);
}
```

優先度の数値が小さいほど、STM32では優先度が高くなります。ただし、FDCANを無条件に最優先にするのではなく、より高い優先度のISRや割り込み禁止区間が長くなっていないかを確認します。FDCANのコールバックではFIFOを空にしてデータを短時間で退避し、解析や制御処理はmain loopやRTOSタスクへ渡します。

## ロストしたときの確認順

1. `FDCAN_IT_RX_FIFOx_FULL` と `FDCAN_IT_RX_FIFOx_MESSAGE_LOST` の回数を記録する
2. FIFOごとのAcceptance Filterと、Interrupt Line 0/1の割り当てを確認する
3. 対応する `FDCANx_IT0_IRQn` / `FDCANx_IT1_IRQn`、NVIC優先度、IRQ Handlerを確認する
4. コールバック内の処理、長い高優先度ISR、割り込み禁止区間を短くする
5. `MESSAGE_LOST` が増えない場合は、フィルタ、CANバス上の送信、エラー状態、Message RAM設定を確認する

G4だけFIFOが小さいことが原因ではありません。受信が抜けたように見えたら、まず「FIFOは満杯だったか」「その割り込みはCPUへ届き、すぐ読まれたか」を記録して判断します。

## 関連資料

- [FDCAN HAL API](/Docs/HAL_Docs/FDCAN)
- STM32G4 Series reference manual RM0440

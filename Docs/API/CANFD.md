---
title: "CAN FD"
aliases:
  - "CAN FD"
---
# CAN FD

## 概要
このライブラリは、STM32 HAL の FDCAN 機能を利用した CAN FD 通信クラスを提供する。

Classic CAN 用の `CAN` クラスとは別実装です。CAN FD を使用する場合は `CANFD.hpp` をインクルードして使用してください。

> [!Note]
> `HAL_FDCAN_MODULE_ENABLED` が有効な場合のみ `CANFD` クラスと `CANFDMessage` が使用できます。

---

## クラス概要

### `CANFD`
CAN FD の初期化、フィルタ設定、メッセージ送信、受信コールバックの設定を行うクラスです。

#### コンストラクタ
```cpp
CANFD(CanHandleType *CanHandle);
```

- `CanHandle` : CubeMX によって生成された `FDCAN_HandleTypeDef` へのポインタ

#### メソッド

##### `void init()`
FDCAN を開始し、FIFO 0/1 の新規メッセージ割り込みを有効にします。

---

##### `void filterSetup(uint32_t filter_id, uint32_t filter_mask, uint8_t is_extended, uint8_t fifo)`
ID マスク方式の FDCAN フィルタを設定します。

- `filter_id` : フィルタ ID
- `filter_mask` : フィルタマスク
- `is_extended` : 拡張IDの場合は `1`、標準IDの場合は `0`
- `fifo` : 受信先 FIFO 番号（`0` または `1`）

フィルタインデックスは `0` を使用します。複数のフィルタを設定する場合や、より詳細な設定が必要な場合は `filterSetupWithConfig()` を使用してください。

---

##### `void filterSetupWithConfig(const CAN_FilterTypeDef &FilterConfig)`
`FDCAN_FilterTypeDef` を使用して FDCAN フィルタを設定します。

- `FilterConfig` : FDCAN フィルタ設定構造体

---

##### `bool write(const CANMessageType& msg)`
CAN FD メッセージを送信 FIFO キューへ追加します。

- `msg` : 送信する `CANFDMessage`
- `true` : 送信キューへの追加に成功
- `false` : 送信キューが満杯などの理由で失敗

`msg.format` により Classic CAN フレームと CAN FD フレームを切り替え、`msg.brs` によりビットレートスイッチ（BRS）の有無を切り替えます。

---

##### `bool writeable()`
送信 FIFO キューに空きがあるか確認します。

- `true` : 送信可能
- `false` : 送信不可

---

##### `void attach(std::function<CallbackFnType> &&fn, uint8_t priority = 100, uint8_t fifo = 0)`
受信コールバック関数を設定します。

- `fn` : `const CANFDMessage &` を受け取るコールバック関数
- `priority` : コールバックの優先度
- `fifo` : 受信元 FIFO 番号（`0` または `1`）

---

## `HALbed::CANFDMessage`

CAN FD の送受信データを保持する構造体です。

```cpp
struct CANFDMessage {
    uint32_t id;
    std::array<uint8_t, 64> data;
    uint8_t size;
    CANIDType idType;
    CANFormat format;
    bool brs;
};
```

- `id` : メッセージ ID
- `data` : データ（最大 64 バイト）
- `size` : データ長（0～64 バイト）
- `idType` : `Standard_ID` または `Extended_ID`
- `format` : `CANStandard`（Classic CAN）または `CANExtended`（CAN FD）
- `brs` : ビットレートスイッチを使用する場合は `true`

コンストラクタでは、`size`が64を超えた場合は64に制限されます。

CAN FDのデータ長は規格上、8バイトを超える場合に12、16、20、24、32、48、64バイトのいずれかになります。`write()`は指定された`size`に対応するDLCを選択するため、8バイトを超えるデータでは実際のフレーム長が次の有効な長さへ切り上げられます。

---

## 使用方法

### CubeMX の設定

1. **FDCAN のペリフェラルと使用するピンを設定**
   - 使用する FDCAN インスタンス、TX/RX ピンを有効にします。
2. **FDCAN のクロックとビットタイミングを設定**
   - Nominal Bit Timing（アービトレーションフェーズ）を、接続する CAN バスに合わせて設定します。
   - CAN FD を使用する場合は Data Bit Timing（データフェーズ）も設定します。
3. **CAN FDとBRSの設定を確認**
   - CAN FD フレームを使用する場合は、接続先も CAN FD に対応している必要があります。
   - `brs = true` を使用する場合は、接続先と Data Bit Rate を合わせてください。
4. **受信FIFOと割り込みを有効化**
   - FIFO 0 または FIFO 1 の受信割り込みを有効にします。
   - 使用するFIFOと`attach()`の`fifo`引数を一致させてください。
5. **Message RAM の設定を確認**
   - Rx FIFO、Tx FIFO/Queue の要素数と、データフィールドのサイズが CAN FD の最大データ長に対応していることを確認します。


### `app_main.cpp` 内

```cpp
#include "main.h"
#include "../../Library/HALbed/Inc/HALbed.hpp"

using namespace HALbed;

extern FDCAN_HandleTypeDef hfdcan1;

CANFD canfd(&hfdcan1);

void canfdListen(const CANFDMessage &msg) {
    // 受信データを処理する
}

extern "C" void app_main(void) {
    canfd.attach(canfdListen, 100, 0);  // FIFO 0 を使用
    canfd.init();

    // すべての標準 ID を受信する設定例
    canfd.filterSetup(0x000, 0x000, 0, 0);

    while (1) {
        if (canfd.writeable()) {
            CANFDMessage msg;
            msg.id = 0x123;
            msg.idType = CANFDMessage::Standard_ID;
            msg.format = CANFDMessage::CANExtended;
            msg.brs = true;
            msg.data[0] = 0x01;
            msg.data[1] = 0x02;
            msg.size = 2;

            canfd.write(msg);
        }

        HAL_Delay(500);
    }
}
```

`CANFDMessage` はデフォルトで標準 ID、Classic CAN、BRS 無効です。CAN FD フレームを送信する場合は、上の例のように `format` を `CANExtended` に設定します。高速データフェーズを使用しない場合は `brs` を `false` のままにします。

---

## 受信割り込みの仕組み

通常はHALbedが`HAL_FDCAN_RxFifo0Callback()`と`HAL_FDCAN_RxFifo1Callback()`を提供し、受信したメッセージを`attach()`で登録した関数へ通知します。受信したID、ID種別、Classic CAN/CAN FDの種別、BRS、データ長、データが`CANFDMessage`に格納されます。

`HALBED_MANUAL_CAN_CB`を`halbed`ターゲットに定義した場合は、HALbedの自動コールバック実装が無効になります。その場合はアプリケーション側でHALのFDCANコールバックを実装し、FDCANメッセージ取得後に対象ハンドルとFIFOに対応する`HALbed::callback::callback()`を呼び出してください。自動実装とアプリケーション側の実装を同時に定義すると、リンク時に多重定義になります。

---

## 注意事項

- FDCANの受信FIFOと`attach()`の`fifo`引数を一致させる
- Classic CAN と CAN FD では、接続先、ビットタイミング、最大データ長の条件が異なる
- BRS を有効にする場合は、バス上のすべてのノードでデータビットレートを合わせる
- 割り込みコールバック内では長時間の処理やブロッキング処理を避ける
- Message RAMのFIFO/Queue要素数とデータサイズをCubeMXで確認する
- `writeable()`で送信FIFOの空きを確認してから`write()`を呼び出す


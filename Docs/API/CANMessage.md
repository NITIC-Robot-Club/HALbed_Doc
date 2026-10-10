---
title: "CAN メッセージ型"
aliases:
  - "HALbed::CANMessage"
  - "CANMessage"
---
# CAN メッセージ型

## 概要

HALbedにはClassic CAN用の`HALbed::CANMessage`とFDCAN用の`HALbed::CANFDMessage`があります。どちらも識別子、データ、長さ、フレーム形式を保持し、`CAN::write()`または`CANFD::write()`へ渡します。受信データは対応する型に格納され、`attach()`で登録したコールバックへ渡されます。

Classic CAN では最大8バイト、CAN FD では最大64バイトのデータを扱います。

## `HALbed::CANMessage`

`CANMessage`はClassic CANフレームを表します。送受信方法は[CANリファレンス](./CAN.md)を参照してください。

### コンストラクタ

```cpp
CANMessage();
CANMessage(uint32_t id, const uint8_t* data, uint8_t size,
           CANFormat format = CANStandard);
CANMessage(uint32_t id, const std::array<uint8_t, 8>& data,
           uint8_t size = 8, CANFormat format = CANStandard);
```

| 引数 | 説明 |
| --- | --- |
| `id` | フレームの識別子です。標準 ID または拡張 ID の範囲内で指定します。 |
| `data` | 送信データを指すポインタ、または8バイト配列です。 |
| `size` | 有効なデータ長です。Classic CAN では0～8バイトを指定します。 |
| `format` | Classic CAN の識別子形式です。`CANStandard` は標準 ID、`CANExtended` は拡張 ID を表します。 |

主なメンバは `id`、`data`、`size`、`format` です。

## `HALbed::CANFDMessage`

`CANFDMessage`はFDCANフレームを表します。フレーム形式にはClassic CANとCAN FDを指定でき、CAN FDでは最大64バイトを扱えます。送受信方法は[CAN FDリファレンス](./CANFD.md)を参照してください。

### コンストラクタ

```cpp
CANFDMessage();
CANFDMessage(uint32_t id, const uint8_t* data, uint8_t size,
             bool brs = false,
             CANIDType idType = Standard_ID,
             CANFormat format = CANStandard);
CANFDMessage(uint32_t id, const std::array<uint8_t, 64>& data,
             uint8_t size, bool brs = false,
             CANIDType idType = Standard_ID,
             CANFormat format = CANStandard);
```

| 引数 | 説明 |
| --- | --- |
| `id` | フレームの識別子です。 |
| `data` | 最大64バイトのデータ配列またはその先頭を指すポインタです。 |
| `size` | 有効なデータ長です。CAN FD の場合は0～64を指定します。 |
| `brs` | CAN FD のビットレートスイッチを有効にするか指定します。既定値は `false` です。 |
| `idType` | `Standard_ID` または `Extended_ID` で識別子形式を指定します。 |
| `format` | フレーム形式です。`CANStandard` は Classic CAN、`CANExtended` は CAN FD を表します。 |

主なメンバは `id`、`data`、`size`、`idType`、`format`、`brs` です。

## 使用例

Classic CAN のメッセージを作成して送信します。

```cpp
#include "main.h"
#include "HALbed.hpp"

using namespace HALbed;

extern CAN_HandleTypeDef hcan1;
CAN can(&hcan1);

extern "C" void app_main(void)
{
    can.init();

    const uint8_t payload[] = {0x10, 0x20, 0x30};
    CANMessage message(0x123, payload, sizeof(payload), CANStandard);
    const bool sent = can.write(message);
    // sent が false の場合は送信キューへの追加に失敗
}
```

CAN FD を使う場合は `CANFDMessage` を作成して `CANFD::write()` に渡します。FDCAN の初期化、フィルタ設定、送受信設定は [CAN FD API](./CANFD.md) を参照してください。

## 注意事項

- `size` は使用するフレーム形式の最大データ長を超えないようにしてください。Classic CAN は8バイト、CAN FD は64バイトです。
- `CANMessage`では`format`で標準IDか拡張IDかを指定します。`CANFDMessage`では`idType`がID形式、`format`がClassic CANかCAN FDかを示します。
- `CANFDMessage` を Classic CAN で送る場合のデータ長上限は8バイトです。
- CAN のビットタイミング、ピン配置、フィルタ、割り込みの設定は、CubeMX の周辺機器設定と併せて行います。

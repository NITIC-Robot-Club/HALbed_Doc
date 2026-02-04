# HALbed::CANMessageクラス README

## 概要
CANMessageクラスは、CAN通信のメッセージを定義します。

---

## クラス概要

### `HALbed::CANMessage`
CANMessageクラスは、CAN通信のメッセージをHALライブラリとは別に新たに定義したものです。

#### コンストラクタ
```cpp
CANMessage(uint32_t _id, unsigned char *_data, unsigned char _size = 8);
CANMessage(uint32_t _id, std::array<uint8_t, 8> _data);
```
- `_id` : メッセージID
- `_data` : データ
- `_size` : データサイズ (デフォルトは8)

#### メソッド
このクラスには特定のメソッドはありません。

---

## 使用方法

1. `HALbed::CANMessage`クラスのインスタンスを作成
   ```cpp
   HALbed::CANMessage msg(id, data, size);
   ```

---

## 注意事項
なし

---


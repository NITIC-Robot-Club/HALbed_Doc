---
title: "CircularBuffer"
aliases:
  - "CircularBuffer"
---
# `CircularBuffer<T, Size>`

## 概要

`CircularBuffer<T, Size>`は、コンパイル時に容量を決める固定長の循環バッファです。容量を超えて要素を追加すると、最も古い要素から上書きします。動的にメモリを確保せず、受信データやセンサー値を一定数だけ保持できます。

`T`には要素の型、`Size`には容量を指定します。たとえば`CircularBuffer<uint8_t, 32>`は、最大32個の`uint8_t`を保持します。

## クラスリファレンス

### コンストラクタ

```cpp
CircularBuffer();
```

要素を格納していない状態でバッファを作成します。容量はテンプレート引数 `Size` で決まります。

### メソッド

#### `void push(const T& item)`

`item` を末尾に追加します。満杯のときは、最も古い要素を上書きして新しい要素を保持します。満杯でも追加に失敗したことを示す戻り値はありません。

#### `T pop()`

最も古い要素を取り出して返します。バッファが空の場合は `T()` を返します。空の場合の戻り値だけでは、格納値が `T()` と等しいケースと区別できません。読み出し前に `empty()` を確認してください。

#### `bool empty() const`

要素がない場合に `true` を返します。

#### `bool isFull() const`

格納要素数が容量に達している場合に `true` を返します。

#### `size_t capacity() const`

テンプレート引数`Size`で指定した容量を返します。

#### `size_t size() const`

現在格納されている要素数を返します。満杯になると `capacity()` と同じ値になります。

## 使用例

```cpp
#include "CircularBuffer.hpp"

CircularBuffer<uint8_t, 10> rxBuffer;

void onByteReceived(uint8_t receivedByte)
{
    rxBuffer.push(receivedByte);
}

void processReceivedData()
{
    if (!rxBuffer.empty()) {
        const uint8_t byte = rxBuffer.pop();
        // byte を処理する
    }
}
```

状態の確認例

```cpp
if (rxBuffer.isFull()) {
    // 次の push() で最も古い要素が上書きされる
}

const size_t queued = rxBuffer.size();
const size_t maximum = rxBuffer.capacity();
```

## 注意事項

- `push()`は満杯時に最も古い要素を上書きします。古い要素を残す場合は、満杯になる前に読み出してください。
- `pop()` は空のとき `T()` を返します。データの有無は `empty()` で判定してください。
- API 名は `empty()` です。`Empty()` ではありません。
- このバッファは割り込みとメインループ間の排他制御を提供しません。複数の実行コンテキストから同時にアクセスする場合は、呼び出し側で同期してください。

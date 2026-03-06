# CircularBuffer

## 概要
CircularBufferクラスは、循環バッファを実装します。
固定サイズのバッファで、データを追加すると古いデータが上書きされます。

---

## クラス概要

### `CircularBuffer<T, Size>`
CircularBufferクラスは、循環バッファを実装する

#### コンストラクタ
```cpp
CircularBuffer();
```

#### メソッド

##### `void push(const T& item);`
データをバッファに追加する
- `item` : 追加するデータ

##### `T pop();`
バッファからデータを取り出す
- 戻り値 : 取り出したデータ

##### `bool Empty() const;`
バッファが空かどうかを確認する
- 戻り値 : 空ならtrue、空でなければfalse

##### `bool isFull() const;`
バッファが満杯かどうかを確認する
- 戻り値 : 満杯ならtrue、満杯でなければfalse

##### `size_t capacity() const;`
バッファの容量を取得する
- 戻り値 : バッファの容量

##### `size_t size() const;`
バッファのサイズを取得する
- 戻り値 : バッファのサイズ

---

## 使用方法

1. `CircularBuffer`クラスのインスタンスを作成
   ```cpp
   CircularBuffer<int, 10> buffer;
   ```

2. データをバッファに追加
   ```cpp
   buffer.push(item);
   ```

3. データをバッファから取り出す
   ```cpp
   int item = buffer.pop();
   ```

---
## 注意事項
- このクラスはテンプレートクラスであり、任意のデータ型とサイズで使用できる

---

## サンプルコード
```cpp
#include "main.h"
#include "../Library/HALbed/Inc/HALbed.hpp"

extern UART_HandleTypeDef huart2;
using namespace HALbed;
UART pc(&huart2);

extern "C" void cppmain(void)
{
    // int 型、サイズ 5 の循環バッファを作成
    CircularBuffer<int, 5> buf;

    std::cout << "capacity() = " << buf.capacity() << "\r\n";
    std::cout << "empty() = " << std::boolalpha << buf.empty() << "\r\n";

    // 0..4 を push
    for (int i = 0; i < 5; ++i) {
        buf.push(i);
        pc.xprintf("push(%d) size=%d isFull=%s\r\n", i, buf.size(), buf.isFull() ? "true" : "false");
    }

    // さらに1つ push すると最も古い要素が上書きされる
    buf.push(99);
    pc.xprintf("after push(99) size=%d isFull=%s\r\n", buf.size(), buf.isFull() ? "true" : "false");
    // pop して中身を表示
    while (!buf.empty()) {
        int v = buf.pop();
        pc.xprintf("pop() = %d size=%d\r\n", v, buf.size());
    }

    // pop が空のときはデフォルト値が返る
    int v = buf.pop();
    pc.xprintf("pop() on empty -> %d\r\n", v);

    // 再度 push/pop の動作を確認
    for (int i = 0; i < 3; ++i) buf.push(i + 10);
    pc.xprintf("After pushing 3 items, size=%d\r\n", buf.size());
    while (!buf.empty()) pc.xprintf("pop()=%d\r\n", buf.pop());
} 
```
---
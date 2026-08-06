---
tags:
  - STM32
  - I2C
  - HAL
  - 通信
---

# STM32 HALに渡すI²Cアドレス

I²C機器のデータシートには、アドレスが `0x14` と書かれていることがあります。

そのままSTM32 HALへ渡せばよさそうです。

ところが、データシートの `0x14` が7bitアドレスなら、STM32 HALへ渡す値は `0x28` です。ここを間違えると、コードは正常に実行されているのに、相手機器からACKが返ってきません。

## I²Cアドレスは基本的に7bit

一般的なI²C機器では、スレーブを識別するために7bitのアドレスを使用します。

たとえば、機器の7bitアドレスが `0x14` なら、2進数では次の値です。

```text
7bitアドレス
0x14 = 001 0100
```

実際のI²C通信では、この7bitアドレスの後ろに、読み書きの方向を表す `R/W` ビットが追加されます。

```text
A6 A5 A4 A3 A2 A1 A0 R/W
```

`R/W` ビットは次の意味を持ちます。

| R/Wビット | 動作 |
|---:|---|
| `0` | Write：マスターからスレーブへ送信 |
| `1` | Read：スレーブからマスターへ受信 |

したがって、7bitアドレスが `0x14` の場合、バス上に送信される最初の1byteは次の値になります。

| 用途 | 計算 | バス上の値 |
|---|---|---:|
| Write | `(0x14 << 1) \| 0` | `0x28` |
| Read | `(0x14 << 1) \| 1` | `0x29` |

## STM32 HALには左シフトした値を渡す

STM32 HALのI²Cマスター用関数では、データシートに記載された7bitアドレスを、そのまま `DevAddress` に渡すのではありません。

**7bitアドレスを1bit左シフトした値**を渡します。

STMicroelectronicsのHALドキュメントでも、データシートの7bitアドレスを左へ1bitシフトしてから関数を呼び出すよう指定されています。:contentReference[oaicite:0]{index=0}

たとえば、7bitアドレスが `0x14` の場合は次のようにします。

```c
uint8_t data = 0x01;

HAL_I2C_Master_Transmit(
    &hi2c1,
    0x14 << 1,
    &data,
    1,
    100
);
```

`0x14 << 1` の計算結果は `0x28` です。

次のように定数を分けておくと、何の値なのか判断しやすくなります。

```c
#define MOTOR_DRIVER_ADDRESS_7BIT  0x14

uint8_t data = 0x01;

HAL_I2C_Master_Transmit(
    &hi2c1,
    MOTOR_DRIVER_ADDRESS_7BIT << 1,
    &data,
    1,
    100
);
```

## ラッパーAPIでは内部で左シフトする

I²Cクラスなど、STM32 HALを内部から呼び出すラッパーAPIでは、使いやすさのために7bitアドレスを受け取り、内部で1bit左シフトしてからHALへ渡す設計にすることがあります。

```cpp
int I2C::write(uint8_t address, const uint8_t *data, uint16_t length)
{
    return HAL_I2C_Master_Transmit(
        &hi2c,
        address << 1,
        const_cast<uint8_t *>(data),
        length,
        timeout
    );
}
```

このようなAPIでは、呼び出し側はデータシートの7bitアドレスをそのまま指定します。

```cpp
i2c.write(0x14, data, sizeof(data));  // 内部で 0x14 << 1 される
```

一方、シフト済みアドレスを受け取るAPIでは内部変換を行いません。APIの仕様を確認せずに呼び出し側でも左シフトすると、`0x14 << 1 << 1` のように二重にシフトされ、意図した機器とは異なるアドレスになります。

## Readでも同じ値を渡す

読み込みでは、バス上のアドレスバイトの最下位ビットが `1` になります。

それなら、HALへ `0x29` を渡すように見えます。

しかし、`HAL_I2C_Master_Receive()` にはWrite時と同じ、左シフトした値を渡します。

```c
#define SENSOR_ADDRESS_7BIT  0x14

uint8_t rx_data[4];

HAL_I2C_Master_Receive(
    &hi2c1,
    SENSOR_ADDRESS_7BIT << 1,
    rx_data,
    sizeof(rx_data),
    100
);
```

HALへ渡している値は `0x28` です。

実際の通信では、HALがRead動作に合わせて `R/W` ビットを設定するため、バス上には `0x29` が送信されます。ユーザーが `| 1` を追加する必要はありません。

```text
Transmitへ渡す値：0x28
バス上の値      ：0x28

Receiveへ渡す値 ：0x28
バス上の値      ：0x29
```

## 主なHAL関数で同じ考え方を使う

`DevAddress` を受け取る主なI²Cマスター関数では、基本的に左シフトしたアドレスを渡します。

```c
HAL_I2C_Master_Transmit(
    &hi2c1,
    address_7bit << 1,
    tx_data,
    tx_size,
    timeout
);

HAL_I2C_Master_Receive(
    &hi2c1,
    address_7bit << 1,
    rx_data,
    rx_size,
    timeout
);

HAL_I2C_Mem_Write(
    &hi2c1,
    address_7bit << 1,
    register_address,
    I2C_MEMADD_SIZE_8BIT,
    tx_data,
    tx_size,
    timeout
);

HAL_I2C_Mem_Read(
    &hi2c1,
    address_7bit << 1,
    register_address,
    I2C_MEMADD_SIZE_8BIT,
    rx_data,
    rx_size,
    timeout
);

HAL_I2C_IsDeviceReady(
    &hi2c1,
    address_7bit << 1,
    trials,
    timeout
);
```

割り込み版やDMA版でも、`DevAddress` の考え方は同じです。

```c
HAL_I2C_Master_Transmit_IT(
    &hi2c1,
    address_7bit << 1,
    tx_data,
    tx_size
);

HAL_I2C_Master_Receive_DMA(
    &hi2c1,
    address_7bit << 1,
    rx_data,
    rx_size
);
```

## データシートの表記に注意する

混乱の原因は、データシートによってアドレスの書き方が異なることです。

### 7bitアドレスで記載されている場合

次のように書かれている場合は、通常7bitアドレスです。

```text
Slave address: 0x14
7-bit I2C address: 0x14
```

この場合、HALには左シフトして渡します。

```c
HAL_I2C_Master_Transmit(
    &hi2c1,
    0x14 << 1,
    data,
    size,
    100
);
```

HALへ渡す値は `0x28` です。

### WriteとReadが分けて記載されている場合

古いデータシートなどでは、次のようにWrite用とRead用の値が分けて書かれていることがあります。

```text
Write address: 0x28
Read address : 0x29
```

この場合、元の7bitアドレスは `0x14` です。

```text
0x28 >> 1 = 0x14
0x29 >> 1 = 0x14
```

STM32 HALには、WriteでもReadでも `0x28` を渡します。

```c
// Write
HAL_I2C_Master_Transmit(
    &hi2c1,
    0x28,
    tx_data,
    tx_size,
    100
);

// Read
HAL_I2C_Master_Receive(
    &hi2c1,
    0x28,
    rx_data,
    rx_size,
    100
);
```

Read用として記載された `0x29` を `HAL_I2C_Master_Receive()` に渡す必要はありません。

## シフトしなくても動作した場合

STM32F4でアドレスをシフトせずに通信できたとしても、F4だけ仕様が違うとは限りません。

たとえば、次のコードで通信できたとします。

```c
HAL_I2C_Master_Transmit(
    &hi2c1,
    0x14,
    data,
    size,
    100
);
```

この場合、HALへ渡した `0x14` は、7bitアドレスとして見ると次の値に対応します。

```text
0x14 >> 1 = 0x0A
```

つまり、相手機器の実際の7bitアドレスが `0x0A` で、データシートにWrite用アドレス `0x14` が記載されていた可能性があります。

```text
実際の7bitアドレス：0x0A
Write時のアドレス ：0x14
Read時のアドレス  ：0x15
```

シフトしなくても動いたのではなく、**最初からシフト済みの値をHALへ渡していた**と考えられます。

## よくある間違い

### 7bitアドレスをそのまま渡す

7bitアドレスが `0x14` なのに、そのままHALへ渡しています。

```c
// 間違い
HAL_I2C_Master_Transmit(
    &hi2c1,
    0x14,
    data,
    size,
    100
);
```

HALが扱うアドレス値としては `0x14` なので、バス上では7bitアドレス `0x0A` の機器へアクセスすることになります。

正しくは次の記述です。

```c
HAL_I2C_Master_Transmit(
    &hi2c1,
    0x14 << 1,
    data,
    size,
    100
);
```

### すでにシフトされた値を、さらにシフトする

データシートの `0x28` がWrite用アドレスなのに、さらに左シフトしています。

```c
// 間違い
HAL_I2C_Master_Transmit(
    &hi2c1,
    0x28 << 1,
    data,
    size,
    100
);
```

計算結果は `0x50` です。

元の7bitアドレス `0x14` とは異なる機器へアクセスしようとしてしまいます。

### Receive時にReadビットを追加する

```c
// 推奨しない
HAL_I2C_Master_Receive(
    &hi2c1,
    (0x14 << 1) | 1,
    data,
    size,
    100
);
```

`HAL_I2C_Master_Receive()` がRead方向を設定するため、ユーザー側で `| 1` を追加する必要はありません。

## アドレス表記の確認方法

データシートの値が7bitなのか、R/Wビット込みなのか分からない場合は、アドレスの説明図を確認します。

次の表記なら7bitアドレスです。

```text
A6 A5 A4 A3 A2 A1 A0
```

次の表記なら、最後にR/Wビットが含まれています。

```text
A6 A5 A4 A3 A2 A1 A0 R/W
```

WriteとReadでアドレス値が1だけ違う場合も、R/Wビット込みの表記である可能性が高いです。

```text
Write: 0x28
Read : 0x29
```

この2つの値を右へ1bitシフトすると、同じ7bitアドレスになります。

```text
0x28 >> 1 = 0x14
0x29 >> 1 = 0x14
```

## まとめ

STM32 HALのI²Cマスター関数には、7bitアドレスを1bit左シフトして渡します。

```c
HAL_I2C_Master_Transmit(
    &hi2c1,
    address_7bit << 1,
    data,
    size,
    timeout
);
```

7bitアドレスが `0x14` の場合は、次の関係になります。

| 項目 | 値 |
|---|---:|
| データシート上の7bitアドレス | `0x14` |
| HALへ渡す値 | `0x28` |
| Write時にバスへ送られる値 | `0x28` |
| Read時にバスへ送られる値 | `0x29` |

HALへ渡す値はWriteでもReadでも `0x28` です。

迷ったときは、データシートの値が「7bitアドレス」なのか、「R/Wビットを含むアドレスバイト」なのかを確認します。ここを区別できれば、シフトするべきかどうかを判断できます。

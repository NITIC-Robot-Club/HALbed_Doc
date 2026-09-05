---
title: I2C HAL API
---
# I2C HAL API

## 概要

STM32 HALのI2C APIを説明する。HALbedの `I2C` クラスは、同期通信、レジスタ通信、デバイス確認、DMA通信をこのAPIへ委譲している。

---

## アドレスの扱い

HALのI2C APIでは、通常7bitアドレスを左へ1bitシフトした値を渡す。

```cpp
uint16_t hal_address = static_cast<uint16_t>(device_address_7bit) << 1;
```

R/WビットはHALが通信時に扱うため、アドレスへ手動で加えない。HALbedの `write()`、`read()`、`writeMem()` なども7bitアドレスを受け取り、内部で左シフトしている。

---

## 関数概要

### `HAL_I2C_Master_Transmit` / `HAL_I2C_Master_Receive`

```cpp
HAL_StatusTypeDef HAL_I2C_Master_Transmit(
    I2C_HandleTypeDef *hi2c,
    uint16_t DevAddress,
    uint8_t *pData,
    uint16_t Size,
    uint32_t Timeout);

HAL_StatusTypeDef HAL_I2C_Master_Receive(
    I2C_HandleTypeDef *hi2c,
    uint16_t DevAddress,
    uint8_t *pData,
    uint16_t Size,
    uint32_t Timeout);
```

I2Cマスタとしてデータを同期送受信する。`Timeout` の単位はmsで、`HAL_MAX_DELAY` を指定すると完了まで待つ。

### `HAL_I2C_Mem_Write` / `HAL_I2C_Mem_Read`

```cpp
HAL_StatusTypeDef HAL_I2C_Mem_Write(
    I2C_HandleTypeDef *hi2c,
    uint16_t DevAddress,
    uint16_t MemAddress,
    uint16_t MemAddSize,
    uint8_t *pData,
    uint16_t Size,
    uint32_t Timeout);

HAL_StatusTypeDef HAL_I2C_Mem_Read(
    I2C_HandleTypeDef *hi2c,
    uint16_t DevAddress,
    uint16_t MemAddress,
    uint16_t MemAddSize,
    uint8_t *pData,
    uint16_t Size,
    uint32_t Timeout);
```

センサやEEPROMなど、レジスタアドレスを持つデバイスを読み書きする。`MemAddSize` は `I2C_MEMADD_SIZE_8BIT` または `I2C_MEMADD_SIZE_16BIT`。

### `HAL_I2C_IsDeviceReady`

```cpp
HAL_StatusTypeDef HAL_I2C_IsDeviceReady(
    I2C_HandleTypeDef *hi2c,
    uint16_t DevAddress,
    uint32_t Trials,
    uint32_t Timeout);
```

指定アドレスのデバイスがACKを返すか確認する。

### DMA通信

```cpp
HAL_StatusTypeDef HAL_I2C_Master_Transmit_DMA(
    I2C_HandleTypeDef *hi2c, uint16_t DevAddress,
    uint8_t *pData, uint16_t Size);

HAL_StatusTypeDef HAL_I2C_Master_Receive_DMA(
    I2C_HandleTypeDef *hi2c, uint16_t DevAddress,
    uint8_t *pData, uint16_t Size);

HAL_StatusTypeDef HAL_I2C_Mem_Write_DMA(
    I2C_HandleTypeDef *hi2c, uint16_t DevAddress,
    uint16_t MemAddress, uint16_t MemAddSize,
    uint8_t *pData, uint16_t Size);

HAL_StatusTypeDef HAL_I2C_Mem_Read_DMA(
    I2C_HandleTypeDef *hi2c, uint16_t DevAddress,
    uint16_t MemAddress, uint16_t MemAddSize,
    uint8_t *pData, uint16_t Size);
```

DMA版は通信開始の結果を返してすぐ戻る。完了を検出する場合は、対象HALのI2C完了コールバックを実装する。

---

## 使用方法

### CubeMXの設定

1. I2CのSCL、SDAピンとGPIOのPull-upを設定する。
2. I2C速度、アドレスモード、アナログフィルタを設定する。
3. DMA通信を使う場合はI2CのTX/RX DMAを追加する。
4. 割り込み通信を使う場合はI2C event/error interruptを有効にする。

---

## 注意事項

- デバイスのデータシートで指定されるアドレス表記が7bitか8bitか確認する。
- `HAL_I2C_Mem_Read()` のメモリアドレス幅は、デバイスのレジスタ仕様に合わせる。
- DMA開始後に送受信バッファを変更・解放しない。
- I2CのバスがBUSYのままになる場合は、配線、Pull-up、クロックストレッチ、デバイスの電源を確認する。
- HALbedのI2C同期メソッドは `HAL_MAX_DELAY` を使うため、リアルタイム処理や割り込み内で呼ばない。

---

## サンプルコード

### レジスタを読み書きする

```cpp
#include "main.h"

extern I2C_HandleTypeDef hi2c1;

constexpr uint8_t SENSOR_ADDRESS = 0x28;  // 7bitアドレス
constexpr uint8_t MODE_REGISTER = 0x3D;

bool sensor_set_mode(uint8_t mode) {
    return HAL_I2C_Mem_Write(
               &hi2c1,
               static_cast<uint16_t>(SENSOR_ADDRESS) << 1,
               MODE_REGISTER,
               I2C_MEMADD_SIZE_8BIT,
               &mode,
               1,
               100) == HAL_OK;
}

bool sensor_read(uint8_t register_address, uint8_t *data, uint16_t size) {
    return HAL_I2C_Mem_Read(
               &hi2c1,
               static_cast<uint16_t>(SENSOR_ADDRESS) << 1,
               register_address,
               I2C_MEMADD_SIZE_8BIT,
               data,
               size,
               100) == HAL_OK;
}

bool sensor_ready(void) {
    return HAL_I2C_IsDeviceReady(
               &hi2c1,
               static_cast<uint16_t>(SENSOR_ADDRESS) << 1,
               3,
               100) == HAL_OK;
}
```

この例はHALbedの `I2C` クラスを使わず、アドレス変換とレジスタ通信をHAL APIで直接行っている。

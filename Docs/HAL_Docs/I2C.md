---
title: I2C HAL API
---
# I2C HAL API

## 概要

STM32 HALのI2C APIを説明します。同期通信、レジスタ通信、デバイス確認、DMA通信に使う関数と設定を扱います。

---

## アドレスの扱い

HALのI2C APIでは、通常7bitアドレスを左へ1bitシフトした値を渡す。

R/WビットはHALが通信時に扱うため、アドレスへ手動で加えません。HAL関数へ渡す値は、対象シリーズのHAL実装で確認してください。

---

## 関数概要

<ApiSignature :signature="'HAL_StatusTypeDef HAL_I2C_Master_Transmit( I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint8_t *pData, uint16_t Size, uint32_t Timeout);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_I2C_Master_Receive( I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint8_t *pData, uint16_t Size, uint32_t Timeout);'" />

I2Cマスタとしてデータを同期送受信する。`Timeout` の単位はmsで、`HAL_MAX_DELAY` を指定すると完了まで待つ。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_I2C_Mem_Write( I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t *pData, uint16_t Size, uint32_t Timeout);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_I2C_Mem_Read( I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t *pData, uint16_t Size, uint32_t Timeout);'" />

センサやEEPROMなど、レジスタアドレスを持つデバイスを読み書きする。`MemAddSize` は `I2C_MEMADD_SIZE_8BIT` または `I2C_MEMADD_SIZE_16BIT`。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_I2C_IsDeviceReady( I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint32_t Trials, uint32_t Timeout);'" />

指定アドレスのデバイスがACKを返すか確認する。

### DMA通信

<ApiSignature :signature="'HAL_StatusTypeDef HAL_I2C_Master_Transmit_DMA( I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint8_t *pData, uint16_t Size);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_I2C_Master_Receive_DMA( I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint8_t *pData, uint16_t Size);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_I2C_Mem_Write_DMA( I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t *pData, uint16_t Size);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_I2C_Mem_Read_DMA( I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t *pData, uint16_t Size);'" />

DMA版は通信開始の結果を返してすぐ戻る。完了を検出する場合は、対象HALのI2C完了コールバックを実装する。

---

## I2Cハンドル

### `I2C_HandleTypeDef` {#type-i2c-handletype-def}

I2Cインスタンスの設定と通信状態を保持します。CubeMXが生成する `hi2c` を送受信関数へ渡してください。

| メンバー | 内容 |
| --- | --- |
| `Instance` | 使用するI2Cレジスタの先頭アドレス |
| `Init` | タイミング、アドレス方式、スレーブ応答などの初期設定 |
| `pBuffPtr` | 現在の送受信バッファ |
| `XferSize`、`XferCount` | 転送全体の長さと残りのデータ数 |
| `XferOptions`、`PreviousState` | シーケンス通信で使う転送条件と直前の状態 |
| `XferISR` | 割り込み転送中に状態を進めるHAL内部処理 |
| `hdmatx`、`hdmarx` | 送受信にリンクしたDMAハンドル |
| `Lock`、`State`、`Mode`、`ErrorCode` | HALが管理する排他・通信状態・通信モード・エラー |
| `AddrEventCount` | アドレスイベントの処理数を管理する内部カウンター |

転送中に更新されるフィールドはHALが使用します。アプリケーションはハンドル内のポインターや状態値を直接変えず、送受信APIとコールバックを使います。

### `I2C_InitTypeDef` {#type-i2c-inittype-def}

`I2C_HandleTypeDef.Init`に入り、タイミングとアドレス応答などを設定します。G4 HALでは`Timing`にI2Cタイミングレジスタ値を指定します。クロック速度だけから値を推測せず、CubeMXまたはタイミング計算ツールでバス容量、立ち上がり時間、クロック源を含めて決めます。

| メンバー | 内容 |
| --- | --- |
| `Timing` | SCLのLow/High期間などをまとめたタイミング値 |
| `OwnAddress1`、`AddressingMode` | 自機アドレスと7bit/10bitアドレス方式 |
| `DualAddressMode`、`OwnAddress2`、`OwnAddress2Masks` | 2つ目の自機アドレス応答 |
| `GeneralCallMode` | General Callへの応答 |
| `NoStretchMode` | クロックストレッチを許可するか |

マスタとして外部デバイスと通信するだけなら、`OwnAddress*`などスレーブ用設定は通常使わない。スレーブ機能を有効にするときは、相手側が要求するクロックストレッチやアドレス応答と合わせる。

HALの転送APIは、通常7bitアドレスを1bit左へシフトした値を受け取ります。この規則は一般的なG4 HALでの扱いです。対象シリーズのヘッダと実装を確認してください。

---


## 注意事項

- デバイスのデータシートで指定されるアドレス表記が7bitか8bitか確認する。
- `HAL_I2C_Mem_Read()` のメモリアドレス幅は、デバイスのレジスタ仕様に合わせる。
- DMA開始後に送受信バッファを変更・解放しない。
- I2CのバスがBUSYのままになる場合は、配線、Pull-up、クロックストレッチ、デバイスの電源を確認する。
- `HAL_MAX_DELAY`を指定した同期通信は完了まで待ち続けるため、リアルタイム処理や割り込み内で呼ばない。
- `Timeout`はHAL tickを基準にしたミリ秒単位。HAL tick停止中や割り込み優先度の組み合わせによっては、期待した時間でタイムアウトしない場合がある。
- DMA受信でバッファをスタック上に置く場合は、関数が戻った後も通信完了まで寿命が続く設計にする。通常はstatic領域または所有期間が明確なメンバー配列を使う。

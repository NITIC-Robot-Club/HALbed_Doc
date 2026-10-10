---
title: UART HAL API
---
# UART HAL API

## 概要

STM32 HALのUART APIを説明します。同期送受信、受信割り込み、UARTフラグ確認、ログ送信に使う関数を扱います。

---

## 関数概要

<ApiSignature :signature="'HAL_StatusTypeDef HAL_UART_Transmit( UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size, uint32_t Timeout);'" />

指定バイト数を同期送信します。送信が完了するまで関数から戻りません。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_UART_Receive( UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size, uint32_t Timeout);'" />

指定バイト数を同期受信する。`Timeout` の単位はms。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_UART_Receive_IT( UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size);'" />

割り込みで指定バイト数を受信する。受信完了時に `HAL_UART_RxCpltCallback()` が呼ばれる。

<ApiSignature :signature="'void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart);'" />

UART受信完了のユーザー実装入口。連続受信する場合は、コールバック内またはメイン処理で再度 `HAL_UART_Receive_IT()` を開始する。

<ApiSignature :signature="'__HAL_UART_GET_FLAG(huart, UART_FLAG_RXNE);'" />

UARTステータスフラグを確認するマクロ。STM32シリーズによって受信データフラグが `UART_FLAG_RXNE` または `UART_FLAG_RXFNE` になる場合がある。

### DMA送信・受信

<ApiSignature :signature="'HAL_StatusTypeDef HAL_UART_Transmit_DMA( UART_HandleTypeDef *huart, const uint8_t *pData, uint16_t Size);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_UART_Receive_DMA( UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size);'" />

DMA版は転送を開始すると関数から戻ります。DMAを使う場合は送信完了コールバックを実装し、転送が終わるまでバッファを有効な状態に保ちます。

---

## UARTハンドル

### `UART_HandleTypeDef` {#type-uart-handletype-def}

UARTインスタンスの設定と送受信状態を保持します。CubeMXが生成する `huart` を各HAL関数へ渡します。

| メンバー | 内容 |
| --- | --- |
| `Instance` | 使用するUSART/UARTレジスタの先頭アドレス |
| `Init` | ボーレート、データ形式、送受信モードなどの初期設定 |
| `AdvancedInit` | ピン反転、入出力交換、Receiver Timeoutなどの拡張設定 |
| `pTxBuffPtr`、`pRxBuffPtr` | 現在の送受信バッファ |
| `TxXferSize`、`TxXferCount` | 送信全体の長さと残りのデータ数 |
| `RxXferSize`、`RxXferCount` | 受信全体の長さと残りのデータ数 |
| `hdmatx`、`hdmarx` | 送受信にリンクしたDMAハンドル |
| `gState`、`RxState` | HALが管理する送信・受信の状態 |
| `ErrorCode` | HALが記録するUARTエラー |
| `Mask`、`FifoMode`、`NbRxDataToProcess`、`NbTxDataToProcess` | データマスク、FIFO設定、割り込みで処理するデータ数 |
| `RxISR`、`TxISR` | 受信・送信割り込み時にHALが呼ぶ内部処理 |

バッファポインターや転送カウンターは非同期転送中にHALが参照・更新します。アプリケーションは直接変更せず、転送APIと完了コールバックを使います。各フィールドの有無はシリーズとHALの版で異なります。

### `UART_InitTypeDef` {#type-uart-inittype-def}

UARTの基本通信形式を指定する設定構造体です。メンバーの役割は[UART_InitTypeDefと拡張設定](#uart-init-settings)を参照してください。

### `UART_InitTypeDef`と拡張設定 {#uart-init-settings}

UARTの基本通信形式は、ボーレート、データ長、パリティ、ストップビット、送受信モード、フロー制御で決まる。設定を片側だけ変更すると、APIは正常終了しても相手側で文字化けやフレーミングエラーが起きる。

| メンバー | 内容 |
| --- | --- |
| `BaudRate` | 通信速度。相手装置と一致させる |
| `WordLength` | データ幅。パリティビットを含むビット数の表現に注意する |
| `StopBits` | フレーム終端に使うストップビット数 |
| `Parity` | パリティなし、偶数、奇数の選択 |
| `Mode` | 送信、受信、または送受信の有効化 |
| `HwFlowCtl` | RTS/CTSなどのハードウェアフロー制御 |
| `OverSampling` | 受信サンプリング倍率 |
| `OneBitSampling` | 1ビットサンプリング方式を使うか |
| `ClockPrescaler` | UARTカーネルクロックの分周。対応インスタンスのみ |

### `UART_AdvFeatureInitTypeDef` {#type-uart-advfeatureinittype-def}

UARTの拡張機能を個別に有効化し、各機能の値を指定します。`AdvancedInit`に設定します。

| メンバー | 内容 |
| --- | --- |
| `AdvFeatureInit` | 初期化する拡張機能の選択ビット |
| `TxPinLevelInvert`、`RxPinLevelInvert` | TXまたはRXの論理レベル反転 |
| `DataInvert` | データビットの論理反転 |
| `Swap` | TX/RXピン機能の入れ替え |
| `OverrunDisable` | 受信オーバーラン検出の無効化 |
| `DMADisableonRxError` | RXエラー時にDMAを停止するか |
| `AutoBaudRateEnable`、`AutoBaudRateMode` | 自動ボーレート検出と検出方法 |
| `MSBFirst` | 対応機能でのビット送信順 |

拡張機能の種類はUARTインスタンスとHAL版で異なります。`AdvFeatureInit`で有効にした項目だけ、対応する設定値が使われます。

G4のHAL資料にはFIFOしきい値、FIFO有効化、Receiver Timeout、Wake-up、RS-485などの拡張APIも含まれる。一方で、F4資料ではReceive-to-Idle系APIなど別の拡張項目が記載されている。関数名だけでシリーズ対応を判断せず、使用するHALパッケージのヘッダを確認する。

---


## 注意事項

- 同じUARTハンドルに対して同期受信と割り込み受信を同時に開始しない。
- 割り込み受信バッファは、受信完了まで有効な領域でなければならない。
- `HAL_UART_RxCpltCallback()` 内で長い処理やブロッキング送信をしない。
- `HAL_MAX_DELAY` を使う同期送信・受信は、割り込み内から呼ばない。
- HALのUART APIとUSART APIは、CubeMXが生成するハンドル型や使用可能なオプションが異なる場合がある。
- `HAL_UART_Receive_IT()`は指定したサイズ分を受け取って完了する方式。可変長フレームやアイドル時間で区切る通信では、対象シリーズが提供するReceive-to-Idle APIやDMA循環受信の利用を検討する。
- UART割り込みコールバックはIRQ文脈で動く。受信データをキューへ退避し、解析やログ出力はメインループなどで行う。

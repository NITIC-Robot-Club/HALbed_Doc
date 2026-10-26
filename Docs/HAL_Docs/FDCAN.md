---
title: FDCAN HAL API
---
# FDCAN HAL API

## 概要

STM32G4 HALのFDCAN APIを説明します。FDCANはClassic CANとCAN FDの両方を扱い、送受信キュー、フィルタ、割り込み通知をMessage RAM上に構成します。Classic CAN用の`CAN_HandleTypeDef` APIとは型と設定手順が異なります。

このページはSTM32G4 HALを中心にまとめる。FDCANの有無、Message RAM容量、フィルタやFIFOの上限はMCUごとに異なるため、使用する型や数値は対象MCUのHALヘッダ・リファレンスマニュアルで確認する。


---

## 関数概要

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_Start(FDCAN_HandleTypeDef *hfdcan);'" />

FDCANペリフェラルを開始する。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_Stop(FDCAN_HandleTypeDef *hfdcan);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_DeInit(FDCAN_HandleTypeDef *hfdcan);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_Init(FDCAN_HandleTypeDef *hfdcan);'" />

`Stop()` は通信を停止し、設定レジスタへアクセスできる状態にする。`DeInit()` はHALの初期化状態を解除し、`Init()` はハンドルの設定値から再初期化する。通信の再起動では、初期化後に必要なフィルタ、遅延補償、通知を再設定してから `Start()` を呼ぶ。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_ConfigFilter( FDCAN_HandleTypeDef *hfdcan, const FDCAN_FilterTypeDef *sFilterConfig);'" />

標準IDまたは拡張IDの受信フィルタを設定する。ID種別、フィルタ番号、マスク、転送先FIFOを `FDCAN_FilterTypeDef` で指定する。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_ActivateNotification( FDCAN_HandleTypeDef *hfdcan, uint32_t ActiveITs, uint32_t BufferIndexes);'" />

受信FIFOなどの通知を有効にする。FIFO受信では `FDCAN_IT_RX_FIFO0_NEW_MESSAGE` または `FDCAN_IT_RX_FIFO1_NEW_MESSAGE` を指定する。

<ApiSignature :signature="'uint32_t HAL_FDCAN_GetRxFifoFillLevel( const FDCAN_HandleTypeDef *hfdcan, uint32_t RxFifo);'" />

指定したFIFOに残っているメッセージ数を返す。受信割り込み内でこの値を確認し、0になるまで`HAL_FDCAN_GetRxMessage()`を呼ぶと、1回の通知で複数のメッセージを読み出せる。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_AddMessageToTxFifoQ( FDCAN_HandleTypeDef *hfdcan, const FDCAN_TxHeaderTypeDef *pTxHeader, const uint8_t *pTxData);'" />

送信FIFOキューへメッセージを追加する。ID種別、Classic CAN/CAN FD、ビットレートスイッチ、DLCを送信ヘッダに設定する。

<ApiSignature :signature="'uint32_t HAL_FDCAN_GetTxFifoFreeLevel(FDCAN_HandleTypeDef *hfdcan);'" />

送信FIFOキューの空き数を返す。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_GetRxMessage( FDCAN_HandleTypeDef *hfdcan, uint32_t RxLocation, FDCAN_RxHeaderTypeDef *pRxHeader, uint8_t *pRxData);'" />

指定した受信FIFOからメッセージを取り出す。`RxLocation` は `FDCAN_RX_FIFO0` または `FDCAN_RX_FIFO1`。

### 送信遅延補償（TDC）

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_ConfigTxDelayCompensation( FDCAN_HandleTypeDef *hfdcan, uint32_t TdcOffset, uint32_t TdcFilter);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_EnableTxDelayCompensation( FDCAN_HandleTypeDef *hfdcan);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_FDCAN_DisableTxDelayCompensation( FDCAN_HandleTypeDef *hfdcan);'" />

TDC は、CAN FD のデータフェーズでトランシーバーなどに生じる送信遅延を補正する機能である。`ConfigTxDelayCompensation()` でオフセットとフィルター窓を設定し、`EnableTxDelayCompensation()` で有効にする。STM32G4 HAL では両値は `0x00`～`0x7F` の範囲で、ハンドルが `READY` 状態のときに設定する。必要性と値はデータビットレート、クロック、トランシーバー遅延に依存するため、対象MCUのリファレンスマニュアルとCAN FDトランシーバーの仕様から決める。

### 受信コールバック

<ApiSignature :signature="'void HAL_FDCAN_RxFifo0Callback( FDCAN_HandleTypeDef *hfdcan, uint32_t RxFifo0ITs);'" />

<ApiSignature :signature="'void HAL_FDCAN_RxFifo1Callback( FDCAN_HandleTypeDef *hfdcan, uint32_t RxFifo1ITs);'" />

新しいメッセージの通知を受けるユーザー実装の入口。コールバック内で `HAL_FDCAN_GetRxMessage()` を呼ぶ。

---

## 構造体・設定型

### `FDCAN_HandleTypeDef` {#type-fdcan-handletype-def}

FDCANインスタンスの初期化値と動作状態を保持するハンドルです。CubeMXが生成する `hfdcan` を各HAL関数へ渡します。

| メンバー | 内容 |
| --- | --- |
| `Instance` | 使用するFDCANレジスタの先頭アドレス |
| `Init` | ビットタイミング、フィルタ数、送信方式などの初期設定 |
| `msgRam` | 標準・拡張フィルタ、受信FIFO、送信領域のMessage RAM開始位置 |
| `LatestTxFifoQRequest` | 最後に送信キューへ追加した要求番号 |
| `State` | HALが管理する初期化・通信状態 |
| `Lock` | HAL内部の同時操作を制御するロック |
| `ErrorCode` | HALが記録するFDCANエラー |

### `FDCAN_MsgRamAddressTypeDef` {#type-fdcan-msgramaddresstypedef}

`FDCAN_HandleTypeDef.msgRam`に入り、Message RAM内の各領域の開始位置を保持します。HALが初期化時に設定するため、アプリケーションから直接書き換えません。

| メンバー | Message RAM内の領域 |
| --- | --- |
| `StandardFilterSA` | 標準IDフィルタリスト |
| `ExtendedFilterSA` | 拡張IDフィルタリスト |
| `RxFIFO0SA`、`RxFIFO1SA` | 受信FIFO0、FIFO1 |
| `TxEventFIFOSA` | 送信イベントFIFO |
| `TxFIFOQSA` | 送信FIFOまたはQueue |

### `FDCAN_FilterTypeDef` {#type-fdcan-filtertypedef}

受信フィルタのID種別、フィルタ番号、マスク、転送先FIFOをまとめて指定します。設定可能な値はMCUシリーズのHAL定義に従います。

| メンバー | 内容 |
| --- | --- |
| `IdType` | 標準ID用か拡張ID用か |
| `FilterIndex` | 対象フィルタリスト内の番号 |
| `FilterType` | マスク、範囲、IDリストなどの照合方式 |
| `FilterConfig` | 一致フレームをFIFOへ格納するか、優先通知するかなどの動作 |
| `FilterID1` | 比較するID、範囲の下限、またはリストの1つ目のID |
| `FilterID2` | マスク、範囲の上限、またはリストの2つ目のID |

### `FDCAN_TxHeaderTypeDef` {#type-fdcan-txheadertypedef}

送信フレームの形式と送信イベント記録を指定します。

| メンバー | 内容 |
| --- | --- |
| `Identifier` | 送信ID。標準IDは11bit、拡張IDは29bit |
| `IdType` | 標準IDか拡張IDか |
| `TxFrameType` | データフレームかリモートフレームか |
| `DataLength` | 送信長を表すDLC定数。単純なバイト数ではない |
| `ErrorStateIndicator` | CAN FDのESIビット |
| `BitRateSwitch` | CAN FDデータ相でビットレートを切り替えるか |
| `FDFormat` | Classic CAN形式かCAN FD形式か |
| `TxEventFifoControl` | 送信結果をTx Event FIFOへ記録する設定 |
| `MessageMarker` | Tx Event FIFO内のイベントと送信要求を対応させる8bit値 |

### `FDCAN_RxHeaderTypeDef` {#type-fdcan-rxheadertypedef}

受信フレームの情報をHALが格納します。

| メンバー | 内容 |
| --- | --- |
| `Identifier`、`IdType` | 受信IDと標準・拡張の区別 |
| `RxFrameType` | データフレームかリモートフレームか |
| `DataLength` | 受信長を表すDLC定数。実バイト数へ変換して使う |
| `ErrorStateIndicator` | 受信フレームのESI情報 |
| `BitRateSwitch` | BRSビットの状態 |
| `FDFormat` | Classic CAN形式かCAN FD形式か |
| `RxTimestamp` | 受信開始時に取得したタイムスタンプカウンター値 |
| `FilterIndex` | 一致した受信フィルタ番号 |
| `IsFilterMatchingFrame` | フィルタに一致せず、グローバル設定で受け入れられたフレームか |

### `FDCAN_InitTypeDef` {#type-fdcan-inittype-def}

`FDCAN_HandleTypeDef.Init`に入り、フレーム形式、ビットタイミング、Message RAMの各要素数、送信FIFO/Queue方式を指定します。CubeMX生成コードを確認するときは、次の項目を順に読むと設定の意図を追えます。

| メンバー | 内容 |
| --- | --- |
| `ClockDivider` | FDCANカーネルクロックの分周 |
| `FrameFormat` | Classic CAN、CAN FD、CAN FD+BRSなどのフレーム形式 |
| `Mode` | 通常、内部ループバック、外部ループバックなどの動作 |
| `AutoRetransmission` | エラー時の自動再送を有効にするか |
| `TransmitPause` | 送信間にプロトコル上の一時停止を挿入するか |
| `ProtocolException` | CAN FDプロトコル例外処理を有効にするか |
| `NominalPrescaler` | Arbitration phaseの時間量子分周 |
| `NominalSyncJumpWidth` | Nominal bit timingの再同期幅 |
| `NominalTimeSeg1`、`NominalTimeSeg2` | Nominal bit内のサンプル前後の時間区間 |
| `DataPrescaler` | CAN FDデータ相の時間量子分周 |
| `DataSyncJumpWidth` | データ相の再同期幅 |
| `DataTimeSeg1`、`DataTimeSeg2` | データ相ビット内のサンプル前後の時間区間 |
| `StdFiltersNbr`、`ExtFiltersNbr` | Message RAMに確保する標準・拡張IDフィルタ数 |
| `TxFifoQueueMode` | 送信領域をFIFOとして使うか、優先度付きQueueとして使うか |

ビットタイミング値を単独で決めるのではなく、FDCANカーネルクロック、目標ビットレート、サンプルポイントを起点に算出する。`HAL_FDCAN_Init()`へ渡す各分周値・セグメント値の有効範囲は、対象品種とHAL版に対応するリファレンスマニュアルの表を確認する。

---

## 主要な設定値

| 設定 | 代表的な値 | 内容 |
| --- | --- | --- |
| `IdType` | `FDCAN_STANDARD_ID`、`FDCAN_EXTENDED_ID` | 標準IDまたは拡張ID |
| `FDFormat` | `FDCAN_CLASSIC_CAN`、`FDCAN_FD_CAN` | Classic CANまたはCAN FD |
| `BitRateSwitch` | `FDCAN_BRS_OFF`、`FDCAN_BRS_ON` | データビットレート切り替え |
| `DataLength` | `FDCAN_DLC_BYTES_0`～`FDCAN_DLC_BYTES_64` | DLCで表したデータ長 |
| `FilterType` | `FDCAN_FILTER_MASK` など | フィルタ方式 |
| `FilterConfig` | `FDCAN_FILTER_TO_RXFIFO0` など | 受信先 |

`DataLength`にはバイト数ではなくDLC定数を指定する。受信データを扱うときは、ヘッダのDLCを実際のバイト数に変換する。

## 初期化から送受信まで

1. CubeMXでFDCANインスタンス、ピン、カーネルクロック、ビットタイミングを設定する。
2. 標準・拡張フィルタ数、Rx FIFOの深さ、Tx FIFO/Queueの要素数とデータ幅を確保する。
3. `HAL_FDCAN_Init()`の後で`HAL_FDCAN_ConfigFilter()`を呼び、必要なら`HAL_FDCAN_ConfigGlobalFilter()`も設定する。
4. `HAL_FDCAN_Start()`でコントローラーを開始する。
5. 受信通知が必要なら`HAL_FDCAN_ActivateNotification()`を有効にし、NVICとFDCAN IRQ経路も有効にする。
6. 送信前に空き数を確認し、受信コールバックではFIFOの残件数を処理してから戻る。

フィルタを個別設定しても、グローバルフィルタが未設定だと未一致フレームの扱いが意図と異なることがある。受信を許可・拒否するID範囲は、個別フィルタとグローバル設定の両方で確認する。

---

## 注意事項

- Classic CANは最大8バイト、CAN FDは最大64バイトである。
- FDCANのMessage RAM、フィルタ数、FIFO深さはCubeMXの設定と一致させる。
- FDCANの通知コールバックは割り込みコンテキストで実行される。
- `RxFifo0ITs`、`RxFifo1ITs` の値を使って通知種別を判定する場合は、対象MCUのHAL定義を確認する。
- `HAL_FDCAN_GetRxFifoFillLevel()` はFIFO内の件数を返す。コールバックでは件数を確認してから受信処理を繰り返す。
- TDCのオフセットを `DataPrescaler * DataTimeSeg1` のように設定する実装例があるが、式や値をそのまま別MCU・別トランシーバーへ移植しない。物理層の遅延と対象HALの定義を確認する。
- Classic CANの `CAN_*` APIとFDCANの `HAL_FDCAN_*` APIは型・DLC・フィルタ構造体が異なる。
- Message RAMの割当てはインスタンスごとに共有資源となる構成がある。各FIFOの深さとデータ要素サイズを増やすと他領域を圧迫するため、CubeMXの割当て警告と生成コードを確認する。
- データフェーズでビットレートを切り替える設定は、CAN FD対応の相手ノード、トランシーバー、配線条件がそろう場合だけ有効にする。

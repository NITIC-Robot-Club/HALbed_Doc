---
title: Classic CAN HAL API
---
# Classic CAN HAL API

## 概要

STM32 HALのClassic CAN APIを説明します。CANの開始、フィルタ設定、送信、受信コールバックを扱います。

このページは `CAN_HandleTypeDef` と `CAN_FilterTypeDef` を使うClassic CAN向けである。FDCANを使う場合は [FDCAN](./FDCAN.md) を参照する。

---

## 関数概要

<ApiSignature :signature="'HAL_StatusTypeDef HAL_CAN_Start(CAN_HandleTypeDef *hcan);'" />

CANペリフェラルを開始する。フィルタ設定後、通知を有効にする前に呼び出す。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_CAN_ConfigFilter( CAN_HandleTypeDef *hcan, CAN_FilterTypeDef *sFilterConfig);'" />

受信フィルタを設定する。フィルタID、マスク、FIFO、フィルタバンク、フィルタスケールを `CAN_FilterTypeDef` で指定する。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_CAN_ActivateNotification( CAN_HandleTypeDef *hcan, uint32_t ActiveITs);'" />

指定したCAN割り込み通知を有効にする。FIFO受信では `CAN_IT_RX_FIFO0_MSG_PENDING` または `CAN_IT_RX_FIFO1_MSG_PENDING` を指定する。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_CAN_AddTxMessage( CAN_HandleTypeDef *hcan, const CAN_TxHeaderTypeDef *pHeader, const uint8_t aData[], uint32_t *pTxMailbox);'" />

送信メールボックスへメッセージを追加する。送信ID、標準/拡張ID、フレーム種別、DLCを `CAN_TxHeaderTypeDef` に設定する。

<ApiSignature :signature="'uint32_t HAL_CAN_GetTxMailboxesFreeLevel( CAN_HandleTypeDef *hcan);'" />

空いている送信メールボックス数を返す。0の場合は送信を開始せず、次の機会まで待つ。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_CAN_GetRxMessage( CAN_HandleTypeDef *hcan, uint32_t RxFifo, CAN_RxHeaderTypeDef *pHeader, uint8_t aData[]);'" />

受信FIFOからメッセージを取り出す。`RxFifo` は `CAN_RX_FIFO0` または `CAN_RX_FIFO1`。

### 受信コールバック

<ApiSignature :signature="'void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan);'" />

<ApiSignature :signature="'void HAL_CAN_RxFifo1MsgPendingCallback(CAN_HandleTypeDef *hcan);'" />

受信FIFOにメッセージが到着したときに呼ばれる。コールバック内で `HAL_CAN_GetRxMessage()` を呼び、ヘッダとデータを取り出す。

---

## 主要な設定構造体

### `CAN_HandleTypeDef` {#type-can-handletype-def}

CANペリフェラルの初期化設定と動作状態を保持するハンドルです。CubeMXが生成する `hcan` を各HAL関数へ渡します。

| メンバー | 内容 |
| --- | --- |
| `Instance` | 使用するCANレジスタの先頭アドレス |
| `Init` | ビットタイミング、再送、FIFOなどの初期設定 |
| `State` | HALが管理する初期化・通信状態 |
| `ErrorCode` | HALが記録するCANエラー |
| コールバックポインター群 | コールバック登録機能を使う構成で、送信完了・受信・エラーなどの通知先を保持 |

`State`と`ErrorCode`はHALの実行時情報です。通常はCubeMXの生成コードが作るハンドルを使い、これらのフィールドを直接変更しません。

### `CAN_InitTypeDef` {#type-can-inittype-def}

`CAN_HandleTypeDef.Init`に入り、Classic CANのビットタイミングと自動動作を指定します。

| メンバー | 内容 |
| --- | --- |
| `Prescaler` | CAN入力クロックを分周する値 |
| `Mode` | 通常、ループバック、サイレントなどの動作モード |
| `SyncJumpWidth` | 再同期時に位相を補正できる最大幅 |
| `TimeSeg1`、`TimeSeg2` | サンプルポイントまでとビット終端側の時間区間 |
| `TimeTriggeredMode` | タイムトリガ通信を有効にするか |
| `AutoBusOff` | Bus-Off後にハードウェアで復帰するか |
| `AutoWakeUp` | スリープ中のバス活動で自動復帰するか |
| `AutoRetransmission` | 送信失敗時に自動再送するか |
| `ReceiveFifoLocked` | FIFO満杯時に古いメッセージを保持するか、新しいメッセージで置き換えるか |
| `TransmitFifoPriority` | 送信FIFOの順序を優先するか、メッセージIDの優先度を使うか |

### `CAN_FilterTypeDef` {#type-can-filtertypedef}

代表的なメンバは次のとおり。

| メンバ | 内容 |
| --- | --- |
| `FilterBank` | 使用するフィルタバンク番号 |
| `FilterMode` | IDマスク方式など |
| `FilterScale` | 16bitまたは32bit |
| `FilterIdHigh`、`FilterIdLow` | IDまたはリスト方式で照合する値の上位・下位部分 |
| `FilterMaskIdHigh`、`FilterMaskIdLow` | マスク方式の比較ビット、またはリスト方式の2つ目のID |
| `FilterFIFOAssignment` | FIFO0またはFIFO1 |
| `FilterActivation` | `ENABLE` / `DISABLE` |
| `SlaveStartFilterBank` | デュアルCAN時のバンク境界。MCUにより扱いが異なる |

### `CAN_TxHeaderTypeDef` {#type-can-txheadertypedef}

送信フレームのIDと形式を指定します。

| メンバー | 内容 |
| --- | --- |
| `StdId` | 11bit標準ID |
| `ExtId` | 29bit拡張ID |
| `IDE` | 標準IDか拡張IDかを選ぶ。対応するIDフィールドを使う |
| `RTR` | データフレームかリモートフレームか |
| `DLC` | 送信データ長。Classic CANでは0～8バイト |
| `TransmitGlobalTime` | 対応モードでタイムスタンプをデータ末尾へ含めるか |

### `CAN_RxHeaderTypeDef` {#type-can-rxheadertypedef}

受信したフレームの情報をHALが格納します。

| メンバー | 内容 |
| --- | --- |
| `StdId`、`ExtId` | 受信ID。`IDE`で有効な方を選ぶ |
| `IDE` | 受信IDが標準形式か拡張形式か |
| `RTR` | データフレームかリモートフレームか |
| `DLC` | 受信データ長 |
| `Timestamp` | タイムトリガ機能で記録した受信時刻 |
| `FilterMatchIndex` | フレームに一致したフィルタ番号 |

## 受信フィルタの考え方

Classic CANのフィルタはID値だけでなく、標準/拡張ID、マスク/リスト方式、16bit/32bitスケール、受信FIFOへの割り当てを組み合わせて設定する。IDマスク方式では、マスクのビットが1の位置を比較対象として扱う。全ビットを比較しない設定では、意図しないフレームも通るため、必要IDと拒否したい範囲を表にしてからIDとマスクを決める。

デュアルCANを備えるSTM32では、フィルタバンクの一部をCAN1とCAN2で分ける境界設定が必要な品種がある。`SlaveStartFilterBank`の意味は搭載CANインスタンス数で変わるので、単一CAN構成へ別品種の値をそのまま移さない。

## ビットタイミング

ボーレートはCANカーネルクロック、Prescaler、Sync Segment、Time Segment 1/2から決まる。設定値は相手ノードと一致させるだけでなく、サンプルポイントとバス長、ノード数、トランシーバー遅延も含めて決める。CubeMXの計算値を使う場合も、実際のクロック源が想定どおりか確認する。

Classic CANではデータフェーズのビットレート切り替えはない。フレーム当たりのデータは最大8バイトであり、CAN FDの64バイトDLCやFDCANフィルタ型は使わない。

---


## 注意事項

- Classic CANのデータ長は最大8バイトで、`DLC` も0～8で指定する。
- 送信キューに空きがないと `HAL_CAN_AddTxMessage()` は失敗することがある。
- 受信割り込みが発生したら、できるだけ早くFIFOからメッセージを取り出す。
- フィルタのID表現は、標準ID・拡張ID、16bit・32bitスケールで配置が異なる。
- F3系などではHALのマクロや構造体の定義が他シリーズと異なる場合がある。
- `HAL_CAN_ActivateNotification()`を呼ぶだけではIRQ経路が完成しない。対象CANのNVIC IRQを有効にし、IRQ関数から`HAL_CAN_IRQHandler()`を呼ぶ設定も確認する。
- 受信コールバックが処理に時間をかけるとFIFOがあふれる。フレームを短時間で退避し、解析や重い処理はメインループで行う。

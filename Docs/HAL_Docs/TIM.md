---
title: TIM HAL API
---
# TIM HAL API

## 概要

STM32 HALのタイマAPIを説明します。タイマの基本動作、PWM、エンコーダ、更新割り込みに使う関数と設定を扱います。

---

## 関数・マクロ概要

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_Base_Init(TIM_HandleTypeDef *htim);'" />

タイマの基本設定を初期化する。`htim->Init.Prescaler`、`htim->Init.Period` などを設定してから呼ぶ。

### クロック源・PWM設定

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_ConfigClockSource( TIM_HandleTypeDef *htim, const TIM_ClockConfigTypeDef *sClockSourceConfig);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_PWM_Init(TIM_HandleTypeDef *htim);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_PWM_ConfigChannel( TIM_HandleTypeDef *htim, const TIM_OC_InitTypeDef *sConfig, uint32_t Channel);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIMEx_MasterConfigSynchronization( TIM_HandleTypeDef *htim, const TIM_MasterConfigTypeDef *sMasterConfig);'" />

`HAL_TIM_ConfigClockSource()`でクロック源を選びます。`HAL_TIM_PWM_Init()`でタイマをPWM用に初期化し、`HAL_TIM_PWM_ConfigChannel()`で出力比較値や極性を設定します。`HAL_TIMEx_MasterConfigSynchronization()`はTRGOやマスター・スレーブ同期を設定します。指定できる値はタイマとシリーズで異なります。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_Base_Start_IT(TIM_HandleTypeDef *htim);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_Base_Stop_IT(TIM_HandleTypeDef *htim);'" />

更新イベント割り込みを開始・停止する。開始後は `HAL_TIM_PeriodElapsedCallback()` が呼ばれる。

<ApiSignature :signature="'void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim);'" />

タイマ更新割り込みのユーザー実装入口。複数タイマを使う場合は `htim` を比較して処理を分ける。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_PWM_Start( TIM_HandleTypeDef *htim, uint32_t Channel);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_PWM_Stop( TIM_HandleTypeDef *htim, uint32_t Channel);'" />

指定チャネルのPWMを開始・停止する。周波数はタイマクロック、Prescaler、ARRで決まり、デューティ比はCCRで決まる。

### PWMのDMA版

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_PWM_Start_DMA( TIM_HandleTypeDef *htim, uint32_t Channel, const uint32_t *pData, uint16_t Length);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_PWM_Stop_DMA( TIM_HandleTypeDef *htim, uint32_t Channel);'" />

CCRへDMAで値を転送し、波形やデューティ比を連続更新する。DMAバッファと転送モードをCubeMXで設定する。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_Encoder_Init( TIM_HandleTypeDef *htim, const TIM_Encoder_InitTypeDef *sConfig);'" />

タイマをエンコーダインターフェースとして初期化する。エンコーダモード、入力極性、入力フィルタなどを `TIM_Encoder_InitTypeDef` で指定する。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_Encoder_Start( TIM_HandleTypeDef *htim, uint32_t Channel);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_Encoder_Stop( TIM_HandleTypeDef *htim, uint32_t Channel);'" />

エンコーダカウントを開始・停止する。通常は `TIM_CHANNEL_ALL` を指定する。

### タイマ設定マクロ

<ApiSignature :signature="'__HAL_TIM_SET_COMPARE(htim, Channel, Compare);'" />

<ApiSignature :signature="'__HAL_TIM_SET_AUTORELOAD(htim, Autoreload);'" />

<ApiSignature :signature="'__HAL_TIM_IS_TIM_COUNTING_DOWN(htim);'" />

CCR、ARR、カウント方向を操作・取得するHALマクロ。マクロの引数や対応タイマは対象シリーズのHALヘッダを確認する。

---

## タイマ設定構造体

### `TIM_HandleTypeDef` {#type-tim-handletype-def}

タイマインスタンスの初期化値、レジスタ状態、HALの動作状態を保持します。

| メンバー | 内容 |
| --- | --- |
| `Instance` | TIMレジスタの先頭アドレス |
| `Init` | Prescaler、CounterMode、Periodなどの基本設定 |
| `Channel` | HALが現在処理しているチャネル |
| `hdma` | タイマチャネルや更新イベントに関連付けたDMAハンドル |
| `Lock`、`State` | HALの排他状態とタイマ全体の状態 |
| `ChannelState`、`ChannelNState` | 通常出力・相補出力チャネルごとの状態 |
| `DMABurstState` | DMA Burst処理の状態 |

これらの状態フィールドはHALが更新します。アプリケーションは`Instance`、`Init`と各初期化APIを使って設定し、`State`類は直接書き換えません。

### `TIM_ClockConfigTypeDef` {#type-tim-clockconfigtypedef}

タイマのクロック源やクロック分周を指定します。

| メンバー | 内容 |
| --- | --- |
| `ClockSource` | 内部クロック、外部入力、トリガなどのクロック源 |
| `ClockPolarity` | 外部クロック入力の有効エッジ |
| `ClockPrescaler` | 外部クロック入力の分周 |
| `ClockFilter` | 外部入力に適用するデジタルフィルタ |

### `TIM_Encoder_InitTypeDef` {#type-tim-encoder-inittype-def}

エンコーダモード、入力極性、入力フィルタなどを指定します。

| メンバー | 内容 |
| --- | --- |
| `EncoderMode` | TI1/TI2のエッジからカウント方向と更新を決めるモード |
| `IC1Polarity`、`IC2Polarity` | 各入力相の有効エッジ |
| `IC1Selection`、`IC2Selection` | 入力キャプチャに使う入力経路 |
| `IC1Prescaler`、`IC2Prescaler` | 入力キャプチャのイベント分周 |
| `IC1Filter`、`IC2Filter` | 各相に適用する入力デジタルフィルタ |

### `TIM_MasterConfigTypeDef` {#type-tim-masterconfigtypedef}

TRGO出力やマスター・スレーブ同期の設定を指定します。

| メンバー | 内容 |
| --- | --- |
| `MasterOutputTrigger` | TRGOに出す更新・比較・その他の内部イベント |
| `MasterOutputTrigger2` | 対応タイマで使う追加のTRGO2イベント |
| `MasterSlaveMode` | 内部トリガ経路でマスター・スレーブ同期を有効にするか |

### `TIM_OC_InitTypeDef` {#type-tim-oc-inittype-def}

出力比較モード、パルス値、極性など、PWMチャネルの設定を指定します。

| メンバー | 内容 |
| --- | --- |
| `OCMode` | PWM、Toggle、Forcedなどの出力比較方式 |
| `Pulse` | CCRへ設定する比較値。PWMのパルス幅を決める |
| `OCPolarity` | チャネル出力の極性 |
| `OCNPolarity` | 対応タイマの相補出力の極性 |
| `OCFastMode` | 出力比較の高速モードを使うか |
| `OCIdleState`、`OCNIdleState` | 停止時やブレーク時の出力アイドル状態 |

### `TIM_Base_InitTypeDef` {#type-tim-base-inittype-def}

CubeMX生成コードでは`TIM_HandleTypeDef.Init`を通じて基本カウンタ設定を渡す。一般的なメンバーは以下のとおり。搭載タイマによって使えるカウント方向、ビット幅、繰り返しカウンタが異なる。

| メンバー | 内容 | 注意点 |
| --- | --- | --- |
| `Prescaler` | 入力クロックを分周する値 | 分周係数は通常`Prescaler + 1` |
| `CounterMode` | Up、Down、Center-aligned等 | Center-alignedでは更新周期やPWM計算が変わる |
| `Period` | ARRに設定する上限値 | カウンタ幅の上限に収める |
| `ClockDivision` | デジタルフィルタ用クロック分周など | カウンタ周波数の分周とは用途が異なる場合がある |
| `RepetitionCounter` | 更新イベントを間引く回数 | 主に対応するAdvanced timerで使う |
| `AutoReloadPreload` | ARR更新を即時反映するか、更新イベントまで待つか | 実行中の周期変更時の挙動を決める |

PWMチャネルでは`TIM_OC_InitTypeDef`の`OCMode`、`Pulse`、`OCPolarity`、必要に応じて相補出力極性やIdle Stateを設定する。`Pulse`は比較値CCRに相当し、出力波形が反転する設定ではデューティの見え方も変わる。

---

## 計算式

基本タイマの更新周波数は、概ね次式で求められる。

```text
更新周波数 = タイマクロック / ((Prescaler + 1) * (Period + 1))
```

PWMのデューティ比は、一般に次式で求められる。

```text
デューティ比 = CCR / (ARR + 1)
```

タイマクロックはAPBの分周設定によりPCLKの2倍になる場合がある。詳細は [RCC・時刻](./RCC.md) を参照する。

---


## 注意事項

- `HAL_TIM_Base_Init()` だけではタイマは動作しない。用途に応じてStart関数を呼ぶ。
- PWMのCCRがARRを超えないようにする。
- エンコーダのカウント値はタイマのビット幅でオーバーフローする。
- コールバックは割り込みコンテキストから呼ばれるため、重い処理やブロッキング処理をしない。
- DMA使用時は、バッファの配置、転送完了、Cache整合性を確認する。
- `HAL_TIM_PWM_ConfigChannel()`と`HAL_TIM_PWM_Start()`は別の処理。初期化済みでもStart関数を呼ぶまで出力は始まらない。
- `Period`や`Pulse`を変更するAPI・マクロはARR/CCRへ反映する。Preload設定や更新イベントによって、変更が出力へ反映されるタイミングが変わる。
- タイマのビット幅やチャネル数はインスタンスごとに異なる。TIM2の設定値をTIM3やTIM6へそのまま移さず、対象MCUのタイマ一覧を確認する。

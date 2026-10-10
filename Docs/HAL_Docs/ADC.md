---
title: ADC HAL API
---
# ADC HAL API

## 概要

STM32 HALのADC APIを説明します。ポーリング取得とDMA取得の関数、設定構造体、使い分けを扱います。

`HAL_ADC_MODULE_ENABLED` が有効で、CubeMXでADCのクロック、チャネル、GPIO、必要ならDMAを設定している必要がある。

---

## 使用するハンドル

### `ADC_HandleTypeDef` {#type-adc-handletype-def}

CubeMXが生成するADCの設定と状態を保持する構造体です。各ADCインスタンスのハンドルを関数へ渡します。

| メンバー | 内容 |
| --- | --- |
| `Instance` | 使用するADCレジスタの先頭アドレス。例: `ADC1` |
| `Init` | クロック、分解能、トリガ、変換方式などの初期設定 |
| `DMA_Handle` | ADCに接続したDMAハンドル。DMA未使用なら設定されない |
| `Lock` | HAL内部で同じハンドルへの同時操作を制御するロック |
| `State` | HALが管理する初期化・変換状態 |
| `ErrorCode` | HALが記録する変換やDMA関連のエラー状態 |
| `InjectionConfig` | G4で注入変換コンテキストを管理する内部設定 |

`State`、`ErrorCode`、`Lock`、`InjectionConfig`はHALが更新する実行時情報です。アプリケーションから直接書き換えず、対応するHAL関数や状態取得関数を使います。

### `ADC_InitTypeDef` {#type-adc-inittype-def}

ADCクロック、分解能、連続・スキャン変換、外部トリガ、DMA要求などADC全体の初期化条件を保持します。G4で使う主なメンバーの読み方は[初期化設定の読み方](#adc-initialization-fields)を参照してください。

### `ADC_ChannelConfTypeDef` {#type-adc-channelconftypedef}

通常変換グループの入力チャネル、Rank、サンプル時間、入力形式、オフセットを指定します。メンバーの詳細は[初期化設定の読み方](#adc-initialization-fields)にまとめています。

ADCのチャネル設定は通常 `MX_ADC1_Init()` で行う。複数チャネルを順番に読む場合は、CubeMXでScan Conversion ModeとRankを設定する。

### 初期化設定の読み方 {#adc-initialization-fields}

STM32G4の`ADC_InitTypeDef`では、変換器全体の動作を設定する。シリーズによってメンバーや選択肢が異なるため、以下はG4 HALを読むときの整理として使い、実際のヘッダとCubeMX生成コードで確かめる。

| メンバー | 内容 |
| --- | --- |
| `ClockPrescaler` | ADCクロック源と分周。共通クロック条件と最大周波数を確認する |
| `Resolution` | 変換結果のビット数 |
| `DataAlign` | データレジスタ内で結果を右詰めまたは左詰めにする設定 |
| `GainCompensation` | G4で変換結果に適用するハードウェアゲイン補正 |
| `ScanConvMode` | 通常・注入グループで複数Rankを順に変換するシーケンサの有効化 |
| `EOCSelection` | Rankごとかシーケンス全体か、変換完了を通知する単位 |
| `LowPowerAutoWait` | 前の変換値を読み出すまで次の変換を待つ設定。G4ではポーリング向け |
| `ContinuousConvMode` | 1回の開始後も通常変換を繰り返すかどうか |
| `NbrOfConversion` | 通常グループに登録する変換Rank数 |
| `DiscontinuousConvMode` | 通常グループのシーケンスを複数回に分けて実行するか |
| `NbrOfDiscConversion` | 不連続モードで1回のトリガに含める変換数 |
| `ExternalTrigConv` | 通常変換を開始する外部イベント源 |
| `ExternalTrigConvEdge` | 外部トリガとして使うエッジ |
| `SamplingMode` | G4で通常グループに使うサンプリング方式 |
| `DMAContinuousRequests` | 変換ごとにDMA要求を続けるか。一方でDMAもCircularに設定する |
| `Overrun` | 未読データがあるとき、新しい値で上書きするか保持するか |
| `OversamplingMode` | オーバーサンプリング機能の有効・無効 |
| `Oversampling` | 比率、右シフト、トリガ方式などをまとめた設定。次項を参照 |
| `InjectionConfig` | 注入変換のコンテキスト数などを保持するHAL管理情報 |

各チャネルは`ADC_ChannelConfTypeDef`で設定する。`Channel`が入力、`Rank`が変換順、`SamplingTime`がサンプル時間である。G4のサンプル時間はADCクロック数で表し、実際の変換時間には分解能に応じた処理時間も加わる。ソースインピーダンスが高い回路や内部チャネルでは、サンプル時間をデータシートに合わせる。

| メンバー | 意味 |
| --- | --- |
| `Channel` | GPIOに対応するADC入力、または内部チャネル |
| `Rank` | 通常変換シーケンス内の順番 |
| `SamplingTime` | サンプル・ホールドに使うADCクロック数 |
| `SingleDiff` | シングルエンド入力か差動入力か。差動対応チャネルだけで選択できる |
| `OffsetNumber` | 割り当てるハードウェアオフセット番号 |
| `Offset` | 変換結果に加減算するオフセット量 |
| `OffsetSign` | オフセットを加算するか減算するか |
| `OffsetSaturation` | 補正結果が範囲外になった場合に飽和させるか |

`HAL_ADC_ConfigChannel()`は通常、変換中ではなく停止状態で呼ぶ。スキャン変換ではDMAバッファの並びがRank順になるため、バッファの添字とCubeMXのRank設定を対応させる。

### `ADC_OversamplingTypeDef` {#type-adc-oversamplingtypedef}

`ADC_InitTypeDef.Oversampling`に入るG4のオーバーサンプリング設定です。

| メンバー | 内容 |
| --- | --- |
| `Ratio` | 内部で積算するサンプル数の比率 |
| `RightBitShift` | 積算後に適用する右シフト量 |
| `TriggeredMode` | トリガごとに積算するか、連続して積算するか |
| `OversamplingStopReset` | 注入変換が入ったときに通常グループの積算を停止・再開するか、リセットするか |

最終分解能やノイズ低減量は`Ratio`と`RightBitShift`の組み合わせで変わります。使える定数と組み合わせはG4 HALのヘッダで確認してください。

### `ADC_InjectionConfigTypeDef` {#type-adc-injectionconfigtypedef}

注入変換のコンテキストキューを管理するG4 HAL内部の設定です。

| メンバー | 内容 |
| --- | --- |
| `ContextQueue` | 注入変換設定をキューに積む機能の有効状態 |
| `ChannelCount` | キューで管理する注入チャネル数 |

この型はHALの注入変換制御に使われます。通常変換だけを使うアプリケーションは直接変更しません。

---

## 関数概要

<ApiSignature :signature="'HAL_StatusTypeDef HAL_ADC_Start(ADC_HandleTypeDef *hadc);'" />

ADC変換を開始する。ポーリングで値を取得する場合は、この関数の後に `HAL_ADC_PollForConversion()` を呼ぶ。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_ADC_PollForConversion( ADC_HandleTypeDef *hadc, uint32_t Timeout);'" />

変換完了を待つ。`Timeout` の単位はmsである。

- `HAL_OK` : 変換完了
- `HAL_TIMEOUT` : 指定時間内に完了しなかった
- `HAL_ERROR` : ADCエラー

<ApiSignature :signature="'uint32_t HAL_ADC_GetValue(ADC_HandleTypeDef *hadc);'" />

直前に完了した変換結果を返す。戻り値の有効範囲はADCの分解能によって異なる。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_ADC_Stop(ADC_HandleTypeDef *hadc);'" />

通常のADC変換を停止する。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_ADC_Start_DMA( ADC_HandleTypeDef *hadc, uint32_t *pData, uint32_t Length);'" />

ADC変換結果を `pData` へDMA転送する。`Length` は転送する要素数で、バッファは転送中も有効でなければならない。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_ADC_Stop_DMA(ADC_HandleTypeDef *hadc);'" />

ADCのDMA転送を停止する。DMAバッファを再利用する前に呼ぶ。

### ADC変換完了コールバック

<ApiSignature :signature="'void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc);'" />

<ApiSignature :signature="'void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *hadc);'" />

DMAの全転送または半転送が完了したときに呼ばれるユーザー実装の入口です。転送完了を処理する場合は、アプリケーション側でコールバックを実装します。

---


## 注意事項

- DMA動作中のADCに対してポーリングAPIを重ねて呼ばない。
- DMAで使うバッファは、転送完了までスコープ外へ出さない。
- 複数チャネルのDMA結果は、CubeMXで設定したRankの順に格納される。
- ADC値を電圧へ変換するときは、実際のVDDA、分圧回路、オフセット、ADCの分解能を考慮する。
- `DMAContinuousRequests = ENABLE`で連続変換する構成ではCircular DMAが必要。Normal DMAのバッファ末尾に達すると、次の変換結果を受け取れずオーバーランする。
- G4の`LowPowerAutoWait`は、結果取得を次の変換開始条件にするポーリング向け設定。DMAや割り込み取得と組み合わせない。
- 内部温度センサー、VREFINT、VBATは利用できるADCやサンプル時間に制約がある。MCUのデータシートを参照する。

---
title: DMA HAL API
---
# DMA HAL API

## 概要

DMAを使うと、CPUがデータを1要素ずつコピーせずに、ペリフェラルとメモリの間で転送できます。PWMの波形出力、ADCの連続取得、UARTの非同期通信などに使います。

DMAチャネル、リクエスト、方向、転送幅、転送モードはMCUとペリフェラルに合わせてCubeMXで設定します。アプリケーションはDMAハンドルを使い、`HAL_TIM_PWM_Start_DMA()`などのAPIで転送を始めます。

## 関数概要

<ApiSignature :signature="'HAL_StatusTypeDef HAL_DMA_Init(DMA_HandleTypeDef *hdma);'" />

`hdma->Init`に設定した要求元、転送方向、データ幅、アドレスの増分、優先度、転送モードを使ってDMAチャネルを初期化します。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_DMA_DeInit(DMA_HandleTypeDef *hdma);'" />

DMAチャネルを停止し、初期化状態を解除します。通常はペリフェラルのMSP DeInit処理から呼び出します。

<ApiSignature :signature="'void HAL_DMA_IRQHandler(DMA_HandleTypeDef *hdma);'" />

DMA割り込みハンドラーから呼び出し、転送完了やエラーを処理します。CubeMXが生成したIRQ関数からDMAハンドルを渡してください。転送が完了すると、対応するHALコールバックが呼ばれます。

<ApiSignature :signature="'__HAL_LINKDMA(peripheralHandle, hdmaField, dmaHandle);'" />

DMAハンドルをUART、TIM、ADCなどのペリフェラルハンドルに関連付けます。ペリフェラル用のDMA APIは、このリンクを通して転送を始めます。

## DMA 構造体

### `DMA_HandleTypeDef` {#type-dma-handletype-def}

DMAチャネルの要求元、方向、データ幅、アドレス増分、優先度、転送状態を保持します。CubeMXが生成するペリフェラルのDMAハンドルを使用します。

| メンバー | 内容 |
| --- | --- |
| `Instance` | DMAチャネルのレジスタ群 |
| `Init` | 要求元、方向、幅、増分、モード、優先度 |
| `Lock`、`State`、`ErrorCode` | HALが管理する排他・実行状態・エラー |
| `Parent` | DMAを使うUART、ADC、TIMなどの親ハンドル |
| `XferCpltCallback`、`XferHalfCpltCallback` | 全転送・半転送完了時にHALが呼ぶ関数ポインター |
| `XferErrorCallback`、`XferAbortCallback` | エラー・中断時にHALが呼ぶ関数ポインター |
| `DmaBaseAddress`、`ChannelIndex` | DMAコントローラー内のレジスタ位置とチャネル番号 |
| `DMAmuxChannel*`、`DMAmuxRequestGen*` | G4のDMAMUXチャネル・要求生成器と状態レジスタへの参照 |

コールバック、`State`、`ErrorCode`、DMAMUX関連のフィールドはHALの制御用です。通常の転送設定は`Init`に設定し、転送開始はペリフェラル側のAPIから行います。F4ではハンドル内のDMA streamやFIFOに関するフィールドが異なります。

### `DMA_InitTypeDef` {#type-dma-inittype-def}

要求元、方向、データ幅、増分、転送モード、優先度を持つ初期化設定です。G4の各項目は[転送設定の決め方](#転送設定の決め方)を参照してください。F4はストリーム固有の設定を含みます。

## DMA モード

| モード | 動作 | 代表的な用途 |
| --- | --- | --- |
| `DMA_NORMAL` | 指定した要素数を1回転送して停止する | PWM の固定波形、UART の1回送信 |
| `DMA_CIRCULAR` | バッファ末尾から先頭へ戻り、転送を繰り返す | ADC の連続サンプリング、連続データ受信 |

`Length`がバイト数を指すか転送要素数を指すかはAPIによって異なります。ペリフェラルとDMAのデータ幅に合わせてください。

## 転送設定の決め方 {#dma-transfer-settings}

G4の`DMA_InitTypeDef`では、要求元と転送単位を次の項目で指定する。CubeMXの名称とHAL構造体メンバーが対応しているので、生成された初期化コードを読むと設定を追いやすい。

| メンバー | 意味 | 例・確認点 |
| --- | --- | --- |
| `Request` | DMAMUXへ接続する要求元 | `DMA_REQUEST_ADC1`、UART TXなど。ペリフェラルと一致させる |
| `Direction` | 転送方向 | Peripheral-to-Memory、Memory-to-Peripheral、Memory-to-Memory |
| `PeriphInc`、`MemInc` | 転送ごとにアドレスを進めるか | ADCデータレジスタは通常固定、配列側は通常増分 |
| `PeriphDataAlignment`、`MemDataAlignment` | 読み書きするデータ幅 | PeripheralとMemoryで幅を変える場合は変換用途を確認 |
| `Mode` | NormalまたはCircular | 1回で止めるか、同じ領域を繰り返し使うか |
| `Priority` | DMA要求間の優先度 | 同時転送が競合するときに調整する。CPU割り込み優先度とは別 |

STM32G4ではDMAチャネルにDMAMUXのリクエストを割り当てる。STM32F4はストリーム方式で、FIFOや二重バッファなど設定も異なる。したがって「DMAチャネル番号」だけでシリーズ間の設定を移植せず、対象MCUのリクエスト表とCubeMX生成コードを基準にする。

転送開始から完了通知までは、概ね「DMAハンドルを初期化 → ペリフェラルハンドルへリンク → ペリフェラルのDMA APIを呼ぶ → DMA IRQで`HAL_DMA_IRQHandler()` → ペリフェラル側コールバック」の順につながる。ペリフェラルの転送APIはリンク済みDMAハンドルを参照するため、`__HAL_LINKDMA`やMSP初期化が抜けると開始に失敗する。

## タイマ PWM から DMA を使う

PWMチャネルにDMAリクエストを割り当てます。CubeMXが生成するMSP初期化でDMAハンドルをタイマへ接続し、比較値の配列と要素数を渡して開始します。

<ApiSignature :signature="'HAL_StatusTypeDef HAL_TIM_PWM_Start_DMA( TIM_HandleTypeDef *htim, uint32_t Channel, const uint32_t *pData, uint16_t Length);'" />

`pData`が指すメモリは転送が終わるまで有効にしてください。`DMA_NORMAL`は最後の要素を転送すると停止し、`DMA_CIRCULAR`は配列を繰り返し使います。タイマチャネル、DMAリクエスト、転送方向、要素幅をCubeMXの設定と合わせてください。

## IRQ のつながり

```text
DMA IRQ
  → DMAx_Channelx_IRQHandler()
  → HAL_DMA_IRQHandler(&hdma_...)
  → ペリフェラル用 DMA 完了コールバック
```

CubeMXが生成するIRQとMSPコードは、DMAの設定とHALの完了通知に必要です。手動で初期化する場合も、同じ経路を接続してください。

## 注意事項

- DMA の開始に成功しても転送完了を意味しない。戻り値と転送完了コールバックを分けて扱う。
- 転送中に DMA バッファを書き換えたり、スコープを抜けて破棄したりしない。
- Normal / Circular、データ幅、メモリインクリメントの設定をバッファの形に合わせる。
- DMA とメインループが同じバッファを操作する場合は、更新中のデータを読み取らないよう同期する。
- キャッシュを持つ MCU では DMA 前後のキャッシュ整合性を対象シリーズの手順に従って管理する。
- DMA リクエストとチャネルの対応は MCU ごとに異なる。CubeMX の生成結果とリファレンスマニュアルを確認する。
- G4ではメモリ間転送にCircularモードを指定できない。F4のStream設定やFIFO項目をG4のChannel設定へそのまま持ち込まない。

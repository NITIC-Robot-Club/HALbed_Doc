---
title: USB CDC API
---
# USB Device CDC API

## 概要

USB CDC（Communications Device Class）は、USBデバイスをホストの仮想COMポートとして使うためのクラスです。USB Device Middlewareが列挙とCDC処理を行い、STM32 HALのPCD（Peripheral Controller Driver）がUSB周辺回路を制御します。STM32Cube内の層の関係は[STM32Cube Middleware](./STM32Cube_Middleware.md)を参照してください。

## 初期化の流れ

CubeMXが生成するコードでは、次の順に初期化します。

1. `USBD_Init()`でUSB Device Coreを初期化します。
2. `USBD_RegisterClass()`でCDCクラスを登録します。
3. `USBD_CDC_RegisterInterface()`でCDCコールバックを登録します。
4. `USBD_Start()`でUSBデバイスを開始します。
5. HAL PCDのIRQハンドラーが`HAL_PCD_IRQHandler()`を呼び、USB Device Middlewareへイベントを渡します。

引数や戻り値はUSB Device Middlewareのバージョンによって異なります。使用中の`usb_device.c`、`usbd_cdc_if.c`、Middlewareのヘッダを確認してください。

## CDCデータ送受信

<ApiSignature :signature="'uint8_t CDC_Transmit_FS(uint8_t *Buf, uint16_t Len);'" />

CubeMXが生成するCDC送信関数です。前の送信が終わっていない場合は`USBD_BUSY`を返します。送信中でなければ、バッファと長さを設定して`USBD_CDC_TransmitPacket()`を呼び出します。

戻り値は`USBD_OK`（送信開始）、`USBD_BUSY`（前の送信中）、`USBD_FAIL`（開始失敗）などです。`USBD_OK`は転送を始めたことを示します。ホストアプリケーションがデータを処理したことまでは確認できません。

<ApiSignature :signature="'static int8_t CDC_Receive_FS(uint8_t *Buf, uint32_t *Len);'" />

USB OUTエンドポイントでデータを受信すると、Middlewareがこのコールバックを呼びます。`Buf`は受信データ、`*Len`はバイト数です。後でデータを使う場合は、受信バッファが再利用される前にアプリケーション側のキューやバッファへコピーしてください。

次の受信を始めるには、`USBD_CDC_SetRxBuffer()`で受信バッファを指定し、`USBD_CDC_ReceivePacket()`を呼びます。バッファを再利用する前に受信データをコピーしてください。次のパケットで内容が上書きされます。

<ApiSignature :signature="'uint8_t USBD_CDC_SetTxBuffer(USBD_HandleTypeDef *pdev, uint8_t *pbuff, uint16_t length);'" />

<ApiSignature :signature="'uint8_t USBD_CDC_TransmitPacket(USBD_HandleTypeDef *pdev);'" />

CDC Middlewareに送信データと長さを渡し、INエンドポイントへの転送を始めます。転送が終わるまでバッファを書き換えたり解放したりしないでください。送信完了は`USBD_Interface_fops_FS`に登録した`CDC_TransmitCplt_FS()`で扱えます。

<ApiSignature :signature="'uint8_t USBD_CDC_SetRxBuffer(USBD_HandleTypeDef *pdev, uint8_t *pbuff);'" />

<ApiSignature :signature="'uint8_t USBD_CDC_ReceivePacket(USBD_HandleTypeDef *pdev);'" />

次に受信するデータの格納先を設定し、OUTエンドポイントで受信できる状態にします。受信コールバック内でバッファを設定し直す場合は、その前に受信データを処理またはコピーしてください。

## HAL PCD と割り込み

HAL PCD APIはUSB周辺回路を初期化・開始します。CubeMXが生成するlow-level interfaceは`HAL_PCD_Init()`と`HAL_PCD_Start()`を呼び、USB IRQハンドラーは`HAL_PCD_IRQHandler()`を呼び出します。

### PCDのライフサイクルとエンドポイント

<ApiSignature :signature="'HAL_StatusTypeDef HAL_PCD_Init(PCD_HandleTypeDef *hpcd);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_PCD_DeInit(PCD_HandleTypeDef *hpcd);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_PCD_Start(PCD_HandleTypeDef *hpcd);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_PCD_Stop(PCD_HandleTypeDef *hpcd);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_PCD_EP_Open(PCD_HandleTypeDef *hpcd, uint8_t ep_addr, uint16_t ep_mps, uint8_t ep_type);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_PCD_EP_Close(PCD_HandleTypeDef *hpcd, uint8_t ep_addr);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_PCD_EP_Transmit(PCD_HandleTypeDef *hpcd, uint8_t ep_addr, uint8_t *pBuf, uint32_t len);'" />

<ApiSignature :signature="'HAL_StatusTypeDef HAL_PCD_EP_Receive(PCD_HandleTypeDef *hpcd, uint8_t ep_addr, uint8_t *pBuf, uint32_t len);'" />

<ApiSignature :signature="'uint32_t HAL_PCD_EP_GetRxCount(PCD_HandleTypeDef *hpcd, uint8_t ep_addr);'" />

これらのAPIは、USB Device Middlewareのlow-level interfaceから呼び出します。PCDの初期化と開始・停止に加え、エンドポイントの開閉、IN送信、OUT受信、受信バイト数の取得を行います。通常のアプリケーションはCDCクラスAPIを使い、PCDエンドポイントを直接操作しません。

HAL PCDには、転送を消去する`HAL_PCD_EP_Flush()`、エンドポイントを停止・再開する`HAL_PCD_EP_SetStall()`と`HAL_PCD_EP_ClrStall()`、USBアドレスを設定する`HAL_PCD_SetAddress()`もあります。Middleware標準の処理では、生成された`USBD_LL_*`接続関数を使います。

### PCDイベントコールバック

`HAL_PCD_RegisterCallback()`でSetup、Reset、Suspend、Resume、Connect、Disconnect、SOFなどのイベントに対するコールバックを登録できます。データ転送には`HAL_PCD_RegisterDataInStageCallback()`と`HAL_PCD_RegisterDataOutStageCallback()`、低消費電力イベントには`HAL_PCD_RegisterLpmCallback()`を使います。

Isochronous転送では、`HAL_PCD_RegisterIsoInIncpltCallback()`と`HAL_PCD_RegisterIsoOutIncpltCallback()`で未完了イベントも登録できます。STM32G4のUSB Full-Speed Deviceでは、`HAL_PCDEx_PMAConfig()`を使ってエンドポイントごとにPacket Memory Areaを割り当てます。PMAのアドレスとサイズはUSB周辺回路のRAM配置に合わせてください。

PCDイベントコールバックはUSB Device Middlewareへ状態の変化を伝えます。CDCアプリケーションの受信処理は、通常`CDC_Receive_FS()`に実装します。

```text
USB IRQ
  → USB_IRQHandler()
  → HAL_PCD_IRQHandler(&hpcd_USB_FS)
  → PCDコールバック
  → USB Device middleware
  → CDC受信/送信コールバック
```

IRQ名とハンドル名はUSBインスタンスやMCUによって異なります。NVICの割り込み設定、HAL PCDの初期化、USBクロックの設定も必要です。

## USBのハンドル

### `PCD_HandleTypeDef` {#type-pcd-handletype-def}

USBペリフェラルの設定と低レベル転送状態を保持します。HAL PCD APIとIRQハンドラーへ渡します。

| メンバー | 内容 |
| --- | --- |
| `Instance` | USB PCDレジスタの先頭アドレス |
| `Init` | USB速度、エンドポイント数、PHY、低電力関連などの初期設定 |
| `USB_Address` | USBホストから割り当てられたデバイスアドレス |
| `IN_ep`、`OUT_ep` | 送信用・受信用各エンドポイントの状態配列 |
| `State`、`ErrorCode`、`Lock` | PCDの状態、HALエラー、排他状態 |
| `Setup` | USB Setupパケットを受け取る内部バッファ |
| `LPM_State`、`BESL`、`lpm_active` | Link Power Managementの状態と関連情報 |
| `battery_charging_active` | USB Battery Charging検出の状態 |
| `pData` | PCDとUSB Device Middleware側のデータを結ぶ参照 |

`Init`には`PCD_InitTypeDef`が入り、USB速度、エンドポイント構成、PHYインターフェース、SOF・低電力・VBUS検出などを設定します。選択できる項目はUSB IPとMCUに依存します。エンドポイント配列や状態値はHALが更新するため、直接編集せずPCD APIを使います。

### `USBD_HandleTypeDef` {#type-usbd-handletype-def}

USB Device Coreとクラスの状態を保持します。CDC Middleware APIへ渡します。

| メンバー群 | 内容 |
| --- | --- |
| デバイス状態・設定 | USB初期化、接続、列挙、現在のデバイスアドレスなどを管理 |
| IN/OUTエンドポイント | 各エンドポイントの転送状態とバッファ情報を保持 |
| クラス情報 | 登録されたCDCなどのクラスとクラス固有データへの参照 |
| ユーザーデータ・低レベルドライバー参照 | アプリケーション側データとPCDハンドルをMiddlewareへ結び付ける |

`USBD_HandleTypeDef`はSTM32 USB Device Middlewareの構造体で、HAL PCDの構造体ではありません。内部フィールド名と配列数はMiddlewareの版や設定で変わるため、アプリケーションからは公開された`USBD_*` APIを通して操作します。

---

## 注意事項

- USB CDCはパケット通信です。アプリケーションのメッセージ境界は保持されないため、分割や結合に対応するフレーミングを上位層で定義してください。
- `CDC_Transmit_FS()`が`USBD_BUSY`を返したら、送信完了後に再試行するか、送信キューへ積んでください。ビジーループで待たないでください。
- USBデバイスの初期化とホストによる列挙が終わるまでは送信できません。切断・再接続後の状態も扱ってください。
- USBコールバックは割り込み処理から呼ばれる場合があります。長時間の処理や待ち処理を避け、共有状態を適切に保護してください。
- `CDC_*`と`USBD_*`はUSB Device MiddlewareのAPIです。STM32 HALの`HAL_*` APIとは別の層にあります。
- USB DMA、キャッシュ、バッファのアラインメント要件はMCUとUSB IPによって異なります。対象シリーズのMiddlewareとHALを確認してください。

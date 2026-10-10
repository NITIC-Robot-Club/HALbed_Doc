---
title: STM32Cube Middleware
---
# STM32Cube Middleware

## 概要

STM32Cubeは、STM32向けの開発環境とシリーズ別ファームウェアパッケージの総称です。パッケージにはHAL、LL、CMSIS、ボード支援コード、サンプルが含まれます。USB、ファイルシステム、ネットワーク、RTOS、グラフィックスなどのMiddlewareも、シリーズに応じて用意されています。

Middlewareは、ペリフェラル操作より上位の機能を提供するソフトウェアです。USB Device MiddlewareはUSBの列挙やクラス処理を行い、HAL PCDドライバーを通してUSBコントローラーを制御します。アプリケーションからは、通常MiddlewareのクラスAPIやコールバックを使います。

STM32CubeMXは、設定に応じて初期化コードや接続コードを生成するツールです。MiddlewareやHALドライバーとは役割が異なります。使えるコンポーネントやAPIは、MCUシリーズとFirmware Packageのバージョンで変わります。

## ソフトウェア層

```text
アプリケーション
  ├─ アプリケーション用ラッパー / コールバック
  └─ Middleware（例: USB Device Core + CDC Class）
       └─ MiddlewareとHALを接続するlow-level glue
            └─ HAL PCD（USBコントローラーの共通ドライバー）
                 └─ MCUのUSB IP、クロック、GPIO、NVIC
```

| 層 | 主な役割 | USB CDCの例 |
| --- | --- | --- |
| アプリケーション | 製品固有の処理、データ形式、キュー管理 | `CDC_Transmit_FS()`、`CDC_Receive_FS()` |
| Middleware | USB列挙、クラス要求、転送状態管理 | USB Device Core、CDC Class、`USBD_CDC_*()` |
| 接続コード | Middlewareのlow-level要求をHALへ渡す | `USBD_LL_*()`、`usbd_conf.c` |
| HAL | MCU周辺回路の初期化と入出力 | `HAL_PCD_*()` |
| MCU / ボード | USB IP、PMA、ピン、発振器、電源 | USB FS、USBクロック、DM/DP配線 |

CDCクラスから送信すると、Middleware、low-level glue、HAL PCDを通ってUSB IPへデータが届きます。受信時はUSB IRQからイベントが上がり、アプリケーションの受信コールバックが呼ばれます。

## HAL・LL・Middlewareの違い

| 名称 | 抽象度 | 使う場面 |
| --- | --- | --- |
| CMSIS | コア・デバイス共通の基本定義 | Cortex-Mコア、割り込み番号、デバイスレジスタ定義 |
| HAL | ペリフェラルを扱う共通API | 初期化、送受信、割り込み処理を移植しやすく記述する |
| LL | ペリフェラルの軽量・低レベルAPI | 処理時間や細かい制御を優先し、レジスタに近い操作をする |
| Middleware | 複数の周辺機能を使う上位サービス | USBクラス、ファイルシステム、ネットワーク、RTOSなど |

HALとLLは周辺回路を操作するドライバーです。Middlewareはその上で、より大きな機能を提供します。シリーズごとに含まれるMiddlewareは異なるため、対応MCUとライセンスをパッケージごとに確認してください。

## USB CDCを使うときの分担

USB CDCの仮想COMポートでは、アプリケーションが送受信データを扱います。USB Device MiddlewareがUSBの列挙とCDCクラス処理を行い、HAL PCDがUSB IPのエンドポイントと割り込みを制御します。

```text
送信: Application → CDC_Transmit_FS → USBD_CDC_TransmitPacket
       → USBD_LL_Transmit → HAL_PCD_EP_Transmit → USB IP

受信: USB IP → USB IRQ → HAL_PCD_IRQHandler
       → PCD callback → USBD_LL_DataOutStage
       → CDC_Receive_FS → Application
```

各ファイルの役割は次のとおりです。

| ファイル・関数 | 役割 | 変更時の注意 |
| --- | --- | --- |
| `usb_device.c` | USB Device CoreとCDC Classを初期化・登録して開始する | CubeMX再生成後の初期化順を保つ |
| `usbd_cdc_if.c` | CDC送受信バッファとアプリケーションコールバックを実装する | 受信バッファの再利用前にデータを処理・コピーする |
| `usbd_conf.c` | Middlewareのlow-level要求をHAL PCDへ接続する | 手書き変更は生成コード更新で上書きされる可能性がある |
| `stm32g4xx_hal_msp.c` | USBクロック、GPIO、NVIC、PCD低レベル資源を設定する | MCUと基板のクロック・ピン設定に合わせる |
| `stm32g4xx_it.c` | USB IRQから `HAL_PCD_IRQHandler()` を呼び出す | IRQ名とハンドル名はMCUごとに異なる |

送信バッファは転送完了まで保持し、送信中に書き換えないでください。CDCが運ぶのはバイト列です。メッセージの区切り方はアプリケーション側で決めます。関数の詳細は[USB CDC API](./USB_CDC.md)を参照してください。

## `natto_can_motor`で確認した構成

参照リポジトリはUSB Device MiddlewareのCDC Classを使い、USB FSを仮想COMポートとして公開します。`USBD_Init()`、`USBD_RegisterClass()`、`USBD_CDC_RegisterInterface()`、`USBD_Start()`の順に初期化します。アプリケーションは`CDC_Transmit_FS()`で送信し、`CDC_Receive_FS()`で受信します。USB IRQはHAL PCDを通ってMiddlewareに届きます。

同リポジトリの`ASCII_CUI_HAL`、`natto_can_protocol`、`super_enum`は別の依存ライブラリです。STM32Cube MiddlewareやSTM32 HAL APIには含まれません。公開APIは各ライブラリのドキュメントを参照してください。

## バージョンと生成コード

- HALとMiddlewareは、同じシリーズのFirmware Packageに含まれる組み合わせを使ってください。
- APIの引数、コールバック型、設定構造体はパッケージの版によって変わることがあります。使用中のヘッダと生成コードを基準にしてください。
- CubeMXで再生成する前に、ユーザー変更を`USER CODE BEGIN` / `USER CODE END`領域か独自ファイルへ移してください。生成ファイルを直接変更すると、再生成時に変更が消えることがあります。
- Middlewareの初期化、IRQ、コールバックを削除すると、状態遷移や転送が止まることがあります。
- USB IP、メモリ配置、クロック源、ピン配置などの違いは、HALやボード設定に反映してください。

## 参考資料

- [STM32Cube MCU & MPU Packages](https://www.st.com/en/embedded-software/stm32cube-mcu-mpu-packages.html)
- [UM1734: STM32Cube USB Device Library](https://www.st.com/resource/en/user_manual/dm00108129-stm32cube-usb-device-library-stmicroelectronics.pdf)

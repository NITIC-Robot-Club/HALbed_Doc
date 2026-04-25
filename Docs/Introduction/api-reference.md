# APIリファレンス

このページでは、HALbedライブラリで提供されているAPIを機能別に紹介します。

## はじめに
HALbedは、STM32マイコン向けの組み込み開発を支援するためのライブラリで、多くのハードウェア機能を簡単に利用できるように設計されています。
完全な互換性はありませんが、各APIクラスは、mbed OS6 の設計思想を取り入れ、直感的で使いやすいインターフェースを提供しています。


## 機能別API一覧

## クラス一覧
各クラスの詳細な説明と使用方法については、以下のリンクを参照してください。

### AnalogIn
[AnalogIn](../API/AnalogIn.md) :ADCを使用してアナログ入力を行うためのクラス。

### callback
[callback](../API/Callback.md) 名前空間は、コールバック関数を管理するためのテンプレート関数。
特定のハンドルに対して優先度付きでコールバック関数を登録し、呼び出すことができます。

### CAN
[CAN](../API/CAN.md) :CAN通信を行うためのクラス。
CANフィルタの設定、メッセージの送信、コールバック関数の設定などの機能を持つ。

### CircularBuffer
[CircularBuffer](../API/CircularBuffer.md)  :循環バッファを実装するためのテンプレートクラス。

### DigitalIn
[DigitalIn](../API/DigitalIn.md) :デジタル入力を扱うためのクラス。

### DigitalOut
[DigitalOut](../API/DigitalOut.md) :デジタル出力を扱うためのクラス。

### Encoder
[Encoder](../API/Encoder.md) :エンコーダを操作するためのクラス。
エンコーダのカウント開始、停止、カウント値の取得、回転速度の取得などの機能をもつ。

### I2C
[I2C](../API/I2C.md) :I2C通信を行うためのクラス。

### PinNames
[PinNames](../API/PinNames.md) :ピン名の列挙型とピンからポートタイプを取得する関数をもつ。

### PWMOut
[PWMOut](../API/PWMOut.md) :PWM出力を制御するためのクラス。
PWMの開始、停止、周波数の設定、デューティサイクルの設定などの機能をもつ。

### Ticker
[Ticker](../API/Ticker.md) :タイマー割り込みを管理するためのクラス。
指定したタイマーを使用して、秒、ミリ秒、マイクロ秒単位でのタイマー割り込み処理を管理します。

### TimerAPB
[TimerAPB](../API/TimerAPB.md) :指定されたタイマーのAPBタイプを取得するクラス。
`TimerManager` クラス内で利用される

### TimerManager
[TimerManager](../API/TimerManager.md) :タイマーの設定を管理するためのクラス。
タイマーの初期化、プリスケーラ値や周期の取得・設定などの機能をもつ。

### UART
[UART](../API/UART.md) :UART通信を行うためのクラス。
データの送受信、フォーマット済み文字列の送信、コールバック関数の設定などの機能をもつ。


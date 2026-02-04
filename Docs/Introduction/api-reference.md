# APIリファレンス

このページでは、HALbedライブラリで提供されているAPIを機能別に紹介します。

## はじめに
HALbedは、STM32マイコン向けの組み込み開発を支援するためのライブラリで、多くのハードウェア機能を簡単に利用できるように設計されています。
完全な互換性はありませんが、各APIクラスは、mbed OS6 の設計思想を取り入れ、直感的で使いやすいインターフェースを提供しています。


## 機能別API一覧

## クラス一覧
各クラスの詳細な説明と使用方法については、以下のリンクを参照してください。

### AnalogIn
[AnalogIn](./README_AnalogIn.md) :ADCを使用してアナログ入力を行うためのクラス。

### callback
[callback](./README_Callback.md) 名前空間は、コールバック関数を管理するためのテンプレート関数。
特定のハンドルに対して優先度付きでコールバック関数を登録し、呼び出すことができます。

### CAN
[CAN](./README_CAN.md) :CAN通信を行うためのクラス。
CANフィルタの設定、メッセージの送信、コールバック関数の設定などの機能を持つ。

### CircularBuffer
[CircularBuffer](./README_CircularBuffer.md)  :循環バッファを実装するためのテンプレートクラス。

### DigitalIn
[DigitalIn](./README_DigitalIn.md) :デジタル入力を扱うためのクラス。

### DigitalOut
[DigitalOut](./README_DigitalOut.md) :デジタル出力を扱うためのクラス。

### Encoder
[Encoder](./README_Encoder.md) :エンコーダを操作するためのクラス。
エンコーダのカウント開始、停止、カウント値の取得、回転速度の取得などの機能をもつ。

### I2C
[I2C](./README_i2c.md) :I2C通信を行うためのクラス。

### PinNames
[PinNames]名前空間は、ピン名の列挙型とピンからポートタイプを取得する関数をもつ。

### PWMOut
[PWMOut](./README_PWMOut.md) :PWM出力を制御するためのクラス。
PWMの開始、停止、周波数の設定、デューティサイクルの設定などの機能をもつ。

### Ticker
[Ticker](./README_Ticker.md) :タイマー割り込みを管理するためのクラス。
指定したタイマーを使用して、秒、ミリ秒、マイクロ秒単位でのタイマー割り込み処理を管理します。

### TimerAPB
[TimerAPB] :指定されたタイマーのAPBタイプを取得するクラス。
`TimerManager` クラス内で利用される

### TimerManager
[TimerManager](./README_TimerManager.md) :タイマーの設定を管理するためのクラス。
タイマーの初期化、プリスケーラ値や周期の取得・設定などの機能をもつ。

### UART
[UART](./README_UART.md) :UART通信を行うためのクラス。
データの送受信、フォーマット済み文字列の送信、コールバック関数の設定などの機能をもつ。


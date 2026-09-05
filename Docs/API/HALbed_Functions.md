---
title: HALbed 関数一覧
---
# HALbed 関数一覧

## 概要

HALbed の公開ヘッダに定義されているクラス、構造体、名前空間関数、コールバック入口を一覧にする。個別クラスの使い方は、各API Docを参照すること。

このページはHALbedリポジトリの実装を確認して整理したものであり、STM32 HALそのもののAPI一覧ではない。HALの関数は、別資料の [STM32 HAL 関数一覧](../HAL_Docs/HAL_Functions.md) にまとめる。

対象にしたHALbedのリビジョン: `7645c17`（2026-08-06取得）

---

## ヘッダとAPIの対応

| ヘッダ | 主なAPI | 詳細 |
| --- | --- | --- |
| `AnalogIn.hpp` | ADC入力 | [AnalogIn](./AnalogIn.md) |
| `callback.hpp` | 優先度付きコールバック | [Callback](./Callback.md) |
| `CAN.hpp` | Classic CAN | [CAN](./CAN.md) |
| `CANFD.hpp` | CAN FD | [CANFD](./CANFD.md) |
| `CANAlt.hpp` | F3向けCAN代替実装 | 本ページ |
| `CircularBuffer.hpp` | 循環バッファ | [CircularBuffer](./CircularBuffer.md) |
| `DigitalIn.hpp` | GPIO入力・外部割り込み | [DigitalIn](./DigitalIn.md) |
| `DigitalOut.hpp` | GPIO出力 | [DigitalOut](./DigitalOut.md) |
| `Encoder.hpp` | タイマエンコーダ | [Encoder](./Encoder.md) |
| `i2c.hpp` | I2C送受信 | [I2C](./i2c.md) |
| `InterfaceCAN.hpp` | Classic CANメッセージ | [CANMessage](./CANMessage.md) |
| `InterfaceCANFD.hpp` | CAN FDメッセージ | [CANFD](./CANFD.md) |
| `LogManager.hpp` | UARTログ | [LogManager](./LogManager.md) |
| `PinNames.hpp` | ピン名・ポート取得 | 本ページ |
| `PWMOut.hpp` | PWM出力 | [PWMOut](./PWMOut.md) |
| `Ticker.hpp` | タイマ割り込み | [Ticker](./Ticker.md) |
| `TimerAPB.hpp` | タイマのAPB・クロック | 本ページ |
| `TimerManager.hpp` | タイマ設定 | [TimerManager](./TimerManager.md) |
| `UART.hpp` | UART送受信 | [UART](./UART.md) |

`HALbed.hpp` は上記ヘッダをまとめてインクルードする。ただし、`CANAlt.hpp` はHALマクロとの衝突を避けるため自動ではインクルードされない。

---

## クラス・構造体概要

### `AnalogIn`

ADCの指定チャネルをポーリングまたはDMAで読み取る。`HAL_ADC_MODULE_ENABLED` が必要。

#### コンストラクタ

```cpp
AnalogIn(ADC_HandleTypeDef* hadc,
         uint8_t channelCount,
         float maxInputVoltage = 3.3f);
```

- `hadc` : ADCハンドル
- `channelCount` : 使用するチャネル数
- `maxInputVoltage` : 入力電圧の最大値[V]

#### メソッド

##### `uint16_t poll_read(uint8_t channel, uint32_t timeout = 1000)`

指定チャネルをポーリングで読み取る。`init()` 後はDMAのキャッシュ値を返す。チャネル番号が範囲外、またはHAL呼び出しに失敗した場合は `0` を返す。

##### `float poll_read_voltage(uint8_t channel, uint32_t timeout = 1000)`

`poll_read()` の値を電圧[V]へ変換する。

##### `bool init()`

ADCのDMA転送を開始する。成功時は `true` を返す。

##### `uint16_t read(uint8_t channel)`

DMAが有効ならキャッシュ値、無効ならポーリング値を返す。

##### `float read_voltage(uint8_t channel)`

`read()` の値を電圧[V]へ変換する。

---

### `HALbed::callback`

ハンドル値をキーにして、優先度順でコールバックを登録・実行する。通常は `UART::attach()`、`CAN::attach()`、`Ticker::attach*()`、`DigitalIn::attach()` から利用する。

#### 関数

##### `template <typename CallbackFnType> auto& callback_fns()`

コールバックを保持する内部マップを取得する。アプリケーションから直接操作するための安定APIではない。

##### `template <typename CallbackFnType> void attach(intptr_t handle, std::function<CallbackFnType> fn, uint8_t priority)`

`handle` にコールバックを登録する。`priority` の小さい順に実行される。

##### `template <typename CallbackFnType, class... Args> void callback(intptr_t handle, Args... args)`

指定ハンドルに登録されたコールバックを、登録順の優先度で実行する。

---

### `HALbed::CAN`

Classic CANの送受信を行う。`HAL_CAN_MODULE_ENABLED` が必要で、STM32F3系のHALマクロ衝突時は `CANAlt` を使用する。

#### コンストラクタ

```cpp
explicit CAN(CAN_HandleTypeDef* CanHandle);
```

#### メソッド

##### `void init()`

CANを開始し、FIFO 0/1の受信通知を有効化する。

##### `void filterSetup(uint32_t filter_id, uint32_t filter_mask, uint8_t is_extended, uint8_t fifo)`

IDマスク方式の受信フィルタを設定する。`is_extended` は拡張IDなら非0、`fifo` は `0` または `1`。

##### `void filterSetupWithConfig(const CAN_FilterTypeDef& FilterConfig)`

HALのフィルタ設定構造体を使ってフィルタを設定する。

##### `bool write(const CANMessage& msg)`

Classic CANメッセージを送信する。HALが成功したとき `true` を返す。

##### `bool writeable()`

送信用メールボックスに空きがあれば `true` を返す。

##### `void attach(std::function<void(const CANMessage&)>&& fn, uint8_t priority = 100, uint8_t fifo = 0)`

指定FIFOの受信コールバックを登録する。受信コールバックは割り込みコンテキストから呼ばれる。

---

### `HALbed::CANFD`

FDCANを使ってClassic CANまたはCAN FDのメッセージを送受信する。`HAL_FDCAN_MODULE_ENABLED` が必要。メソッドは `CAN` とほぼ同じだが、メッセージ型は `CANFDMessage` である。

#### コンストラクタ

```cpp
explicit CANFD(FDCAN_HandleTypeDef* CanHandle);
```

#### メソッド

##### `void init()`

FDCANを開始し、FIFO 0/1の新規メッセージ通知を有効化する。

##### `void filterSetup(uint32_t filter_id, uint32_t filter_mask, uint8_t is_extended, uint8_t fifo)`

FDCANのIDマスクフィルタを設定する。

##### `void filterSetupWithConfig(const FDCAN_FilterTypeDef& FilterConfig)`

FDCANのフィルタ設定構造体を使ってフィルタを設定する。

##### `bool write(const CANFDMessage& msg)`

CAN FDメッセージを送信する。`size` は0～64バイトで、FDCANのDLCへ変換される。`format`、`idType`、`brs` も送信ヘッダへ反映される。

##### `bool writeable()`

送信FIFOキューに空きがあれば `true` を返す。

##### `void attach(std::function<void(const CANFDMessage&)>&& fn, uint8_t priority = 100, uint8_t fifo = 0)`

指定FIFOのFDCAN受信コールバックを登録する。

---

### `HALbed::CANAlt`

STM32F3系で `CAN` という名前がHALマクロと衝突する場合の代替クラス。`HAL_CAN_MODULE_ENABLED` が定義されていれば `CANMessage`、`HAL_FDCAN_MODULE_ENABLED` が定義されていれば `CANFDMessage` を使う。

#### コンストラクタ

```cpp
CANAlt(CanHandleType* CanHandle);
```

#### メソッド

`init()`、`filterSetup()`、`filterSetupWithConfig()`、`write()`、`writeable()`、`attach()` を提供する。引数・動作は、選択されたHALに対応する `CAN` または `CANFD` と同じである。`CANAlt.hpp` は必要なプロジェクトだけでインクルードする。

---

### `CircularBuffer<T, Size>`

固定容量の循環バッファ。名前空間はグローバルで、`HALbed::` は付かない。

#### コンストラクタ

```cpp
CircularBuffer();
```

#### メソッド

##### `void push(const T& item)`

末尾へデータを追加する。満杯の場合は最も古いデータを上書きする。

##### `T pop()`

先頭からデータを取り出す。空の場合は `T()` を返す。

##### `bool empty() const`

空なら `true` を返す。

##### `bool isFull() const`

満杯なら `true` を返す。

##### `size_t capacity() const`

テンプレート引数 `Size` を返す。

##### `size_t size() const`

現在格納されている要素数を返す。

---

### `HALbed::DigitalIn`

GPIO入力と外部割り込みコールバックを扱う。`HAL_GPIO_MODULE_ENABLED` が必要。

#### コンストラクタ

```cpp
DigitalIn(GPIO_TypeDef* port, uint16_t pin);
DigitalIn(PinName pin);
```

#### メソッド

##### `int read()` / `operator int()`

入力ピンの状態を `HAL_GPIO_ReadPin()` の戻り値として返す。

##### `void attach(CallbackFnType fn, uint8_t priority = 10)`

指定ピンの外部割り込みコールバックを登録する。

##### `GPIO_TypeDef* get_port() const`

GPIOポートを返す。

##### `uint16_t get_pin() const`

GPIOピンのビットマスクを返す。

---

### `HALbed::DigitalOut`

GPIO出力を扱う。`HAL_GPIO_MODULE_ENABLED` が必要。

#### コンストラクタ

```cpp
DigitalOut(GPIO_TypeDef* port, uint16_t pin);
DigitalOut(PinName pin);
```

#### メソッド

##### `void write(int value)`

出力値を書き込む。`value` は `GPIO_PinState` に変換される。

##### `void toggle()`

出力を反転する。

##### `DigitalOut& operator=(int value)`

`write(value)` と同じ動作を代入演算子で行う。

##### `int read()` / `operator int()`

出力ピンの現在状態を読み取る。

##### `GPIO_TypeDef* get_port() const` / `uint16_t get_pin() const`

保持しているGPIOポートまたはピンマスクを返す。

---

### `HALbed::Encoder`

タイマのエンコーダモードでパルス数、角度、回転速度を取得する。`HAL_TIM_MODULE_ENABLED` が必要。

#### コンストラクタ

```cpp
Encoder(TIM_HandleTypeDef* Timer,
        unsigned char count_mode,
        unsigned int period,
        unsigned int pulsePerRevolution);
Encoder(TIM_HandleTypeDef* Timer, unsigned int pulsePerRevolution);
```

#### メソッド

| メソッド | 内容 |
| --- | --- |
| `bool start()` | エンコーダカウントを開始する。 |
| `void stop()` | エンコーダカウントを停止する。 |
| `void setPeriod(unsigned int period)` | カウンタ周期を設定する。 |
| `void setPulsePerRevolution(unsigned int ppr)` | 1回転あたりのパルス数を設定する。 |
| `void setMode(unsigned char mode)` | エンコーダモードを設定する。 |
| `void setTimer(TIM_HandleTypeDef* Timer)` | 使用するタイマを変更する。 |
| `int getDirection()` | 順回転を `1`、逆回転を `-1` で返す。 |
| `int getPulses()` | 累積パルス数を返す。 |
| `float getRPM()` | 回転速度をRPMで返す。 |
| `float getRPS()` | 回転速度をRPSで返す。 |
| `float getAngleRad()` | 角度をラジアンで返す。 |
| `float getAngleDeg()` | 角度を度で返す。 |
| `float getAngularVelocityRad()` | 角速度をrad/sで返す。 |
| `float getAngularVelocityDeg()` | 角速度をdeg/sで返す。 |
| `void resetPulse()` | 累積パルスと基準カウンタをリセットする。 |

---

### `I2C`

I2Cの同期通信とDMA通信を扱う。名前空間はグローバルで、`HALbed::` は付かない。`HAL_I2C_MODULE_ENABLED` が必要。

#### コンストラクタ

```cpp
I2C(I2C_HandleTypeDef* hi2c);
```

#### メソッド

| メソッド | 内容 |
| --- | --- |
| `int write(uint8_t address, const uint8_t* data, uint16_t length)` | 7bitアドレスを内部で左シフトして送信する。 |
| `int writeShiftedAddress(uint16_t address, const uint8_t* data, uint16_t length)` | HALへ渡すシフト済みアドレスで送信する。 |
| `int read(uint8_t address, uint8_t* data, uint16_t length)` | 7bitアドレスを内部で左シフトして受信する。 |
| `int writeMem(uint8_t address, uint16_t memAddress, uint8_t* data, uint16_t length)` | 8bitメモリアドレスへ同期書き込みする。 |
| `int readMem(uint8_t address, uint16_t memAddress, uint8_t* data, uint16_t length)` | 8bitメモリアドレスから同期読み込みする。 |
| `int isDeviceReady(uint8_t address, uint32_t trials = 10, uint32_t timeout = 100)` | デバイス応答を確認する。 |
| `int writeDMA(uint8_t address, const uint8_t* data, uint16_t length)` | DMAで送信する。 |
| `int writeMemDMA(uint8_t address, uint16_t memAddress, uint16_t memAddSize, uint8_t* data, uint16_t length)` | DMAでメモリ書き込みする。 |
| `int readDMA(uint8_t address, uint8_t* data, uint16_t length)` | DMAで受信する。 |
| `int readMemDMA(uint8_t address, uint16_t memAddress, uint16_t memAddSize, uint8_t* data, uint16_t length)` | DMAでメモリ読み込みする。 |

戻り値はHALのステータス値を `int` で返す。DMAメソッドは開始結果を返すだけなので、転送完了コールバックやバッファの寿命をアプリケーション側で管理する。

---

### `HALbed::CANMessage` / `HALbed::CANFDMessage`

#### `CANMessage`

Classic CAN用。`data` は8バイト、`size` は0～8バイト。

```cpp
CANMessage();
CANMessage(uint32_t id, const uint8_t* data, uint8_t size,
           CANFormat format = CANStandard);
CANMessage(uint32_t id, const std::array<uint8_t, 8>& data,
           uint8_t size = 8, CANFormat format = CANStandard);
```

メンバは `id`、`data`、`size`、`format`。`format` は `CANStandard` または `CANExtended`。

#### `CANFDMessage`

FDCAN用。`data` は64バイト、`size` は0～64バイト。

```cpp
CANFDMessage();
CANFDMessage(uint32_t id, const uint8_t* data, uint8_t size,
             bool brs = false,
             CANIDType idType = Standard_ID,
             CANFormat format = CANStandard);
CANFDMessage(uint32_t id, const std::array<uint8_t, 64>& data,
             uint8_t size, bool brs = false,
             CANIDType idType = Standard_ID,
             CANFormat format = CANStandard);
```

メンバは `id`、`data`、`size`、`idType`、`format`、`brs`。`format` はClassic CAN/CAN FD、`idType` は標準ID/拡張IDを表す。

---

### `HALbed::LogManager`

UARTへレベル・タグ付きログを出力する。

#### コンストラクタ

```cpp
LogManager(UART_HandleTypeDef* uart = nullptr,
           LogLevel level = LogLevel::INFO);
```

#### メソッド

| メソッド | 内容 |
| --- | --- |
| `void setUART(UART_HandleTypeDef* uart)` | 出力先UARTを設定する。 |
| `void setLogLevel(LogLevel level)` | 出力する最大ログレベルを設定する。 |
| `void setTagFilter(const char* tag)` | 単一タグのフィルタを設定する。 |
| `void setTagFilters(const char** tags, size_t count)` | 複数タグのフィルタを設定する。 |
| `void log(LogLevel level, const char* tag, const char* fmt, ...)` | 条件に一致するログを出力する。 |

`LogLevel` は `NONE`、`ERROR`、`WARN`、`INFO`、`DBG`、`VERBOSE`。グローバル `logger` と、`LOGE`、`LOGW`、`LOGI`、`LOGD`、`LOGV` マクロも定義される。

---

### `HALbed::PinName` とピン関連関数

#### 列挙型

`PA_0`～`PK_15` の形式でピンを表す。値の上位4bitがポート番号、下位4bitがピン番号である。実際に存在しないポート・ピンを指定できることがあるため、使用するMCUのデータシートとCubeMX設定を確認する。

#### マクロ

```cpp
STM_PORT(pin);
STM_PIN(pin);
```

ピン値からポート番号またはピン番号を取り出す。

#### `GPIO_TypeDef* get_port_type(PinName pin)`

ピン名に対応するGPIOポートを返す。対応ポートがない場合は `Error_Handler()` を呼ぶ。

---

### `HALbed::PWMOut`

タイマのPWM出力を制御する。`HAL_TIM_MODULE_ENABLED` が必要。

#### コンストラクタ

```cpp
PWMOut(TIM_HandleTypeDef* htim,
       uint32_t channel,
       uint32_t TIMHz,
       bool useDMA = false,
       uint32_t ArrMax = 65536);
```

#### メソッド

| メソッド | 内容 |
| --- | --- |
| `void start()` | PWM出力を開始する。 |
| `void stop()` | PWM出力を停止する。 |
| `void setFrequency(uint32_t destFreq)` | 周波数を設定する。 |
| `void pulsewidth_us(uint32_t pulseWidth)` | パルス幅をμsで設定する。 |
| `void pulsewidth_ms(uint32_t pulseWidth)` | パルス幅をmsで設定する。 |
| `float getDutyCycle() const` | デューティ比を0.0～1.0で返す。 |
| `void setDutyCycle(float duty)` | デューティ比を0.0～1.0へクランプして設定する。 |
| `float getFrequency() const` | 現在の周波数を返す。 |

`useDMA` が `true` のときはPWM開始・停止にDMA版HAL関数を使う。

---

### `HALbed::Ticker`

タイマ更新割り込みを指定間隔で発生させる。`HAL_TIM_MODULE_ENABLED` が必要。

#### コンストラクタ

```cpp
Ticker(TIM_HandleTypeDef* htim,
       uint32_t max_arr = 65535,
       uint32_t priority = 0);
```

#### メソッド

| メソッド | 内容 |
| --- | --- |
| `void attach(void (*fptr)(), float time)` | 秒単位で周期を指定する。 |
| `void attach_ms(void (*fptr)(), uint32_t time)` | ms単位で周期を指定する。 |
| `void attach_us(void (*fptr)(), uint32_t time)` | μs単位で周期を指定する。 |
| `void detach()` | タイマ割り込みを停止する。 |

デストラクタでも `detach()` が呼ばれる。コールバック登録自体は自動解除されないため、同じタイマハンドルで再登録すると複数回呼ばれる場合がある。

---

### `HALBed::TIM_APB` とタイマ周波数関数

`TimerAPB.hpp` では名前空間が `HALbed` ではなく `HALBed` である。

```cpp
enum TIM_APB { TIM_APB1, TIM_APB2 };
TIM_APB getTimAPB(TIM_HandleTypeDef* htim);
uint32_t getAPBTimFreq(TIM_HandleTypeDef* htim);
```

`getTimAPB()` はタイマがAPB1/APB2のどちらに接続されているかを返し、`getAPBTimFreq()` はAPBの分周設定を考慮したタイマクロックを返す。対象タイマが実装の判定対象にない場合は `Error_Handler()` を呼ぶ。

---

### `HALbed::TimerManager`

タイマのプリスケーラ、周期、周波数を取得・変更する。`HAL_TIM_MODULE_ENABLED` が必要。

#### コンストラクタ

```cpp
TimerManager(TIM_HandleTypeDef* timerHandle);
```

#### メソッド

| メソッド | 内容 |
| --- | --- |
| `void init()` | 現在の設定をHALへ適用する。 |
| `uint32_t getPrescaler() const` | プリスケーラ値を返す。 |
| `uint32_t getPeriod() const` |周期値を返す。 |
| `double getTimerPeriod() const` | 周期を秒で返す。 |
| `double getTimerFrequency() const` | 周波数をHzで返す。 |
| `void setPrescaler(uint32_t prescaler)` | プリスケーラ値を変更する。 |
| `void setPeriod(uint32_t period)` | 周期値を変更する。 |
| `void updateTimerSettings()` | 変更した設定を `HAL_TIM_Base_Init()` で適用する。 |

---

### `HALbed::UART`

UARTの同期送受信、受信割り込み、簡易printfを扱う。`HAL_UART_MODULE_ENABLED` が必要。

#### コンストラクタ

```cpp
UART(UART_HandleTypeDef* huart);
```

#### メソッド

| メソッド | 内容 |
| --- | --- |
| `HAL_StatusTypeDef enableRxInt(char* rxData, size_t size)` | 指定バッファで受信割り込みを開始する。 |
| `HAL_StatusTypeDef write(const char* txData)` | NUL終端文字列を同期送信する。 |
| `HAL_StatusTypeDef read(char* buffer, size_t size)` | 同期受信する。受信割り込みモード中は `HAL_ERROR`。 |
| `bool readable()` | 受信データレジスタにデータがあれば `true`。 |
| `HAL_StatusTypeDef xprintf(const char* format, ...)` | 最大255文字程度の整形済み文字列を同期送信する。 |
| `void attach(std::function<void()> fn, uint8_t priority = 0)` | UART受信完了コールバックを登録する。 |

---

## HALbedが提供する自動コールバック入口

次の関数はアプリケーションが通常直接呼ぶ関数ではなく、HALまたは割り込み処理から呼ばれる入口である。`HALBED_MANUAL_*_CB` を定義した場合、対応する自動実装が無効になる。

| 入口 | 対応API | 動作 |
| --- | --- | --- |
| `HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)` | `DigitalIn::attach()` | ピン番号に登録された関数を実行する。 |
| `HAL_UART_RxCpltCallback(UART_HandleTypeDef*)` | `UART::attach()` | UARTハンドルに登録された関数を実行する。 |
| `HAL_CAN_RxFifo0MsgPendingCallback()` / `HAL_CAN_RxFifo1MsgPendingCallback()` | `CAN::attach()` / `CANAlt::attach()` | Classic CANメッセージを取得して実行する。 |
| `HAL_FDCAN_RxFifo0Callback()` / `HAL_FDCAN_RxFifo1Callback()` | `CANFD::attach()` / `CANAlt::attach()` | FDCANメッセージを取得して実行する。 |
| `HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef*)` | `Ticker::attach*()` | タイマハンドルに登録された関数を実行する。 |

手動コールバックを使うときは、同名のHALコールバックをアプリケーション側で1つだけ定義し、必要なハンドルを判定して `HALbed::callback::callback()` を呼ぶ。自動実装とアプリケーション実装を同時に置くと多重定義になる。

---

## HALbedへ新しいAPIを追加する場合

1. `Inc/<ClassName>.hpp` に公開クラスまたは関数の宣言・実装を追加する。シリーズ依存の機能は対応する `HAL_*_MODULE_ENABLED` で保護する。
2. 実装が大きい場合は `Src/<ClassName>.cpp` に分け、`CMakeLists.txt` の `halbed` ターゲットへ追加する。
3. 割り込みを使う場合は、ハンドルをキーに `HALbed::callback::attach()` へ登録し、HALコールバックから呼び出す。自動実装との多重定義を避けるため、手動化マクロも設計する。
4. `HALbed.hpp` へ通常利用するヘッダを追加する。互換性問題がある実装は `CANAlt.hpp` のように個別インクルードにする。
5. 本サイトの `Docs/API/<ClassName>.md` に、概要、コンストラクタ、メソッド、使用方法、注意事項、サンプルコードの順でDocを作成する。
6. HALの戻り値をラップする場合は、成功・エラー・タイムアウト・ビジーの扱いを明記する。DMA/割り込みAPIでは、バッファの寿命、再入、コールバックの実行コンテキストも明記する。

---

## 注意事項

- HALbedのAPIは、対応するHALモジュールが有効なときだけコンパイルされる。
- HALbedの同期送信・受信の一部は `HAL_MAX_DELAY` を使用する。割り込みコンテキストやリアルタイム処理から呼び出さない。
- コールバックは割り込みコンテキストから呼ばれる場合がある。長い処理、ブロッキング、動的に時間のかかる処理は避ける。
- `I2C` のアドレスは、通常のメソッドでは7bit形式、`writeShiftedAddress()` ではHALへ渡す左シフト済み形式を使う。
- DMAで扱うバッファは、転送完了まで有効な領域を保持する。キャッシュを持つMCUでは、DMAとD-Cacheの整合性も確認する。
- HALbedのヘッダは、プロジェクトの `main.h` を `HALBED_MAIN_HEADER_PATH` からインクルードする。プロジェクト構成が異なる場合はコンパイル定義を変更する。
- `Ticker` のコンストラクタにある `priority` 引数は、現リビジョンではメンバへの代入が実装されていない。優先度を確実に指定する必要がある場合は、使用前に実装を確認・修正する。
- `HALBed` と `HALbed` は別名ではない。`TimerAPB.hpp` の名前空間表記に注意する。

---

## サンプルコード

```cpp
#include "main.h"
#include "../../Library/HALbed/Inc/HALbed.hpp"

using namespace HALbed;

extern ADC_HandleTypeDef hadc1;
extern UART_HandleTypeDef huart2;

AnalogIn adc(&hadc1, 2, 3.3f);
UART pc(&huart2);
CircularBuffer<uint16_t, 32> samples;

extern "C" void app_main(void) {
    adc.init();

    while (1) {
        samples.push(adc.read(0));
        pc.xprintf("ADC=%u voltage=%.3f\r\n",
                   samples.pop(), adc.read_voltage(0));
        HAL_Delay(10);
    }
}
```

上の例はHALbedのAPIを使った最小例であり、ADCのDMA設定、UARTのCubeMX設定、`app_main()` の呼び出し方法はプロジェクト構成に合わせて設定する。

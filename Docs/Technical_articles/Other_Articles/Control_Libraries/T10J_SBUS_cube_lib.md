---
tags:
    - 開発資料
    - 制御ライブラリ
    - コントローラー
    - 有線通信
thumbnail:
  targets:
    - article-home
    - other-home
  description: 'Futaba T10JのS.BUS入力を16チャンネルの操作値として扱う方法を説明します。'
  order: 32
---

# T10J S.BUS受信ライブラリ

Futaba T10J送信機とS.BUS対応受信機から送られる操作情報を、STM32で読み取るためのライブラリです。

実装元: [T10J_SBUS_cube_lib](https://github.com/NITIC-Robot-Club/T10J_SBUS_cube_lib)

## ライブラリの構成

- `SbusReader`: S.BUSフレームを受信し、16チャンネルの生データを取得するクラス
- `T10JDecoder`: T10J向けのチャンネル割り当てを行い、スティックとスイッチの値へ変換するクラス

S.BUSのフレームは25バイトで、受信状態として`frameReady`、`frameLost`、`failSafe`を確認できます。

## T10JDecoderの基本使用例

```cpp
#include "T10JDecoder.h"

extern UART_HandleTypeDef hlpuart1;

T10JDecoder decoder(&hlpuart1);

void setup()
{
    decoder.setUp();
    decoder.start();
}

void loop()
{
    const T10JData data = decoder.getData();

    if (!data.status.failSafe && !data.status.frameLost) {
        const int left_x = data.stick.lx;
        const int left_y = data.stick.ly;
        // スティック値を機体制御へ渡す
    }

    decoder.clearFrameReady();
}
```

`T10JData`には、`status`、`stick`、`sw`が含まれます。スティック値は`rx`、`ry`、`lx`、`ly`として取得でき、内部でおおむね`-255`から`255`へ変換されます。

## スイッチのチャンネル割り当て

`T10JConfig`で、SwAからSwHへ割り当てるチャンネルを指定します。

```cpp
using namespace T10JConfigItems;

T10JConfig config;
config.sw.SwA = AUX::CH5;
config.sw.SwB = AUX::CH6;
config.sw.SwC = AUX::CH7;
config.sw.SwD = AUX::CH8;
config.sw.SwE = AUX::CH9;
config.sw.SwF = AUX::CH10;
config.sw.SwG = PMix::CH8;
config.sw.SwH = PMix::CH9;

decoder.setConfig(config);
```

### AUX

`AUX::CH5`から`AUX::CH10`は、S.BUSのCH5からCH10をそのままスイッチ入力として使います。SwAからSwFなど、3ポジションスイッチの入力に向いています。

### P.MIX

`PMix::CH5`から`PMix::CH10`は、送信機側のP.MIX設定を使ってスイッチ入力を作ります。送信機側の設定例では、マスターを`OFS`、スレーブを`AU8`または`AU9`にし、P.MIXスイッチを割り当てます。使用するT10Jの設定に合わせて、CHとスイッチの対応を確認してください。

## SbusReaderを直接使う場合

生の16チャンネル値が必要な場合は、HALbedのUARTを渡して`SbusReader`を使います。

```cpp
#include "SbusReader.h"

HALbed::UART uart(&hlpuart1);
SbusReader reader(uart);

reader.setUp();
reader.start();

while (true) {
    if (reader.isFrameReady()) {
        const uint16_t* channels = reader.getChannels();
        const uint16_t throttle = channels[2];
        // 必要なチャンネルをアプリケーション側で解釈する
        reader.clearFrameReady();
    }
}
```

## 安全に使うための注意

- `failSafe`または`frameLost`が立っている間は、スティック値を有効な操作入力として扱わない。
- `frameReady`は明示的に`clearFrameReady()`を呼ぶまで残るため、処理後にクリアする。
- `useDMA`引数は現状では使用されていないため、DMA動作を前提にしない。
- S.BUSは反転信号を使う機器があるため、UARTの反転設定または外部反転回路の要否を、基板と受信機の組み合わせで確認する。
- 受信状態が不正になったときは、モーター出力を停止または安全な値へ戻す。

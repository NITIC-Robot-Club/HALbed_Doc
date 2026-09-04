---
tags:
    - 開発資料
    - 制御ライブラリ
    - コントローラー
    - UART
thumbnail:
  targets:
    - article-home
    - other-home
  description: 'PS3-SBDBTの受信データをSTM32Cube/HALプロジェクトで扱う方法を説明します。'
  order: 31
---

# PS3-SBDBT受信ライブラリ

PS3-SBDBT（SBDBT）受信機から送られる操作情報を、STM32Cube/HALプロジェクトで読み取るためのライブラリです。UARTで受信したパケットを、スティック値やボタン状態へ変換します。

実装元: [PS3_sbdbt_cube_lib](https://github.com/NITIC-Robot-Club/PS3_sbdbt_cube_lib)

## UART設定

SBDBTを接続するUARTを、CubeMXで次のように設定します。

| 項目 | 設定 |
|---|---|
| 通信速度 | 115200 baud |
| データ長 | 8 bit |
| パリティ | なし |
| ストップビット | 1 bit |
| フロー制御 | なし |

受信機とマイコンのGNDを共通にし、SBDBTのUART出力を対象UARTのRXへ接続します。電源電圧と信号レベルは使用する受信機・基板の仕様を確認してください。

## 割り込み受信

通常はコンストラクタの第2引数を省略し、UART受信割り込みで8バイトのパケットを受け取ります。受信完了時に呼び出すコールバックは割り込みコンテキストで実行されるため、通知だけを行います。

```cpp
#include "PS3.h"

extern UART_HandleTypeDef hlpuart1;

volatile bool ps3_rx_pending = false;

void OnPs3Receive()
{
    // 割り込み内ではフラグ更新など短い処理だけを行う
    ps3_rx_pending = true;
}

PS3 ps3(&hlpuart1);

void setup()
{
    ps3.addattach(OnPs3Receive);
}

void loop()
{
    if (ps3_rx_pending) {
        ps3_rx_pending = false;
        // ここでジョイスティックやボタンの値を読み、制御へ渡す
    }
}
```

コールバック内で`printf`、UART送信、長い計算、待ち処理を行わないでください。表示やモーター指令など時間のかかる処理はメインループ側で行います。受信が途切れた場合は、タイムアウトを検出して出力を安全側へ戻します。

## ポーリング受信

UART割り込みを使わず、メインループから`poll()`を呼ぶこともできます。

```cpp
PS3 ps3(&hlpuart1, false);

while (true) {
    ps3.poll();

    if (ps3.isReceived()) {
        const int x = ps3.getLeftJoystickXaxis();
        const int y = ps3.getLeftJoystickYaxis();
        // x, y を制御周期に合わせて利用する
        ps3.clearReceived();
    }
}
```

ポーリング方式では、アプリケーションのループ周期が受信処理を妨げないようにします。高い周期で安定して受信したい場合は、割り込み方式を検討してください。

## 取得できる値

```cpp
ps3.getLeftJoystickXaxis();
ps3.getLeftJoystickYaxis();
ps3.getRightJoystickXaxis();
ps3.getRightJoystickYaxis();

ps3.getButtonState(PS3::maru);
ps3.getButtonState(PS3::batu);
ps3.getButtonState(PS3::sikaku);
ps3.getButtonState(PS3::sankaku);
ps3.getButtonState(PS3::L1);
ps3.getButtonState(PS3::L2);
ps3.getButtonState(PS3::R1);
ps3.getButtonState(PS3::R2);
ps3.getSELECTState();
ps3.getSTARTState();
```

スティック値はおおむね`-64`から`64`の範囲で、角度は`getLeftJoystickAngle()`または`getRightJoystickAngle()`で取得できます。SELECTはLEFTとRIGHT、STARTはUPとDOWNの同時押しとして判定されます。

## 制御へ渡すときの注意

- 受信したスティック値を、そのままモーター出力に使わず、デッドゾーンや出力上限を設ける。
- 受信タイムアウトや通信断を検出したら、モーター出力を安全側へ遷移させる。
- コールバックはデータ更新の通知だけにし、実際の機体制御は一定周期のタスクで行う。

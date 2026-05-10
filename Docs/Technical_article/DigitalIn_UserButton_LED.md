# DigitalInでユーザーボタンからLEDを光らせる

今回は、HALbedの`DigitalIn`を使って、
**ユーザーボタンを押している間だけLEDを点灯**させる方法を紹介します。

Lチカより一歩進んで、「入力（ボタン）に応じて出力（LED）を変える」基本を体験してみましょう。

---

## やりたいこと

- ボタンを押しているとき: LED ON
- ボタンを離しているとき: LED OFF

---

## 事前準備

### CubeMXでの設定
- ユーザーボタンのピンを入力モードに設定
- LEDのピンを出力モードに設定

例: Nucleo系ボードでは、ユーザーボタンが`PC_13`、LEDが`PA_5`のことが多いです。

> [!caution]
> ボードによってピン配置は異なります。必ず使用しているボードの回路図とCubeMX設定を確認してください。

---

## サンプルコード（ポーリング）

まずは一番わかりやすい、`while`ループで状態を読む方法です。

```cpp
#include "main.h"
#include "../../Library/HALbed/Inc/HALbed.hpp"

using namespace HALbed;

DigitalIn  userButton(PC_13);
DigitalOut led(PA_5);

extern "C" void app_main(void) {
    while (1) {
        // 多くのボードではユーザーボタンがActive Low（押すと0）
        led = !userButton.read();
    }
}
```

---

## コードのポイント

### `DigitalIn userButton(PC_13);`
ユーザーボタンのピンをデジタル入力として扱います。

### `DigitalOut led(PA_5);`
LEDのピンをデジタル出力として扱います。

### `led = !userButton.read();`
`read()`の戻り値をそのままLEDに書かず、`!`で反転しています。

これは、ユーザーボタンが**Active Low**な構成であることが多いためです。

- 押していない: `read()`は`1`
- 押している: `read()`は`0`

このままだと「押したとき消灯」になるので、`!`で反転して
「押したとき点灯」にしています。

---

## うまく動かないときの確認

- LEDとボタンのピン名がボードに合っているか
- CubeMXのGPIO設定（Input/Output）が正しいか
- ボタンがActive LowかActive Highか

> [!tip]
> 押したときの論理が逆なら、`led = userButton.read();`と`led = !userButton.read();`を入れ替えて確認すると原因を切り分けしやすいです。

---

## まとめ

`DigitalIn`を使うと、ボタン入力の読み取りをシンプルに書けます。

今回のポイントは次の2つです。

- `read()`で入力状態を取得できる
- ボタンの論理（Active Low / Active High）を意識してLED制御を書く

この形をベースにすると、
「ボタンを押した回数で点滅パターンを変える」などの応用にも進みやすくなります。
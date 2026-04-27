# DigitalOut

## 概要
DigitalOutクラスは、GPIOポートとピン番号を用いてデジタル出力を実現します。ピンへの出力操作と読み出しが可能です。

---

## クラス概要
### `DigitalOut`
DigitalOutクラスは、GPIOピンに対して出力信号を操作する機能を持ちます。

#### コンストラクタ
```cpp
DigitalOut(GPIO_TypeDef* port, uint16_t pin);
```
> - port : 対象GPIOポート
> - pin  : ピン

または

```cpp
DigitalOut(PinName pin);
```
> - PinName列挙型を用いて、自動的にポートとビットマスクを設定<br>
> `PA_0`のように指定

#### メソッド

##### `void write(int value)`
指定した値をGPIOピンに出力（HAL_GPIO_WritePinを利用）
> - `value` : 出力する値

---

##### `void toggle()`
GPIOピンの状態を反転（HAL_GPIO_TogglePinを利用）
> - 引数なし

##### `DigitalOut &operator=(int value)`
write()と同等の動作を行い、連続代入が可能
> - `value` : 出力する値
> - 自身の参照を返す
> ```cpp
> DigitalOut LED(PA_1);
> LED = 1; // LEDピンをHIGHに設定
> ```

---

##### `int read()`
GPIOの状態を読み取る（HAL_GPIO_ReadPinを利用）
> - GPIO の状態

---

##### `operator int()`
read()の結果を返す
> - GPIO の状態
> ```cpp
> DigitalOut LED(PA_1);
> if(LED) {
>     // LEDピンがHIGHの場合の処理  
> }
---

##### `GPIO_TypeDef* get_port()`
使用しているGPIOポートを返す
> - GPIO ポート

---

##### `uint16_t get_pin()`
使用しているピン番号を返す
> - ピン番号

---

## 使用方法
### CubeMXの設定 (PortとPinを指定する場合)
対象ピンの設定する。

![image](./images/GPIO/img_DigitalOut_setup_1.png)

### app_main.cpp内
1. DigitalOutクラスのインスタンスを生成します
   ```cpp
   HALbed::DigitalOut LED(GPIOB, GPIO_PIN_2);
   ```

2. 出力操作
   ```cpp
   LED.write(1);
   LED = 0; // operator= を利用した場合
   ```

3. 出力状態の確認
   ```cpp
   if(LED.read()) {
       // LEDが点灯している場合の処理
   }
   ```

---
## 注意事項

---

## サンプルコード
```cpp
#include "main.h"
#include "../../Library/HALbed/Inc/HALbed.hpp"

using namespace HALbed;
DigitalOut LED(PA_5);

extern "C" void app_main(void) {
    while (1)
    {
        for (int i = 0; i < 5; i++){
            LED.toggle();  // 点滅
            HAL_Delay(500);
        }
        for (int i = 0; i < 20; i++){
            LED = 1;  // 点灯
            HAL_Delay(100);
            LED = 0;  // 消灯
            HAL_Delay(100);
        }
        for (int i = 0; i < 40; i++){
            LED.write(!LED.read());
            HAL_Delay(50);
        }
    }
}
```
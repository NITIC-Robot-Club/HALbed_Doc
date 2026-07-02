---
tags:
  - Nucleo
  - BSP
  - CubeMX
  - 設定
---
# Nucleoボードでピンが設定できない - BSPと競合している場合の対処法

CubeMXでNucleoボードを選択してプロジェクトを作成した場合、BSP (Board Support Package) が有効になっていることがあります。
その場合、UARTや一部のボタンなどの周辺機能がBSP側に予約され、通常の設定できないことがあります。

## BSPを無効化する場合

STM32CubeMXで次のように表示される場合、対象の周辺機能はBSP側に予約されています。

![CubeMX_BSP](<images/BSP_Setting/image2.png>)
![CubeMX_BSP](<images/BSP_Setting/image3.png>)

```text
Not available:
IP under HMI BSP driver control
```

この状態では、`Connectivity` からUARTなどの設定を変更できません。

Nucleo-G474REでは、`LPUART1` を `PC0 / PC1` に割り当てたい場合でも、BSPが `LPUART1` を使用していると設定できません。

## BSPとは

BSPは **Board Support Package** の略です。

NucleoやDiscoveryなどの開発ボード用に用意されたドライバ群で、LED、ボタン、デバイスによってはCOMポート、LCDなどを簡単に使うためのものです。

ただし、BSPが有効になっていると、一部のUARTやSPIなどがBSP側に予約され、通常の周辺機能として設定できないことがあります。

## 無効化手順

CubeMX / CubeIDEで、左側の設定から次を開きます。
![CubeMX_BSP](<images/BSP_Setting/image1.png>)

見つけたら、使用しないBSP機能を `Disable` にします。


## 注意点

BSPは、ボードの一部の機能を簡単に使えるようにするためのものです。無効化する場合、ボタンなどの機能と衝突する可能性があります。適宜、確認しながら設定してください。
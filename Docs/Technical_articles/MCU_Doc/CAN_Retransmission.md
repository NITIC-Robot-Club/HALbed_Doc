---
tags:
  - CAN
  - CANFD
---

# STM32 CAN の Auto Retransmission 設定に注意

STM32 の CAN / FDCAN では、`.ioc` ファイル作成時に **Auto Retransmission がデフォルトで Disable になっています**。(シリーズや、CubeMX / CubeIDE のバージョンによって異なる場合があります)

この設定が `Disable` のままだと、送信に失敗したメッセージが自動で再送されません。

## なにが起きるか

CAN では、複数のノードが同時に送信しようとすると調停が行われます。

このとき、基本的に **CAN ID が小さいメッセージほど優先度が高く**、先に送信されます。

通常であれば、調停に負けたメッセージはあとから自動で再送されます。

しかし、`Auto Retransmission` が `Disable` だと、調停に負けたメッセージが再送されません。

## 例

PC から複数の基板にブロードキャストで `ping` を送る場合を考えます。

```text
PC → 全基板 : ping
```

各基板がほぼ同時に `pong` を返そうとすると、CAN の調停が発生します。

```text
基板1 → PC : pong, CAN ID = 0x101
基板2 → PC : pong, CAN ID = 0x102
基板3 → PC : pong, CAN ID = 0x103
```

この場合、CAN ID が一番小さい `0x101` が優先されます。

`Auto Retransmission` が `Disable` の場合、調停に負けた `0x102` や `0x103` は再送されません。

そのため、PC から見ると次のような状態になります。

```text
一番 ID が小さい基板からしか pong が返ってこない
```

また、データを送り続けている場合も、調停に負けたメッセージは再送されないため、**一部のノードからしかデータが返ってこない・データが欠落する**ように見えることがあります。

## 確認する設定

CubeMX / CubeIDE の `.ioc` 設定で、次の項目を確認します。

```text
Auto Retransmission = Enable
```

生成されたコードでは、FDCAN の場合は次のようになっているか確認します。

```c
hfdcan1.Init.AutoRetransmission = ENABLE;
```

通常の CAN の場合は、次のようになっているか確認します。

```c
hcan1.Init.AutoRetransmission = ENABLE;
```

`DISABLE` になっている場合は、自動再送が行われません。

## 基本方針

通常の通信では、基本的に次の設定にしておきます。

```text
Auto Retransmission = Enable
```

特に、次のような通信では有効にしておく方が安全です。

- 応答確認
- ID確認
- 状態取得
- パラメータ読み書き

## Disable にする場合

`Auto Retransmission` を `Disable` にすることが必ず間違いというわけではありません。

例えば、周期的な制御指令では、古いデータが遅れて送信される方が問題になる場合があります。
そのような場合は、あえて自動再送を無効にするという選択肢もあります。
**しかし、Disable にする場合は、送信失敗が起きる前提で通信設計を行う必要があります。**


## まとめ

STM32 の CAN / FDCAN では、`.ioc` 作成時に **Auto Retransmission が Disable になっていないか**を確認します。

この設定が無効だと、CAN の調停に負けたメッセージが再送されず、一部のノードからしか返信がないように見えることがあります。
基本的には、有効にすることを推奨します。

設定で、Enbale になっていても、送信が必ず成功するわけではありません。
必要に応じて、送信失敗時のリトライや、タイムアウト処理を行うことを推奨します。

## 参考資料
- [STM32G4 Series MCU RM0440 Reference Manual](https://www.st.com/resource/ja/reference_manual/rm0440-stm32g4-series-advanced-armbased-32bit-mcus-stmicroelectronics.pdf) : P.1918 参照

他のシリーズでも、同様の設定はありますが、詳細は各マイコンのリファレンスマニュアルを確認してください。
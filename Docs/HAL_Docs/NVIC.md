---
title: NVIC HAL API
---
# NVIC割り込み設定 API

## 概要

NVIC（Nested Vectored Interrupt Controller）は、Cortex-Mコアが周辺機能からの割り込みを管理する機構です。STM32 HALでは、`HAL_NVIC_*`関数で優先度を設定し、IRQ線を有効・無効にします。

周辺機能内の割り込み要因とNVICのIRQ線は、それぞれ有効にする必要があります。たとえばFDCANでは、`HAL_FDCAN_ActivateNotification()`とNVICの設定を行います。CubeMX生成のMSP初期化には通常この両方が含まれます。

## 関数概要

<ApiSignature :signature="'void HAL_NVIC_SetPriority(IRQn_Type IRQn, uint32_t PreemptPriority, uint32_t SubPriority);'" />

指定したIRQの優先度を設定します。`PreemptPriority`は、実行中の別の割り込みを中断できる優先度です。`SubPriority`は、同じプリエンプション優先度の割り込み間で処理順を決めます。使える値は`HAL_NVIC_SetPriorityGrouping()`とMCUの実装で決まり、数値が小さいほど優先度が高くなります。

<ApiSignature :signature="'void HAL_NVIC_EnableIRQ(IRQn_Type IRQn);'" />

<ApiSignature :signature="'void HAL_NVIC_DisableIRQ(IRQn_Type IRQn);'" />

指定したIRQ線を有効または無効にします。IRQ線を無効にしても、周辺機能の割り込みフラグは立つことがあります。再有効化の前後に必要な処理は、対象ペリフェラルのHAL APIとリファレンスマニュアルで確認してください。

<ApiSignature :signature="'void HAL_NVIC_SetPriorityGrouping(uint32_t PriorityGroup);'" />

優先度のビットをプリエンプション優先度とサブ優先度にどう割り当てるか設定します。プロジェクト内で設定を統一し、初期化後は変更しないでください。

## IRQハンドラーとの接続

```text
周辺機能の割り込み要因を有効化
  → NVICでIRQ線を有効化
  → ベクターテーブルに対応する *_IRQHandler()
  → HAL_xxx_IRQHandler(&handle)
  → HALコールバック
```

FDCANの受信コールバックを呼ぶには、周辺機能の通知とNVICのIRQ線を有効にし、IRQハンドラーから`HAL_FDCAN_IRQHandler()`を呼びます。いずれかが設定されていないと、コールバックは呼ばれません。

## 優先度の考え方

- Cortex-Mでは優先度番号が小さいほど優先度が高く、`0`が最優先です。
- `PreemptPriority`と`SubPriority`で指定できる範囲は、優先度グループと実装ビット数で決まります。
- 割り込みハンドラーでは、受信データの退避など短い処理に留めてください。長い処理や待ち時間がある処理は、他の割り込みやメイン処理を遅らせます。
- RTOSを使う場合、割り込み優先度によってカーネルAPIを呼べるかどうかが決まります。RTOSの設定とポート層の規約を確認してください。

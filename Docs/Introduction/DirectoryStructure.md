---
title: "ディレクトリ構成"
aliases:
  - "ディレクトリ構成"
---
# ディレクトリ構成

## 基本ディレクトリ構成（推奨構成）

```
app_project/
├─ Core/
│  ├─ Inc/
│  │  └─ main.h               # main.c のヘッダ（HAL include, ピン定義など）
│  └─ Src/
│     ├─ main.c               # HAL_Init→Clock→MX_* 初期化→mainapp() 呼び出し
│     └─ mainapp.cpp          # C++ 側エントリ（extern "C" mainapp）
├─ Drivers/
└─ Library/
   └─ HALbed/                 # HALbed ライブラリ本体
      ├─ Inc/
      │  ├─ HALbedConfig.h    # HALbed の設定（ユーザーカスタマイズ用）
      │  ├─ ...             　# その他の HALbed API ヘッダ
      │  └─ HALbed.h          # HALbed API ヘッダ
      └─ Src/
         └─ ...               # API 実装
```
ここでは、`app_project` 以下に、プロジェクト固有のコード（`Core/`）と、HALbed ライブラリ（`Library/HALbed/`）を配置しています。
この場合、CubeIDEのビルド設定で`Library/HALbed/Inc` をインクルードパスに追加し、`Library/HALbed/Src` をビルド対象に含める必要があります。
この構成では、プロジェクト固有のコードを `Core/` に、HALbed ライブラリを `Library/HALbed/` に分けて管理します。ファイルの役割を追いやすく、プロジェクト側のコードとライブラリ側のコードを分けて確認できます。

## 代替ディレクトリ構成
先ほどの構成では、プロジェクトごとにビルド設定が必要です。設定を減らしたい場合は、HALbed ライブラリをプロジェクトの `Core/` ディレクトリに直接配置する方法もあります。

```
app_project/
├─ Core/
│  ├─ Inc/
│  ├─ Src/
│  └─ Library/                 # HALbed ライブラリをここに配置
│     └─ HALbed/
...
```
この方法ではビルド設定が簡単になりますが、プロジェクトコードとライブラリコードが混在するため、構成は見づらくなります。

またこの場合は、`HALbedConfig.h` を編集し、インクルードパスを `Core/Library/HALbed/Inc` に変更する必要があります。
```c
// HALbedConfig.h
#ifndef HALBED_MAIN_HEADER_PATH
    // #define HALBED_MAIN_HEADER_PATH "../../Core/Inc/main.h"    // 基本構成
      #define HALBED_MAIN_HEADER_PATH "../Inc/main.h"             // 代替構成  
#endif
```

また、他の構成でも、`HALbedConfig.h` の `HALBED_MAIN_HEADER_PATH` を変更することで簡単に対応できます。

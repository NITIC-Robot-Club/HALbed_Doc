# ディレクトリ構成

## 基本ディレクトリ構成（推奨構成）

```
app_project/
├─ .mxproject                 # CubeMX/IDE 関連のメタ情報（プロジェクト管理）
├─ HALbed_dev.ioc             # STM32CubeMX 設定（MCU/ピン/クロック等）
├─ STM32F446RETX_RAM.ld       # リンカスクリプト（RAM実行向け）
├─ Core/
│  ├─ Inc/
│  │  └─ main.h               # main.c のヘッダ（HAL include, ピン定義など）
│  ├─ Src/
│     ├─ main.c               # HAL_Init→Clock→MX_* 初期化→mainapp() 呼び出し
│     ├─ mainapp.cpp          # C++ 側エントリ（extern "C" mainapp）
│     └─ syscalls.c           # newlib 用 syscalls（CubeIDE自動生成系）
├─  Drivers/
│  └─ CMSIS/Include/...       # CMSIS ヘッダ（Arm/STM32 標準）
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
この場合、CubeIDEでビルド設定に`Library/HALbed/Inc` をインクルードパスに追加し、`Library/HALbed/Src` をビルド対象に含める必要があります。
この構成により、プロジェクトコードとライブラリコードが明確に分離され、管理しやすくなります。プロジェクト固有のコードは `Core/` に集中させ、HALbed ライブラリは `Library/HALbed/` にまとめることで、コードの可読性と保守性が向上します。

## 代替ディレクトリ構成
先ほどの構成は毎回設定が面倒だと思う声もあるかもしれません。
その場合は、HALbed ライブラリをプロジェクトの `Core/` ディレクトリに直接配置する方法もあります。

```
app_project/
├─ Core/
│  ├─ Inc/
│  ├─ Src/
│  └─ Library/                 # HALbed ライブラリをここに配置
│     └─ HALbed/
...
```
この方法では、ビルド設定が簡単になりますが、プロジェクトコードとライブラリコードが混在するため、見ずらくはなります。

またこの場合は、`HALbedConfig.h` を編集し、インクルードパスを `Core/Library/HALbed/Inc` に変更する必要があります。
```c
// HALbedConfig.h
#ifndef HALBED_MAIN_HEADER_PATH
    // #define HALBED_MAIN_HEADER_PATH "../../Core/Inc/main.h"    // 基本構成
      #define HALBED_MAIN_HEADER_PATH "../Inc/main.h"             // 代替構成  
#endif
```

また、他の構成でも、`HALbedConfig.h` の `HALBED_MAIN_HEADER_PATH` を変更することで簡単に対応できます。
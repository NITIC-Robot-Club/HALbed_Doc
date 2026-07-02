---
tags:
  - 技術記事
  - チュートリアル
  - CubeIDE
  - 開発環境
thumbnail:
  targets:
    - tutorials-home
  description: 'プロジェクト作成から HALbed の追加までを段階的に説明します。'
  order: 20
---

# Cube IDE の使い方
このページでは、講習会のスライドをベースにCubeIDEの基本的使い方を説明します。
デバックなどの機能についての説明は割愛しています。必要に応じて、STMのドキュメントやネット上の情報を参照してください。


## 目次
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide2.png)
## CubeIDEの使い方
### プロジェクトの作成まで
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide4.png)

> [!note] ワークスペースの選択
> ワークスペースはプロジェクトを管理するためのフォルダです。任意の場所に作成してください。<br>
> パスに日本語が入っていると、後々ビルドエラーになる可能性があるので、英数字のみのパスを選択することをおすすめします。 <br>

![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide5.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide6.png)

メニューバー、またはメインウィンドウのアイコンから、プロジェクトの作成を開始します。

![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide7.png)
> [!note] プロジェクトの作成
> ここでは、プロジェクトの名前と、ターゲットマイコンを選択します。<br>
> 今回はNucleo G474REを選択していますが、使用しているボードに合わせて選択してください。<br>

![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide8.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide9.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide10.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide11.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide12.png)
> [!note] プロジェクトの作成完了
> プロジェクトが正しく作成されると、プロジェクトエクスプローラーにプロジェクトが表示されます。<br>

### ライブラリの追加
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide13.png)
> [!note] ライブラリの追加
> ```bash
> mkdir Library
> cd Library
> git submodule add https://github.com/NITIC-Robot-Club/HALbed.git
> ```

![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide15.png)
### プロジェクトの設定
次にプロジェクトの設定を行います。
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide16.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide17.png)
> [!note] インクルードパスの追加
> プロジェクトのプロパティから、C/C++ General -> Paths and Symbols -> Includes -> GNU C++を選択し、インクルードパスに`Library/HALbed/Inc`を追加します。<br>

> [!warning] 他のライブラリを追加する場合
> インクルードパスの追加は、追加するライブラリごとに行う必要があります。<br>
> 例えば、`Library/AnotherLib/Inc`を追加する場合は、同様にインクルードパスに追加してください。<br>

![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide18.png)
> [!note] ビルドの設定
> プロジェクトのプロパティから、C/C++ General -> Paths and Symbols -> Source Locationを選択し、`Library`フォルダをソースフォルダとして追加します。<br>
> これにより、`Library`フォルダ内のソースコードもビルドの対象になります。<br>
> **ビルド設定は設定されたフォルダの中を再帰的に検索するため、`Library`フォルダを追加すれば、`HALbed`や他のライブラリも自動的にビルドされます。**<br>


![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide19.png)
> [!note] floatのサポート
> HALbedはfloatを使用しています。プロジェクトのプロパティから、C/C++ Build -> Settings -> Tool Settings -> MCU Settings を選択し、<br>
> `Floating Point Unit`/`Floating point ABI` でFPUが有効化されていることを確認してください。<br>
> **`Use float with...` にチェックを入れてください。**<br>

### app_mainの作成
プロジェクトの`Src`フォルダに、`app_main.cpp`というファイルを作成し、以下のコードを追加してください。
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide20.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide21.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide22.png)
> [!note] app_mainの呼び出し
> `main.c`で`app_main.cpp`のコード(`app_main()`)が呼び出されるようにします。
> ```cpp
> /* USER CODE BEGIN 2 */
> extern void app_main(void);
> app_main();
> /* USER CODE END 2 */
> ```

### Lチカをしてみよう

![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide23.png)
#### .ioc ファイルの編集(CubeMX)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide24.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide25.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide26.png)

> [!note] Lチカのコード
> `app_main.cpp`に以下のコードを追加してください。
> ```cpp
> #include "main.h"
> #include "../../Library/HALbed/Inc/HALbed.hpp"
> 
> using namespace HALbed;
> DigitalOut LED(PA_5);
> 
> extern "C" void app_main(void) {
>     while (1)
>     {
>         for (int i = 0; i < 5; i++){
>             LED.toggle();  // 点滅
>             HAL_Delay(500);
>         }
>         for (int i = 0; i < 20; i++){
>             LED = 1;  // 点灯
>             HAL_Delay(100);
>             LED = 0;  // 消灯
>             HAL_Delay(100);
>         }
>         for (int i = 0; i < 40; i++){
>             LED.write(!LED.read());
>             HAL_Delay(50);
>         }
>     }
> }
> ```
> [DigitalOut](/Docs/API/DigitalOut.md)の使い方については、APIリファレンスを参照してください。<br>
### ビルドと書きこみ
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide27.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide28.png)
![image](/Docs/Technical_articles/Tutorials_articles/images/CubeIDE_Tutorial/slide29.png)

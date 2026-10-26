# Wired Communication 図版の再生成

`generate.py` が編集可能なSVGソースを生成し、`render.cjs` が同じファイル名のPNGを更新します。対象は `Docs/Technical_articles/Other_Articles/Wired_communication/images/Wired_Communication/` です。既存の22 PNG名を維持し、独立して残っていた `uart-waveform.svg` にもスタイルを合わせたPNGを用意します。記事参照のある13図には、幅360 pxの縦積みレイアウトを持つ`-mobile.svg`版を生成します。`can-connection.svg` と `can-connection-low-layer.svg` は `can-bus-connection.svg` と同じ図版を保つ旧記事パス用のSVG別名です。

リポジトリのルートで実行します。

```powershell
python tools/wired-communication-figures/generate.py
node tools/wired-communication-figures/render.cjs
```

Python 3.10以降とNode.js、Nodeから解決できる`sharp`が必要です。PNGレンダラーはmanifestに限らず出力フォルダー内の全SVGを読み取り、現在は38種（デスクトップ図23種、モバイル図13種、旧CAN名2種）のPNGを書き出します。`sharp`が標準のモジュール探索パスにない場合は、絶対パスを追加引数で指定できます。

```powershell
node tools/wired-communication-figures/render.cjs 'C:/path/to/node_modules/sharp'
```

色は濃い灰色 `#263238`、青 `#0072B2`、橙 `#D55E00`を軸に、線種と文字ラベルも併用します。SVGはNoto Sans JPを指定しています。表示環境に同フォントがない場合は代替フォントになります。PNGはSharpで192 dpi相当の解像度にラスタライズします。

図の構成・文字・回路線は `generate.py` が唯一の生成元です。PNGを編集しても再生成時に上書きされます。出力フォルダー内のSVGごとに同じベース名のPNGが作られます。旧CAN名のSVG/PNGは新しいバス図の複製です。`manifest.json`には生成図の名前、タイトル、説明を記録しています。

## Figma内の改訂版（2026-10-22）

対象ファイルは [HALbed Wired Communication 図版](https://www.figma.com/design/GMuPLPoa8dWTF9vdT6qsEs/) です。PC用25図・モバイル用13図の既存フレームIDを保持し、回路・波形をベクター、日本語ラベルをNoto Sans JPの編集可能なテキストとして更新します。

この改訂版の生成元は `redesign.py`、`redesign_can.py`、`redesign_serial.py`、`redesign_common.py` です。上記のWeb掲載版 `generate.py` とは別の制作経路です。Web掲載版への反映は行っていません。

```powershell
python tools/wired-communication-figures/redesign.py
```

出力先は `.vitepress/cache/wired-redesign/`。38個のラベル付きSVGプレビューと、図形SVG・文字・フレームIDを収めた `scenes.json` を出力します。波形と電流曲線はPythonで数値計算します。CAN差動電圧はCANH−CANL、I²Cは8データ＋ACK、UARTは0xA5のLSB先行を用います。

MCP反映時は `scenes.json` の対象要素を `const scenes = [...];` として `figma-apply-scenes.js` の前に置き、`use_figma` に渡します。1呼出しのコードは50,000文字未満とし、対象IDと名前を検査してから同じフレームの子要素を更新します。フォント読込後にテキストを作成し、作成・削除・更新した全IDと文字の範囲検査を返します。フレーム対応と反映結果は `figma-redesign-manifest.json` に記録します。

白地、濃い灰色、青を基本とし、橙は反射や信号の識別に限定します。影・グラデーション・まとめ帯を使わず、配線接続点、信号の方向、軸と単位、同じ尺度での比較を優先しています。

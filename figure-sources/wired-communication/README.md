# 通信系38図の再生成

[Figma改訂版](https://www.figma.com/design/GMuPLPoa8dWTF9vdT6qsEs/)と共通のPython原稿から、PC25図・モバイル13図を出力します。旧CAN名2種を含め、既存の画像名を保持します。

```powershell
python figure-sources/wired-communication/redesign.py --site
node figure-sources/wired-communication/render.cjs
```

Pythonは標準ライブラリのみ、PNG化はNode.jsとSharpが必要です。Sharpが標準の探索パスにない場合はモジュールの絶対パスをレンダラーの引数へ渡します。

`--site`なしでは `.vitepress/cache/wired-redesign/` にプレビューSVGと `scenes.json` を用意します。`--site`を付けると記事の `images/Wired_Communication/` に全38 SVGを保存し、レンダラーが同名PNGを更新します。

生成元は `redesign.py`、`redesign_can.py`、`redesign_serial.py`、`redesign_common.py` です。Noto Sans JP、白地、濃い灰色、青を基本とし、橙は識別に限定します。波形・電流曲線はPythonで計算します。

`figma-redesign-manifest.json`は全38フレームの対応とMCP検査結果です。Figmaの手動変更はPythonへ自動同期しません。MCP再反映時は `scenes.json` の対象要素を `const scenes = [...];` として `figma-apply-scenes.js` の前に置き、`use_figma`へ渡します。各呼出しは50,000文字未満に分割します。

2026-10-22にサイト画像へ反映。検証結果は親フォルダの `validation.md` を参照してください。

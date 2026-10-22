# 技術記事の図版原稿

`wired-communication/` はFigmaで改訂した通信系38図、`low-layer/` はLow_Layerの8種とモバイル版8図の再生成元です。Pythonの標準ライブラリで数式・波形・配置からSVGを作り、Node.jsとSharpでPNGを書き出します。日本語はNoto Sans JPを使用します。

```powershell
python figure-sources/wired-communication/redesign.py --site
node figure-sources/wired-communication/render.cjs
python figure-sources/low-layer/generate.py
node figure-sources/low-layer/render.cjs --from-source
```

Sharpがローカルにない場合は、レンダラーの引数へSharpモジュールの絶対パスを渡します。詳細は各フォルダのREADMEを参照してください。Figmaノードとの対応は各manifestに残しています。

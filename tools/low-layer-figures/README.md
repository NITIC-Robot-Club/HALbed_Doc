# Low_Layer図版の制作・再生成

対象は`Docs/Technical_articles/MCU_Doc/images/Low_Layer/`の8種。`-mobile.svg`は狭い画面用の配置で、記事では`picture`の`source`で切り替える。PNGは元の8ファイル名を維持する。

## 編集元

- [編集可能なFigma Designファイル](https://www.figma.com/design/ZzagJOJ7DUCduUufzJPtj7)
- `figma-manifest.json`：画像名、ノードID、寸法、書き出し元、同期状態と証拠。
- `generate.py`：回路の接続、ラベル、Pythonで計算する曲線、共通の配置。
- 文字：Noto Sans JP Regular / Bold。SVGは文字を保持するため、閲覧環境ではフォントの代替が起こり得る。PNGはローカルのNoto Sans JPで描画済み。

## 再生成

Python 3.10以降の標準ライブラリのみで数値計算とSVG生成ができる。

```sh
python tools/low-layer-figures/generate.py
python tools/low-layer-figures/prepare_figma.py
```

`.vitepress/cache/low-layer-figures/`に16枚の原稿SVG、`scenes.json`、各図の`.figma.js`を出力する。端点・単調性・区間内の微分関係・電流と時定数の単位も検証する。Figmaのフォントは事前に`listAvailableFontsAsync()`で確認する。

Figma MCPの`use_figma`に`.figma.js`の内容を1図ずつ渡す。ファイルキーは`ZzagJOJ7DUCduUufzJPtj7`、`skillNames`は`figma-use`。初期値では既存の同名図を変更しない。同名図を再生成する場合だけ、その図のスクリプト内の`replaceExisting`を`true`にする。Figmaで手動変更した内容はPythonへ自動で戻らないため、必要な変更は生成元へ反映してから再生成する。

FigmaからSVGを取得する際は、文字保持の設定を使う。

```js
const node = await figma.getNodeByIdAsync('対象のノードID');
return { svg: await node.exportAsync({ format: 'SVG_STRING', svgOutlineText: false }) };
```

返されたSVGを対応する画像名で保存する。ツールの返却上限を超える場合は文字列を分割する。ローカル原稿を直接使う場合は次の`--from-source`を指定する。

```sh
node tools/low-layer-figures/render.cjs --from-source
```

Node.jsと`sharp`が必要。既存SVGを保持してPNGだけ更新する場合は`--from-source`を付けない。`sharp`がプロジェクト外にある場合は、そのモジュールの絶対パスを追加引数で渡せる。PNGはSVGの2倍の寸法で描画する。確認用の一覧画像はキャッシュ内だけに生成する。

## 数値と図の意味

- 指令値比較：`u=t/T`、直線ランプは`u`、S字は`3u²−2u³`。区間外では0または1。実機の速度応答ではない。
- S字関数比較：ロジスティック関数は`1/(1+exp(−10(u−0.5)))`。端点は約0.00669、0.99331。cos補間は`(1−cos(πu))/2`、Smoothstepは`3u²−2u³`。無次元量。
- 運動比較：加速0–1秒、定速1–2秒、減速2–3秒、最大相対速度1。S字速度は加速にcos補間、減速にその反転を使用。加速度・ジャークは解析的に微分する。境界の不連続を線でつながない。台形速度のジャークは0、1、2、3秒で理想インパルスとなり、矢印の高さは任意。
- 抵抗選定：R=1–100 kΩ、VCC=3.3 V、C=100 pF。`I=VCC/R`、`τ=RC`。τは10–90%立上り時間と異なる。例の条件を個別のMCUへ流用しない。Iallowは所定の論理出力電圧を維持できる駆動電流とする。
- 降圧回路：非同期整流、理想部品、定常状態、連続導通モード。DのアノードはGND側、カソードはスイッチノード。入力コンデンサや制御回路は基本動作の説明から省略。`VOUT=VIN×D`はこの理想条件での式。

## 2026-10-20の制作記録

16図すべてをFigmaに作成。SVG6枚をFigmaから取得した時点でStarterプランのMCP呼び出し上限に到達し、残る10枚は同じPythonの入力データから書き出した。PNG8枚は最終SVGからローカルで生成した。

最終確認で、台形速度のジャークの注記を時間軸ラベルから離した。サイトのPC・モバイル版とFigmaの該当2ノードに反映済み。2026-10-22、Figma MCP同期は競合なし・`complete: true`で完了し、注記ノード`3:178`と`3:440`の位置をスクリーンショットでも確認した。全16図のうち14図の最終スクリーンショットを確認。残る`2:260`と`2:312`はStarterプランの呼び出し上限で取得できず、追加呼び出しは行っていない。数式・曲線・回路接続の差はない。詳細はmanifestを参照。

2026-10-21の再開時はFigma連携ツールが利用不可となり、ブラウザ経由でも編集画面へ接続できなかった。その後2026-10-22に同じ`sync-figma-annotations.js`で対象2つの注記だけを同期し、`complete: true`と競合なしを確認した。画像確認は14/16図。残る2図は画像取得上限による未確認として記録している。

## 検証

`python tools/low-layer-figures/generate.py`、`npm run docs:build`、全図の一覧確認、記事2ページのPC/スマートフォン・明暗表示を確認する。詳細な確認結果は`validation.md`に記録する。

調査と継続利用する制作基準は、Obsidianの`50 Codex/Knowledge/UI Design/AIっぽさを避ける技術図版の設計.md`、今回の判断は`50 Codex/Projects/halbed-doc/Low_Layer図版制作方針.md`に保存する。

# 図版の置換・検証（2026-10-22）

- 通信系：Figma改訂版と共通のPython原稿から38 SVGを記事フォルダへ保存し、同名38 PNGを再生成。
- Low_Layer：作成済み16 SVG・互換用8 PNGを保持し、既存6参照にモバイル用pictureと代替テキストを適用。
- 既存記事の画像以外の推敲はコミット対象から分離。抵抗式の略記説明だけは図を読むために含める。
- `npm run docs:build -- --outDir .vitepress/cache/figures-site` 成功。既知の500kBチャンク警告のみ。通常実行では親フォルダ参照の権限制限に遭遇したため、承認された実行環境で再実行。
- Chrome/Playwright：11ページ×PC/スマートフォン×明暗テーマの44状態、84画像読込みを検査。画像欠落・空のalt・画像の横はみ出し・pictureの選択ミス・画像フィルターなし。
- 代表2ページの最初の図を各4状態で画像保存。詳細レポートと画像は `.vitepress/cache/figure-site-check/`。
- Figma上の図の正確性・配置検査は `wired-communication/figma-redesign-manifest.json` と `low-layer/validation.md` を参照。

再検証：先に上記のサイトビルドを行い、`node figure-sources/check-site.cjs` を実行する。Playwrightが標準パスにない場合はモジュールの絶対パスを引数で渡す。

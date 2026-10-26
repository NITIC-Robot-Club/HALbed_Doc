# 開発資料トップの検証（2026-10-22）

作業ブランチ: `dev`、作業場所: 元のworkspace。未コミット・未push・未公開。

## ビルド

- `npm run docs:build -- --outDir .vitepress/cache/article-discovery-site` 成功（最終12.87秒）。
- `git diff --check` 成功。
- 500kB超のchunk警告あり。ビルド失敗ではなく、サイト全体のバンドル分割は今回の対象外。
- カタログは正規の生成スクリプトで更新。devに元からあったHAL資料の説明の差分も生成結果に含まれる。本文は編集していない。

## ブラウザ・スクリーンショット

- デスクトップ: ライト／ダーク、5分野と41記事、代表記事へのリンクを確認。
- 390px: 初期表示、フィルタ、検索結果、0件時の回復。320px: フィルタ1列と横スクロール解消。768px: 1列の分野一覧と分野ナビを確認。
- 横幅: 320px設定でclientWidth=scrollWidth=305、768px設定で753、390pxでも一致。ネイティブスクロールバーの有無でclientWidthは変わる。
- `ＣＡＮ　終端`: NFKC正規化とAND検索で1件。検索語に対応する記事を確認。
- 存在しない検索語: 0件の案内、条件解除、検索欄へのフォーカス復帰を確認。
- 有線通信15件＋タグCAN=9件、タイトル順への切り替え、再読込時の選択復元を確認。
- 記事リンクを開いて戻る: 分野・タグ・並び順のURL状態を復元。
- 結果のタグを再度押すと解除。全件表示を確認。
- devの無線通信「すべて見る」: 5件、結果見出しにフォーカス、見出しの上端約88pxで固定ヘッダーに隠れない。
- キーボード: 検索欄からTabで分野selectへ移動。ネイティブ要素と可視フォーカスを使用。

操作35件、文言40件の点検表は同フォルダの `article-home-ui.md` と `article-home-copy.md`。確認範囲で既知の未解決UI課題なし。実機のソフトキーボード・高倍率拡大・支援技術の読み上げは未確認。

## 保存先

スクリーンショットはこのチャットのvisualizationsフォルダの `article-home-final-desktop.jpg`、`article-home-final-desktop-dark.jpg`、`article-home-final-mobile.jpg`。

## 既存作業の保存

- 旧dev: `.worktree/dev-merge` を `feat/dev-preserved-20261022` へ切り替え。
- 旧workspace: `.worktree/sensor-selection-preserved` の `feat/sensor-selection` に未コミット変更を復元。
- stashも保持。退避checkoutの追跡内容はstashとの `git diff --quiet` で一致。改行はGitの自動変換に従う。
- 元から存在するignoredな図版・tools出力は削除せず保持。devのignore規則が異なるため、一部がuntrackedとして見える。

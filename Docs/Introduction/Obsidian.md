---
title: Obsidianでドキュメントを管理する
aliases:
  - Obsidian運用
tags:
  - HALbed
  - ドキュメント運用
description: HALbed DocsをObsidianのVaultとして編集・検索・リンクするためのルールです。
---
# Obsidianでドキュメントを管理する

このリポジトリのルートをObsidianのVaultとして開くと、`Docs/` 以下のMarkdownをそのまま編集できます。

## タグの書き方

記事の先頭に Obsidian 標準の YAML プロパティを記述します。`tags` の値には `#` を付けません。

```yaml
---
title: CANの基礎
aliases:
  - CAN入門
tags:
  - 開発資料
  - 通信/CAN
date: 2026-09-01
---
```

本文中の `#CAN` や階層タグ `#通信/CAN` も利用できます。サイトのタグ一覧・記事カード・関連記事は、YAMLと本文のタグを統合して表示します。タグ名は大文字小文字を含めて同じ文字列として扱われるため、既存タグを再利用してください。

## リンクと画像

Obsidianでは、同じVault内の文書に対して `[[I2C_address]]`、画像に対して `![[images/example.png]]` が使えます。サイトに表示する既存のMarkdownリンクと相互運用するため、公開ページでは従来の相対リンク・Markdown画像も引き続き利用できます。

画像は記事と同じフォルダ、またはその配下の `images/` に置き、リンクは次のように相対指定します。

```md
![配線図](<images/wiring.png>)
```

## 運用ルール

- 1ファイル1記事とし、ファイル名は英数字とハイフンを基本にします。
- 新規記事には `title`、`aliases`、`tags` を付けます。
- タグはカテゴリではなく検索・関連記事の観点で付け、必要なら `/` で階層化します。
- 変更後は `npm run docs:build` でタグ一覧とリンクの生成結果を確認します。

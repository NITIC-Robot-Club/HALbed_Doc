HAL-Wrapper-Docs/
├── README.md
│   ├── 目的・スコープ
│   ├── 対象読者
│   ├── この Wiki で扱わないこと
│   └── 全体構成へのリンク
│
├── Architecture/
│   ├── Overview.md
│   │   ├── レイヤ構造
│   │   ├── Wrapper の責務
│   │   └── Non-Goals（やらないこと）
│   │
│   ├── DesignPolicy.md
│   │   ├── API 設計方針
│   │   ├── 命名規則
│   │   ├── 初期化ポリシー
│   │   ├── 状態管理方針
│   │   └── エラーハンドリング方針
│   │
│   └── Compatibility.md
│       ├── 対応 STM32 シリーズ
│       ├── HAL バージョン依存
│       └── 非互換変更ポリシー
│
├── Modules/
│   ├── Overview.md
│   │   ├── 提供モジュール一覧
│   │   ├── モジュール共通設計
│   │   └── 各モジュールページの読み方
│   │
│   ├── GPIO/
│   │   ├── README.md
│
│
├── Internals/
│   ├── DirectoryStructure.md
│   │   └── 実装ディレクトリ構成
│   │
│   ├── ImplementationRules.md
│   │   ├── HAL 呼び出しルール
│   │   ├── static / extern
│   │   └── private API
│   │
│   └── AddingModule.md
│       ├── 新モジュール追加手順
│       ├── 必須ファイル
│
│
├── FAQ.md
│   ├── HAL を直接呼んでよいか
│   ├── CubeMX との関係
│   ├── RTOS 併用時の注意
│   └── 想定外の使い方について
│
└── CHANGELOG.md
    ├── API 変更履歴
    ├── Breaking Change
    └── 廃止予定 API

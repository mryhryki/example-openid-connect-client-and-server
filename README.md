# example-openid-connect-client-and-server

## プロジェクト概要 🔑

このプロジェクトは：
- OpenID Connect のクライアント・サーバー実装のサンプルです
- ローカル環境での実行に特化しています
- 学習目的のため、可能な限りスクラッチで実装しています

## 技術スタック 🛠️

### 共通開発環境
- **言語**: TypeScript
- **ランタイム**: Node.js (Volta で管理)
- **パッケージ管理**: npm
- **コード品質管理**:
  - Biome (Linter/Formatter)
  - tsc (型チェック)
- **テスト**: Vitest
- **バージョン管理**: GitHub

### クライアントサイド (/client) 🖥️
- **フレームワーク**: React
- **ビルドツール**: Vite
- **データベース**: SQLite3

### サーバーサイド (/server) 🔧
- **フレームワーク**: Express
- **データベース**: SQLite3

## 依存関係の方針 📦

- セキュリティ関連（例：`jose`）: 専用ライブラリを使用
- その他の機能: 可能な限り自前実装

## 品質管理 ⚡

- GitHub Actions による自動チェック
  - 設定ファイル: `.github/workflows/check.yaml`

## 開発方針 🤖

- 基本的に AI (Cline, Cursor) を活用して実装
- AI生成コードの問題が発生した場合は手動で修正

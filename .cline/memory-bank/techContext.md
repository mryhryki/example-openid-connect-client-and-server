# 技術コンテキスト

## 開発環境
- **Node.js**: v23.6.1 (Voltaで管理)
- **npm**: v11.0.0 (Voltaで管理)
- **TypeScript**: v5.7.3
- **モノレポ構成**: npm workspaces

## 主要技術スタック

### 共通
- **言語**: TypeScript
- **パッケージ管理**: npm
- **コード品質管理**:
  - Biome (v1.9.4): Linter/Formatter
  - TypeScript (v5.7.3): 型チェック
- **テスト**: Vitest (v3.0.5)
- **バージョン管理**: GitHub

### クライアント側 (/client)
- **フレームワーク**: React (予定)
- **ビルドツール**: Vite (予定)
- **データベース**: SQLite3 (予定)
- **主要機能**:
  - OpenID Connect Relying Party (RP) 実装
  - 認証状態管理
  - ユーザーインターフェース

### サーバー側 (/server)
- **フレームワーク**: Express (予定)
- **データベース**: SQLite3 (予定)
- **主要機能**:
  - OpenID Connect Provider (OP) 実装
  - JWT生成・検証
  - ユーザー管理

## 依存関係管理方針
- **セキュリティ関連**: 専用ライブラリを使用
  - 例: `jose` (JWT実装)
- **その他の機能**: 可能な限り自前実装

## 開発ワークフロー
1. **コード品質管理**:
   - `npm run lint`: Biomeによるコード品質チェック
   - `npm run fmt`: Biomeによる自動フォーマット
   - `npm run type`: TypeScriptによる型チェック
   - `npm run test`: Vitestによるテスト実行

2. **CI/CD**:
   - GitHub Actionsによる自動チェック
   - 設定ファイル: `.github/workflows/check.yaml`

## 技術的制約
- ローカル環境での実行に特化
- 学習目的のため、可能な限りスクラッチで実装
- セキュリティ関連の実装は専用ライブラリを使用

## 開発方針
- 基本的にAI (Cline, Cursor) を活用して実装
- AI生成コードの問題が発生した場合は手動で修正
- テスト駆動開発の採用

## 将来的な技術検討事項
- フロントエンドフレームワークの選定と実装
- データベーススキーマの設計
- APIエンドポイントの設計と実装
- セキュリティ強化策の検討

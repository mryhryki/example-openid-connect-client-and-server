# example-openid-connect-client-and-server

- OpenID Connect のクライアントとサーバーのサンプルプロジェクトです。
- ローカル環境のみでの実行を想定しています。（インターネット上で公開することは想定していません）
- 動作を理解するためのプロジェクトなので、可能な限りスクラッチで実装する方針です。

## 開発環境

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/) with [Volta](https://volta.sh/)
    - [npm](https://www.npmjs.com/): Package Manager
- [Biome](https://biomejs.dev/):Linter and Formatter
- [Vitest](https://vitejs.dev/guide/): Test Runner
- [tsc](https://www.typescriptlang.org/): Type Checker (Not transpiler)
- [GitHub](https://github.com/): Version Control

### クライアント (./client/)
 
- [React](https://reactjs.org/) - Frontend
- [Vite](https://vitejs.dev/) - Bundler and Development Server
- [SQLite3](https://www.sqlite.org/) - Database

### サーバー (./server/)

- [Express](https://expressjs.com/) - Web Framework
- [SQLite3](https://www.sqlite.org/) - Database

## 依存ライブラリの方針

- [jose](https://npmjs.com/package/jose) など、セキュリティ的に重要なものは専用のライブラリを使用します。
- それ以外の自分で実装可能な外部のライブラリは、原則として使用しない方針とします。

## CI

- GitHub Actions で `.github/workflows/check.yaml` で自動的にチェックされます。

## AI利用方針

このリポジトリは、基本的に AI (Cline, Cursor) を使って実装する方針です。
ただし、AIが生成したコードで、修正が難しい場合は手動で修正する場合もあります。

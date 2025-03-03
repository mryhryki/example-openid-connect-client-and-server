# example-openid-connect-client-and-server

- OpenID Connect のクライアントとサーバーのサンプルプロジェクトです。
- ローカル環境のみでの実行を想定しています。（インターネット上で公開することは想定していません）

## 開発環境

- [Node.js](https://nodejs.org/) with [Volta](https://volta.sh/)
    - [npm](https://www.npmjs.com/): Package Manager
- [Biome](https://biomejs.dev/):Linter and Formatter
- [Vitest](https://vitejs.dev/guide/): Test Runner
- [tsc](https://www.typescriptlang.org/): Type Checker (Not transpiler)

### クライアント (./client/)
 
- [React](https://reactjs.org/) - Frontend
- [Vite](https://vitejs.dev/) - Bundler and Development Server
- [SQLite3](https://www.sqlite.org/) - Database

### サーバー (./server/)

- [Express](https://expressjs.com/) - Web Framework
- [SQLite3](https://www.sqlite.org/) - Database

## CI

- GitHub Actions で `.github/workflows/check.yaml` で自動的にチェックされます。

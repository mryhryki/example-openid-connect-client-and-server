# OpenID Connect クライアント (RP) 実装

## 概要

このディレクトリには、OpenID Connect Relying Party (RP) の基本的な実装が含まれています。OpenID Connectは、OAuth 2.0をベースにした認証プロトコルで、ユーザーの認証と基本的なプロファイル情報の取得を可能にします。

## 主な機能

- 認証リクエストURLの生成
- 認証コードを使用したトークンの取得
- IDトークンの検証
- ユーザー情報の取得
- リフレッシュトークンを使用した新しいトークンの取得
- コールバック処理

## 使用方法

### 基本的な使用例

```typescript
import OpenIDConnectRP from "./index";

// OpenID Connect RPの初期化
const rp = new OpenIDConnectRP({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  redirectUri: "https://your-app.example.com/callback",
  authorizationEndpoint: "https://auth.example.com/authorize",
  tokenEndpoint: "https://auth.example.com/token",
  userinfoEndpoint: "https://auth.example.com/userinfo",
});

// 認証リクエストURLの生成
const authUrl = rp.generateAuthorizationUrl();
// ユーザーをこのURLにリダイレクト

// コールバック処理（認証後にリダイレクトされたときの処理）
const callbackUrl = "https://your-app.example.com/callback?code=example-code&state=example-state";
const callbackResult = await rp.handleCallback(callbackUrl);

if (callbackResult.error) {
  console.error("認証エラー:", callbackResult.error, callbackResult.errorDescription);
  return;
}

// トークンの取得と検証
const { access_token, id_token } = callbackResult.tokenResponse;

if (id_token) {
  const isValid = rp.validateIdToken(id_token);
  console.log("IDトークンの検証結果:", isValid);
}

// ユーザー情報の取得
if (access_token) {
  const userInfo = await rp.getUserInfo(access_token);
  console.log("ユーザー情報:", userInfo);
}
```

詳細な使用例は `src/example.ts` ファイルを参照してください。

### 設定オプション

`OpenIDConnectRP` クラスのコンストラクタには、以下の設定オプションを指定できます：

```typescript
interface OpenIDConfiguration {
  // 必須パラメータ
  clientId: string;           // クライアントID
  redirectUri: string;        // リダイレクトURI
  
  // OpenID Provider (OP) のエンドポイント（必須）
  authorizationEndpoint: string;  // 認証エンドポイント
  tokenEndpoint: string;          // トークンエンドポイント
  
  // 任意パラメータ
  clientSecret?: string;      // クライアントシークレット
  responseType?: string;      // レスポンスタイプ（デフォルト: "code"）
  scope?: string;             // スコープ（デフォルト: "openid profile email"）
  userinfoEndpoint?: string;  // ユーザー情報エンドポイント
  jwksUri?: string;           // JWKSエンドポイント
  
  // その他の任意パラメータ
  responseMode?: string;      // レスポンスモード
  state?: string;             // 状態（自動生成される場合あり）
  nonce?: string;             // ノンス（自動生成される場合あり）
  display?: string;           // 表示モード
  prompt?: string;            // プロンプト
  maxAge?: number;            // 最大認証経過時間
  uiLocales?: string;         // UI言語
  idTokenHint?: string;       // IDトークンヒント
  loginHint?: string;         // ログインヒント
  acrValues?: string;         // 認証コンテキストクラス参照値
}
```

## セキュリティに関する注意事項

この実装は学習目的のサンプルであり、本番環境での使用には追加のセキュリティ対策が必要です：

1. **IDトークンの検証**: 現在の実装では簡易的な検証のみを行っています。本番環境では、JWTの署名検証を適切に行う必要があります。
2. **状態管理**: `state`と`nonce`の値は、セッションなどで安全に管理する必要があります。
3. **トークンの保存**: アクセストークンやリフレッシュトークンは、安全な方法で保存する必要があります。
4. **エラー処理**: より堅牢なエラー処理を実装する必要があります。

## テスト

テストは `src/index.test.ts` ファイルに含まれています。以下のコマンドでテストを実行できます：

```bash
npm test
```

## 参考資料

- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0](https://oauth.net/2/)

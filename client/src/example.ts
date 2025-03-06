/**
 * OpenID Connect RPの使用例
 */
import OpenIDConnectRP from "./index";

/**
 * OpenID Connect RPの使用例を示す関数
 */
async function exampleUsage() {
  try {
    // 1. OpenID Connect RPの初期化
    const rp = new OpenIDConnectRP({
      clientId: "your-client-id",
      clientSecret: "your-client-secret",
      redirectUri: "https://your-app.example.com/callback",
      authorizationEndpoint: "https://auth.example.com/authorize",
      tokenEndpoint: "https://auth.example.com/token",
      userinfoEndpoint: "https://auth.example.com/userinfo",
      scope: "openid profile email",
    });

    // 2. 認証リクエストURLの生成
    const authUrl = rp.generateAuthorizationUrl();
    console.log("認証URL:", authUrl);
    // この認証URLにユーザーをリダイレクトします
    // 例: window.location.href = authUrl;

    // 3. コールバック処理（認証後にリダイレクトされたときの処理）
    // 注: 実際のアプリケーションでは、コールバックURLはリダイレクト後に取得します
    const callbackUrl =
      "https://your-app.example.com/callback?code=example-code&state=example-state";
    const callbackResult = await rp.handleCallback(callbackUrl);

    if (callbackResult.error) {
      console.error(
        "認証エラー:",
        callbackResult.error,
        callbackResult.errorDescription,
      );
      return;
    }

    if (!callbackResult.tokenResponse) {
      console.error("トークンレスポンスがありません");
      return;
    }

    // 4. トークンの取得と検証
    const { access_token, id_token } = callbackResult.tokenResponse;

    if (id_token) {
      const isValid = rp.validateIdToken(id_token);
      console.log("IDトークンの検証結果:", isValid);
    }

    // 5. ユーザー情報の取得
    if (access_token) {
      const userInfo = await rp.getUserInfo(access_token);
      console.log("ユーザー情報:", userInfo);
    }

    // 6. リフレッシュトークンの使用（存在する場合）
    if (callbackResult.tokenResponse.refresh_token) {
      const refreshedTokens = await rp.refreshToken(
        callbackResult.tokenResponse.refresh_token,
      );
      console.log("リフレッシュされたトークン:", refreshedTokens);
    }
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
}

/**
 * Expressアプリケーションでの使用例
 *
 * 注: この例は実際には実行されません。Expressアプリケーションでの使用方法を示すためのものです。
 */
function expressExample() {
  // Expressアプリケーションの例（実際には実行されません）
  /*
  import express from "express";
  import session from "express-session";
  import OpenIDConnectRP from "./index";

  const app = express();
  
  // セッションの設定
  app.use(session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: true,
  }));

  // OpenID Connect RPの初期化
  const rp = new OpenIDConnectRP({
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
    redirectUri: "http://localhost:3000/callback",
    authorizationEndpoint: "https://auth.example.com/authorize",
    tokenEndpoint: "https://auth.example.com/token",
    userinfoEndpoint: "https://auth.example.com/userinfo",
  });

  // ログインページ
  app.get("/login", (req, res) => {
    // stateとnonceをセッションに保存
    req.session.state = rp.state;
    req.session.nonce = rp.nonce;
    
    // 認証URLにリダイレクト
    const authUrl = rp.generateAuthorizationUrl();
    res.redirect(authUrl);
  });

  // コールバックページ
  app.get("/callback", async (req, res) => {
    try {
      // コールバック処理
      const callbackResult = await rp.handleCallback(req.url);
      
      if (callbackResult.error) {
        return res.status(400).send(`認証エラー: ${callbackResult.error} - ${callbackResult.errorDescription}`);
      }
      
      if (!callbackResult.tokenResponse) {
        return res.status(400).send("トークンレスポンスがありません");
      }
      
      // トークンをセッションに保存
      req.session.tokens = callbackResult.tokenResponse;
      
      // ユーザー情報を取得
      const userInfo = await rp.getUserInfo(callbackResult.tokenResponse.access_token);
      req.session.userInfo = userInfo;
      
      // ホームページにリダイレクト
      res.redirect("/");
    } catch (error) {
      res.status(500).send(`エラーが発生しました: ${error.message}`);
    }
  });

  // ホームページ
  app.get("/", (req, res) => {
    if (!req.session.userInfo) {
      return res.redirect("/login");
    }
    
    res.send(`
      <h1>ようこそ、${req.session.userInfo.name || req.session.userInfo.sub}さん</h1>
      <pre>${JSON.stringify(req.session.userInfo, null, 2)}</pre>
      <a href="/logout">ログアウト</a>
    `);
  });

  // ログアウトページ
  app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });

  // サーバーの起動
  app.listen(3000, () => {
    console.log("サーバーが起動しました: http://localhost:3000");
  });
  */
}

// 使用例の実行（実際のアプリケーションでは必要に応じて呼び出します）
// exampleUsage().catch(console.error);

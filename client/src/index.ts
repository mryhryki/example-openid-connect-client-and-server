/**
 * OpenID Connect Relying Party (RP) の基本クラス実装
 */

// 必要な型定義
export interface OpenIDConfiguration {
  // 必須パラメータ
  clientId: string;
  redirectUri: string;
  
  // 任意パラメータ（デフォルト値あり）
  responseType?: string;
  scope?: string;
  
  // OpenID Provider (OP) のエンドポイント
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userinfoEndpoint?: string;
  jwksUri?: string;
  
  // その他の設定
  clientSecret?: string;
  responseMode?: string;
  state?: string;
  nonce?: string;
  display?: string;
  prompt?: string;
  maxAge?: number;
  uiLocales?: string;
  idTokenHint?: string;
  loginHint?: string;
  acrValues?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
}

export interface UserInfo {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  updated_at?: number;
  [key: string]: any; // その他のカスタムクレーム
}

export interface IDTokenPayload {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  auth_time?: number;
  nonce?: string;
  acr?: string;
  amr?: string[];
  azp?: string;
  at_hash?: string;
  c_hash?: string;
  [key: string]: any; // その他のカスタムクレーム
}

/**
 * OpenID Connect Relying Party (RP) の基本クラス
 */
export class OpenIDConnectRP {
  private config: OpenIDConfiguration;
  private state: string;
  private nonce: string;

  /**
   * コンストラクタ
   * @param config OpenID Connect の設定
   */
  constructor(config: OpenIDConfiguration) {
    // 必須パラメータの検証
    if (!config.clientId) {
      throw new Error("clientId is required");
    }
    if (!config.redirectUri) {
      throw new Error("redirectUri is required");
    }
    if (!config.authorizationEndpoint) {
      throw new Error("authorizationEndpoint is required");
    }
    if (!config.tokenEndpoint) {
      throw new Error("tokenEndpoint is required");
    }

    // デフォルト値の設定
    this.config = {
      ...config,
      responseType: config.responseType || "code",
      scope: config.scope || "openid profile email",
    };

    // state と nonce の生成
    this.state = config.state || this.generateRandomString();
    this.nonce = config.nonce || this.generateRandomString();
  }

  /**
   * 認証リクエストURLを生成する
   * @returns 認証リクエストURL
   */
  public generateAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: this.config.responseType!,
      scope: this.config.scope!,
      state: this.state,
      nonce: this.nonce,
    });

    // 任意パラメータの追加
    if (this.config.responseMode) {
      params.append("response_mode", this.config.responseMode);
    }
    if (this.config.display) {
      params.append("display", this.config.display);
    }
    if (this.config.prompt) {
      params.append("prompt", this.config.prompt);
    }
    if (this.config.maxAge !== undefined) {
      params.append("max_age", this.config.maxAge.toString());
    }
    if (this.config.uiLocales) {
      params.append("ui_locales", this.config.uiLocales);
    }
    if (this.config.idTokenHint) {
      params.append("id_token_hint", this.config.idTokenHint);
    }
    if (this.config.loginHint) {
      params.append("login_hint", this.config.loginHint);
    }
    if (this.config.acrValues) {
      params.append("acr_values", this.config.acrValues);
    }

    return `${this.config.authorizationEndpoint}?${params.toString()}`;
  }

  /**
   * 認証コードを使用してトークンを取得する
   * @param code 認証コード
   * @returns トークンレスポンス
   */
  public async getToken(code: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
    });

    if (this.config.clientSecret) {
      params.append("client_secret", this.config.clientSecret);
    }

    const response = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.statusText}`);
    }

    return await response.json() as TokenResponse;
  }

  /**
   * IDトークンを検証する
   * @param idToken IDトークン
   * @returns 検証結果（true: 有効、false: 無効）
   */
  public validateIdToken(idToken: string): boolean {
    try {
      // 注: 実際の実装では、JWTの署名検証やクレームの検証が必要です
      // このサンプル実装では、簡易的な検証のみを行います
      
      const parts = idToken.split(".");
      if (parts.length !== 3) {
        return false;
      }

      const payload = JSON.parse(atob(parts[1])) as IDTokenPayload;
      
      // 有効期限の検証
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp <= now) {
        return false;
      }

      // 発行者の検証
      // 注: 実際の実装では、設定された発行者と比較する必要があります
      if (!payload.iss) {
        return false;
      }

      // 対象者の検証
      if (payload.aud !== this.config.clientId && 
          (!Array.isArray(payload.aud) || !payload.aud.includes(this.config.clientId))) {
        return false;
      }

      // nonceの検証（存在する場合）
      if (payload.nonce && payload.nonce !== this.nonce) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("ID Token validation error:", error);
      return false;
    }
  }

  /**
   * ユーザー情報を取得する
   * @param accessToken アクセストークン
   * @returns ユーザー情報
   */
  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    if (!this.config.userinfoEndpoint) {
      throw new Error("userinfoEndpoint is not configured");
    }

    const response = await fetch(this.config.userinfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`UserInfo request failed: ${response.statusText}`);
    }

    return await response.json() as UserInfo;
  }

  /**
   * 認証レスポンスを処理する
   * @param url リダイレクトURL（クエリパラメータを含む）
   * @returns 処理結果
   */
  public async handleCallback(url: string): Promise<{
    tokenResponse?: TokenResponse;
    error?: string;
    errorDescription?: string;
  }> {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    // エラーチェック
    const error = params.get("error");
    if (error) {
      return {
        error,
        errorDescription: params.get("error_description") || undefined,
      };
    }

    // stateの検証
    const state = params.get("state");
    if (!state || state !== this.state) {
      return {
        error: "invalid_state",
        errorDescription: "State parameter does not match",
      };
    }

    // 認証コードの取得
    const code = params.get("code");
    if (!code) {
      return {
        error: "invalid_response",
        errorDescription: "Authorization code is missing",
      };
    }

    // トークンの取得
    try {
      const tokenResponse = await this.getToken(code);
      return { tokenResponse };
    } catch (error) {
      return {
        error: "token_error",
        errorDescription: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * ランダムな文字列を生成する
   * @param length 文字列の長さ（デフォルト: 32）
   * @returns ランダムな文字列
   */
  private generateRandomString(length = 32): string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const randomValues = new Uint8Array(length);
    
    // ブラウザ環境とNode.js環境の両方に対応
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(randomValues);
    } else if (typeof globalThis !== "undefined" && globalThis.crypto) {
      // Node.js環境（ESモジュール対応）
      globalThis.crypto.getRandomValues(randomValues);
    } else {
      // フォールバック（セキュリティ的に推奨されません）
      for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * charset.length);
      }
    }
    
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    
    return result;
  }

  /**
   * リフレッシュトークンを使用して新しいトークンを取得する
   * @param refreshToken リフレッシュトークン
   * @returns トークンレスポンス
   */
  public async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.config.clientId,
    });

    if (this.config.clientSecret) {
      params.append("client_secret", this.config.clientSecret);
    }

    const response = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return await response.json() as TokenResponse;
  }
}

// エクスポート
export default OpenIDConnectRP;

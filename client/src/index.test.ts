import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OpenIDConnectRP, {
  type OpenIDConfiguration,
  type TokenResponse,
  type UserInfo,
} from "./index";

// モックの設定
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Base64エンコード/デコードのモック
global.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
global.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");

describe("OpenIDConnectRP", () => {
  // テスト用の設定
  const config: OpenIDConfiguration = {
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    redirectUri: "https://example.com/callback",
    authorizationEndpoint: "https://auth.example.com/authorize",
    tokenEndpoint: "https://auth.example.com/token",
    userinfoEndpoint: "https://auth.example.com/userinfo",
    jwksUri: "https://auth.example.com/jwks",
    responseType: "code",
    scope: "openid profile email",
    state: "test-state",
    nonce: "test-nonce",
  };

  // テスト用のIDトークン
  const createIdToken = (payload: Record<string, unknown>) => {
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = global.btoa(JSON.stringify(header));
    const encodedPayload = global.btoa(JSON.stringify(payload));
    return `${encodedHeader}.${encodedPayload}.signature`;
  };

  beforeEach(() => {
    // fetchのモックをリセット
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("constructor", () => {
    it("必須パラメータがない場合はエラーをスローする", () => {
      // clientIdがない場合
      expect(() => new OpenIDConnectRP({ ...config, clientId: "" })).toThrow(
        "clientId is required",
      );

      // redirectUriがない場合
      expect(() => new OpenIDConnectRP({ ...config, redirectUri: "" })).toThrow(
        "redirectUri is required",
      );

      // authorizationEndpointがない場合
      expect(
        () => new OpenIDConnectRP({ ...config, authorizationEndpoint: "" }),
      ).toThrow("authorizationEndpoint is required");

      // tokenEndpointがない場合
      expect(
        () => new OpenIDConnectRP({ ...config, tokenEndpoint: "" }),
      ).toThrow("tokenEndpoint is required");
    });

    it("デフォルト値が正しく設定される", () => {
      // responseTypeとscopeを省略
      const minimalConfig = {
        clientId: "test-client-id",
        redirectUri: "https://example.com/callback",
        authorizationEndpoint: "https://auth.example.com/authorize",
        tokenEndpoint: "https://auth.example.com/token",
      };

      const rp = new OpenIDConnectRP(minimalConfig);

      // privateプロパティにアクセスするためにキャスト
      const rpAny = rp as unknown as { config: OpenIDConfiguration };

      expect(rpAny.config.responseType).toBe("code");
      expect(rpAny.config.scope).toBe("openid profile email");
    });
  });

  describe("generateAuthorizationUrl", () => {
    it("正しい認証リクエストURLを生成する", () => {
      const rp = new OpenIDConnectRP(config);
      const url = rp.generateAuthorizationUrl();

      // URLをパースして検証
      const parsedUrl = new URL(url);
      expect(parsedUrl.origin + parsedUrl.pathname).toBe(
        config.authorizationEndpoint,
      );

      // クエリパラメータを検証
      const params = new URLSearchParams(parsedUrl.search);
      expect(params.get("client_id")).toBe(config.clientId);
      expect(params.get("redirect_uri")).toBe(config.redirectUri);
      expect(params.get("response_type")).toBe(config.responseType);
      expect(params.get("scope")).toBe(config.scope);
      expect(params.get("state")).toBe(config.state);
      expect(params.get("nonce")).toBe(config.nonce);
    });

    it("任意パラメータを含む認証リクエストURLを生成する", () => {
      const configWithOptionalParams: OpenIDConfiguration = {
        ...config,
        responseMode: "form_post",
        display: "popup",
        prompt: "login",
        maxAge: 3600,
        uiLocales: "ja",
        idTokenHint: "previous-id-token",
        loginHint: "user@example.com",
        acrValues: "1",
      };

      const rp = new OpenIDConnectRP(configWithOptionalParams);
      const url = rp.generateAuthorizationUrl();

      // URLをパースして検証
      const parsedUrl = new URL(url);
      const params = new URLSearchParams(parsedUrl.search);

      // 任意パラメータを検証
      expect(params.get("response_mode")).toBe(
        configWithOptionalParams.responseMode,
      );
      expect(params.get("display")).toBe(configWithOptionalParams.display);
      expect(params.get("prompt")).toBe(configWithOptionalParams.prompt);
      expect(params.get("max_age")).toBe(
        configWithOptionalParams.maxAge?.toString(),
      );
      expect(params.get("ui_locales")).toBe(configWithOptionalParams.uiLocales);
      expect(params.get("id_token_hint")).toBe(
        configWithOptionalParams.idTokenHint,
      );
      expect(params.get("login_hint")).toBe(configWithOptionalParams.loginHint);
      expect(params.get("acr_values")).toBe(configWithOptionalParams.acrValues);
    });
  });

  describe("getToken", () => {
    it("認証コードを使用してトークンを取得する", async () => {
      const tokenResponse: TokenResponse = {
        access_token: "test-access-token",
        token_type: "Bearer",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
        id_token: "test-id-token",
      };

      // fetchのモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => tokenResponse,
      });

      const rp = new OpenIDConnectRP(config);
      const result = await rp.getToken("test-code");

      // fetchが正しく呼び出されたか検証
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(config.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: expect.any(String),
      });

      // リクエストボディを検証
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = new URLSearchParams(callArgs[1].body);
      expect(requestBody.get("grant_type")).toBe("authorization_code");
      expect(requestBody.get("code")).toBe("test-code");
      expect(requestBody.get("redirect_uri")).toBe(config.redirectUri);
      expect(requestBody.get("client_id")).toBe(config.clientId);
      expect(requestBody.get("client_secret")).toBe(config.clientSecret);

      // 結果を検証
      expect(result).toEqual(tokenResponse);
    });

    it("トークンリクエストが失敗した場合はエラーをスローする", async () => {
      // fetchのモック
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      });

      const rp = new OpenIDConnectRP(config);

      // エラーがスローされることを検証
      await expect(rp.getToken("test-code")).rejects.toThrow(
        "Token request failed: Unauthorized",
      );
    });
  });

  describe("validateIdToken", () => {
    it("有効なIDトークンを検証する", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: "https://auth.example.com",
        sub: "user123",
        aud: "test-client-id",
        exp: now + 3600,
        iat: now,
        nonce: "test-nonce",
      };

      const idToken = createIdToken(payload);

      const rp = new OpenIDConnectRP(config);
      const isValid = rp.validateIdToken(idToken);

      expect(isValid).toBe(true);
    });

    it("有効期限切れのIDトークンを検証する", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: "https://auth.example.com",
        sub: "user123",
        aud: "test-client-id",
        exp: now - 3600, // 有効期限切れ
        iat: now - 7200,
        nonce: "test-nonce",
      };

      const idToken = createIdToken(payload);

      const rp = new OpenIDConnectRP(config);
      const isValid = rp.validateIdToken(idToken);

      expect(isValid).toBe(false);
    });

    it("不正なaudを持つIDトークンを検証する", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: "https://auth.example.com",
        sub: "user123",
        aud: "wrong-client-id", // 不正なクライアントID
        exp: now + 3600,
        iat: now,
        nonce: "test-nonce",
      };

      const idToken = createIdToken(payload);

      const rp = new OpenIDConnectRP(config);
      const isValid = rp.validateIdToken(idToken);

      expect(isValid).toBe(false);
    });

    it("不正なnonceを持つIDトークンを検証する", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: "https://auth.example.com",
        sub: "user123",
        aud: "test-client-id",
        exp: now + 3600,
        iat: now,
        nonce: "wrong-nonce", // 不正なnonce
      };

      const idToken = createIdToken(payload);

      const rp = new OpenIDConnectRP(config);
      const isValid = rp.validateIdToken(idToken);

      expect(isValid).toBe(false);
    });
  });

  describe("getUserInfo", () => {
    it("アクセストークンを使用してユーザー情報を取得する", async () => {
      const userInfo: UserInfo = {
        sub: "user123",
        name: "Test User",
        email: "user@example.com",
        email_verified: true,
      };

      // fetchのモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => userInfo,
      });

      const rp = new OpenIDConnectRP(config);
      const result = await rp.getUserInfo("test-access-token");

      // fetchが正しく呼び出されたか検証
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(config.userinfoEndpoint, {
        headers: {
          Authorization: "Bearer test-access-token",
        },
      });

      // 結果を検証
      expect(result).toEqual(userInfo);
    });

    it("userinfoEndpointが設定されていない場合はエラーをスローする", async () => {
      const configWithoutUserinfoEndpoint = { ...config };
      configWithoutUserinfoEndpoint.userinfoEndpoint = undefined;

      const rp = new OpenIDConnectRP(configWithoutUserinfoEndpoint);

      // エラーがスローされることを検証
      await expect(rp.getUserInfo("test-access-token")).rejects.toThrow(
        "userinfoEndpoint is not configured",
      );
    });

    it("ユーザー情報リクエストが失敗した場合はエラーをスローする", async () => {
      // fetchのモック
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      });

      const rp = new OpenIDConnectRP(config);

      // エラーがスローされることを検証
      await expect(rp.getUserInfo("test-access-token")).rejects.toThrow(
        "UserInfo request failed: Unauthorized",
      );
    });
  });

  describe("handleCallback", () => {
    it("認証コードを含むコールバックを処理する", async () => {
      const tokenResponse: TokenResponse = {
        access_token: "test-access-token",
        token_type: "Bearer",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
        id_token: "test-id-token",
      };

      // fetchのモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => tokenResponse,
      });

      const rp = new OpenIDConnectRP(config);
      const callbackUrl = `https://example.com/callback?code=test-code&state=${config.state}`;
      const result = await rp.handleCallback(callbackUrl);

      // 結果を検証
      expect(result).toEqual({ tokenResponse });
    });

    it("エラーを含むコールバックを処理する", async () => {
      const rp = new OpenIDConnectRP(config);
      const callbackUrl =
        "https://example.com/callback?error=access_denied&error_description=User+denied+access";
      const result = await rp.handleCallback(callbackUrl);

      // 結果を検証
      expect(result).toEqual({
        error: "access_denied",
        errorDescription: "User denied access",
      });
    });

    it("不正なstateを含むコールバックを処理する", async () => {
      const rp = new OpenIDConnectRP(config);
      const callbackUrl =
        "https://example.com/callback?code=test-code&state=wrong-state";
      const result = await rp.handleCallback(callbackUrl);

      // 結果を検証
      expect(result).toEqual({
        error: "invalid_state",
        errorDescription: "State parameter does not match",
      });
    });

    it("認証コードがないコールバックを処理する", async () => {
      const rp = new OpenIDConnectRP(config);
      const callbackUrl = `https://example.com/callback?state=${config.state}`;
      const result = await rp.handleCallback(callbackUrl);

      // 結果を検証
      expect(result).toEqual({
        error: "invalid_response",
        errorDescription: "Authorization code is missing",
      });
    });
  });

  describe("refreshToken", () => {
    it("リフレッシュトークンを使用して新しいトークンを取得する", async () => {
      const tokenResponse: TokenResponse = {
        access_token: "new-access-token",
        token_type: "Bearer",
        refresh_token: "new-refresh-token",
        expires_in: 3600,
        id_token: "new-id-token",
      };

      // fetchのモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => tokenResponse,
      });

      const rp = new OpenIDConnectRP(config);
      const result = await rp.refreshToken("test-refresh-token");

      // fetchが正しく呼び出されたか検証
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(config.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: expect.any(String),
      });

      // リクエストボディを検証
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = new URLSearchParams(callArgs[1].body);
      expect(requestBody.get("grant_type")).toBe("refresh_token");
      expect(requestBody.get("refresh_token")).toBe("test-refresh-token");
      expect(requestBody.get("client_id")).toBe(config.clientId);
      expect(requestBody.get("client_secret")).toBe(config.clientSecret);

      // 結果を検証
      expect(result).toEqual(tokenResponse);
    });

    it("トークンリフレッシュが失敗した場合はエラーをスローする", async () => {
      // fetchのモック
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      });

      const rp = new OpenIDConnectRP(config);

      // エラーがスローされることを検証
      await expect(rp.refreshToken("test-refresh-token")).rejects.toThrow(
        "Token refresh failed: Unauthorized",
      );
    });
  });
});

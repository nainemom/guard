declare namespace google.accounts.oauth2 {
  interface TokenResponse {
    access_token: string;
    error?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  }

  interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void | Promise<void>;
    error_callback?: (error: { type: string; message: string }) => void;
  }

  interface TokenClient {
    requestAccessToken(overrides?: { prompt?: string }): void;
  }

  function initTokenClient(config: TokenClientConfig): TokenClient;
  function revoke(token: string, callback?: () => void): void;
}

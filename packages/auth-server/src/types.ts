// ============================================
// packages/auth-server/src/types.ts
// ============================================
export interface AuthServerConfig {
  appId: string;
  appSecret: string;
  redirectUri?: string;
  version?: string;
}

export interface TokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface LongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface DebugTokenResponse {
  data: {
    app_id: string;
    type: string;
    application: string;
    data_access_expires_at: number;
    expires_at: number;
    is_valid: boolean;
    issued_at: number;
    scopes: string[];
    user_id: string;
  };
}

export interface PageAccessToken {
  access_token: string;
  category: string;
  category_list: Array<{
    id: string;
    name: string;
  }>;
  name: string;
  id: string;
  tasks: string[];
}

export interface TokenRefreshResult {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface TokenValidationResult {
  valid: boolean;
  expiresAt?: Date;
  scopes?: string[];
  userId?: string;
  appId?: string;
  error?: string;
}

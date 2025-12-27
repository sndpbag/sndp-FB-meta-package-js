// ============================================
// packages/auth-server/src/auth-server.ts
// ============================================
import axios, { AxiosInstance } from 'axios';
import { validateConfig } from '@sndp/meta-core';
import { z } from 'zod';
import {
  AuthServerConfig,
  TokenExchangeResponse,
  LongLivedTokenResponse,
  DebugTokenResponse,
  PageAccessToken,
  TokenValidationResult
} from './types';

const AuthServerConfigSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  appSecret: z.string().min(1, 'App Secret is required'),
  redirectUri: z.string().optional(),
  version: z.string().default('v18.0')
});

export class MetaAuthServer {
  private appId: string;
  private appSecret: string;
  private redirectUri?: string;
  private version: string;
  private client: AxiosInstance;

  constructor(config: AuthServerConfig) {
    // Validate configuration
    const validatedConfig = validateConfig(AuthServerConfigSchema, config);

    this.appId = validatedConfig.appId;
    this.appSecret = validatedConfig.appSecret;
    this.redirectUri = config.redirectUri;
    this.version = validatedConfig.version;

    // Initialize HTTP client
    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${this.version}`,
      timeout: 30000
    });
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, redirectUri?: string): Promise<TokenExchangeResponse> {
    try {
      const response = await this.client.get<TokenExchangeResponse>('/oauth/access_token', {
        params: {
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: redirectUri || this.redirectUri,
          code
        }
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Token exchange failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Exchange short-lived token for long-lived token (60 days)
   */
  async exchangeForLongLivedToken(shortLivedToken: string): Promise<LongLivedTokenResponse> {
    try {
      const response = await this.client.get<LongLivedTokenResponse>('/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.appId,
          client_secret: this.appSecret,
          fb_exchange_token: shortLivedToken
        }
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Long-lived token exchange failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Refresh long-lived token (extends by 60 days)
   */
  async refreshToken(token: string): Promise<LongLivedTokenResponse> {
    try {
      // Debug token first to check if it needs refresh
      const debugInfo = await this.debugToken(token);
      
      if (!debugInfo.data.is_valid) {
        throw new Error('Token is invalid and cannot be refreshed');
      }

      // Check if token expires in less than 7 days
      const expiresAt = new Date(debugInfo.data.expires_at * 1000);
      const now = new Date();
      const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry > 7) {
        // Token is still valid for more than 7 days, return as is
        return {
          access_token: token,
          token_type: 'bearer',
          expires_in: daysUntilExpiry * 24 * 60 * 60
        };
      }

      // Refresh the token
      return await this.exchangeForLongLivedToken(token);
    } catch (error: any) {
      throw new Error(
        `Token refresh failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Debug token to get information
   */
  async debugToken(token: string): Promise<DebugTokenResponse> {
    try {
      const response = await this.client.get<DebugTokenResponse>('/debug_token', {
        params: {
          input_token: token,
          access_token: `${this.appId}|${this.appSecret}`
        }
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Token debug failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Validate token and return detailed information
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const debugInfo = await this.debugToken(token);
      const data = debugInfo.data;

      if (!data.is_valid) {
        return {
          valid: false,
          error: 'Token is invalid'
        };
      }

      // Check if token is expired
      if (data.expires_at && data.expires_at * 1000 < Date.now()) {
        return {
          valid: false,
          error: 'Token has expired'
        };
      }

      return {
        valid: true,
        expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : undefined,
        scopes: data.scopes,
        userId: data.user_id,
        appId: data.app_id
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Get page access tokens for a user
   */
  async getPageAccessTokens(userAccessToken: string): Promise<PageAccessToken[]> {
    try {
      const response = await this.client.get('/me/accounts', {
        params: {
          access_token: userAccessToken
        }
      });

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get page tokens: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Get long-lived page access token (never expires)
   */
  async getLongLivedPageToken(pageId: string, userAccessToken: string): Promise<string> {
    try {
      // First get long-lived user token
      const longLivedUserToken = await this.exchangeForLongLivedToken(userAccessToken);

      // Then get page token with long-lived user token
      const response = await this.client.get(`/${pageId}`, {
        params: {
          fields: 'access_token',
          access_token: longLivedUserToken.access_token
        }
      });

      return response.data.access_token;
    } catch (error: any) {
      throw new Error(
        `Failed to get long-lived page token: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Revoke/invalidate a token
   */
  async revokeToken(token: string): Promise<{ success: boolean }> {
    try {
      await this.client.delete('/me/permissions', {
        params: {
          access_token: token
        }
      });

      return { success: true };
    } catch (error: any) {
      throw new Error(
        `Token revocation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Get app access token (for server-to-server calls)
   */
  getAppAccessToken(): string {
    return `${this.appId}|${this.appSecret}`;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    
    const expectedSignature = crypto
      .createHmac('sha256', this.appSecret)
      .update(payload)
      .digest('hex');

    const receivedSignature = signature.replace('sha256=', '');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  }

  /**
   * Generate state parameter for CSRF protection
   */
  generateState(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get authorization URL
   */
  getAuthorizationUrl(scopes: string[], state?: string, redirectUri?: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri || this.redirectUri || '',
      scope: scopes.join(','),
      state: state || this.generateState(),
      response_type: 'code'
    });

    return `https://www.facebook.com/${this.version}/dialog/oauth?${params.toString()}`;
  }
}
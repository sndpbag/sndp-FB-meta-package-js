// ============================================
// packages/auth-server/src/token-manager.ts
// ============================================
import { TokenStorage, MemoryTokenStorage } from '@sndp/meta-core';
import { MetaAuthServer } from './auth-server';
import { AuthServerConfig } from './types';

export interface TokenManagerConfig extends AuthServerConfig {
  storage?: TokenStorage;
  autoRefresh?: boolean;
  refreshThresholdDays?: number;
}

export class TokenManager {
  private auth: MetaAuthServer;
  private storage: TokenStorage;
  private autoRefresh: boolean;
  private refreshThresholdDays: number;
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: TokenManagerConfig) {
    this.auth = new MetaAuthServer(config);
    this.storage = config.storage || new MemoryTokenStorage();
    this.autoRefresh = config.autoRefresh !== false;
    this.refreshThresholdDays = config.refreshThresholdDays || 7;
  }

  /**
   * Store token with automatic refresh scheduling
   */
  async storeToken(userId: string, token: string): Promise<void> {
    // Validate and get token info
    const validation = await this.auth.validateToken(token);

    if (!validation.valid) {
      throw new Error(`Cannot store invalid token: ${validation.error}`);
    }

    // Calculate TTL
    const ttl = validation.expiresAt 
      ? Math.floor((validation.expiresAt.getTime() - Date.now()) / 1000)
      : undefined;

    // Store token
    await this.storage.set(`token:${userId}`, token, ttl);

    // Store metadata
    await this.storage.set(
      `token_meta:${userId}`,
      JSON.stringify({
        expiresAt: validation.expiresAt?.toISOString(),
        scopes: validation.scopes,
        userId: validation.userId
      }),
      ttl
    );

    // Schedule auto-refresh if enabled
    if (this.autoRefresh && validation.expiresAt) {
      this.scheduleTokenRefresh(userId, validation.expiresAt);
    }
  }

  /**
   * Get stored token
   */
  async getToken(userId: string): Promise<string | null> {
    const token = await this.storage.get(`token:${userId}`);

    if (!token) {
      return null;
    }

    // Validate token is still valid
    const validation = await this.auth.validateToken(token);

    if (!validation.valid) {
      // Token is invalid, remove it
      await this.removeToken(userId);
      return null;
    }

    // Check if token needs refresh
    if (this.shouldRefreshToken(validation.expiresAt)) {
      try {
        const refreshed = await this.auth.refreshToken(token);
        await this.storeToken(userId, refreshed.access_token);
        return refreshed.access_token;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return token; // Return old token if refresh fails
      }
    }

    return token;
  }

  /**
   * Refresh token for a user
   */
  async refreshToken(userId: string): Promise<string> {
    const token = await this.storage.get(`token:${userId}`);

    if (!token) {
      throw new Error('No token found for user');
    }

    const refreshed = await this.auth.refreshToken(token);
    await this.storeToken(userId, refreshed.access_token);

    return refreshed.access_token;
  }

  /**
   * Remove token
   */
  async removeToken(userId: string): Promise<void> {
    // Cancel auto-refresh if scheduled
    const interval = this.refreshIntervals.get(userId);
    if (interval) {
      clearTimeout(interval);
      this.refreshIntervals.delete(userId);
    }

    await this.storage.delete(`token:${userId}`);
    await this.storage.delete(`token_meta:${userId}`);
  }

  /**
   * Check if token exists and is valid
   */
  async hasValidToken(userId: string): Promise<boolean> {
    const token = await this.getToken(userId);
    return token !== null;
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(userId: string): Promise<any> {
    const meta = await this.storage.get(`token_meta:${userId}`);
    return meta ? JSON.parse(meta) : null;
  }

  /**
   * Revoke token
   */
  async revokeToken(userId: string): Promise<void> {
    const token = await this.storage.get(`token:${userId}`);

    if (token) {
      try {
        await this.auth.revokeToken(token);
      } catch (error) {
        console.error('Failed to revoke token:', error);
      }
    }

    await this.removeToken(userId);
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(userId: string, expiresAt: Date): void {
    // Cancel existing refresh if any
    const existingInterval = this.refreshIntervals.get(userId);
    if (existingInterval) {
      clearTimeout(existingInterval);
    }

    // Calculate when to refresh (threshold days before expiry)
    const refreshTime = new Date(expiresAt);
    refreshTime.setDate(refreshTime.getDate() - this.refreshThresholdDays);

    const delay = refreshTime.getTime() - Date.now();

    if (delay > 0) {
      const timeout = setTimeout(async () => {
        try {
          await this.refreshToken(userId);
          console.log(`Auto-refreshed token for user ${userId}`);
        } catch (error) {
          console.error(`Failed to auto-refresh token for user ${userId}:`, error);
        }
      }, delay);

      this.refreshIntervals.set(userId, timeout);
    }
  }

  /**
   * Check if token should be refreshed
   */
  private shouldRefreshToken(expiresAt?: Date): boolean {
    if (!expiresAt) {
      return false;
    }

    const daysUntilExpiry = Math.floor(
      (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilExpiry <= this.refreshThresholdDays;
  }

  /**
   * Clean up all scheduled refreshes
   */
  destroy(): void {
    this.refreshIntervals.forEach(interval => clearTimeout(interval));
    this.refreshIntervals.clear();
  }
}
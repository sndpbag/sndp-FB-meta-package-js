// ============================================
// packages/pages/src/client.ts
// ============================================
import { HttpClient, validateConfig, paginateResults } from '@sndp/meta-core';
import { z } from 'zod';
import { PagesConfig, PageInfo } from './types';
import { PostManager } from './posts/manager';
import { CommentManager } from './comments/manager';
import { InsightsManager } from './insights/manager';

const PagesConfigSchema = z.object({
  accessToken: z.string().min(1, 'Access Token is required'),
  version: z.string().default('v18.0')
});

export class PagesClient {
  private http: HttpClient;
  private userAccessToken: string;

  public posts: PostManager;
  public comments: CommentManager;
  public insights: InsightsManager;

  constructor(config: PagesConfig) {
    // Validate configuration
    const validatedConfig = validateConfig(PagesConfigSchema, config);

    this.userAccessToken = validatedConfig.accessToken;

    // Initialize HTTP client
    this.http = new HttpClient({
      baseURL: `https://graph.facebook.com/${config.version || 'v18.0'}`,
      accessToken: validatedConfig.accessToken,
      version: config.version || 'v18.0'
    });

    // Initialize managers (will be configured per page)
    this.posts = new PostManager(this.http);
    this.comments = new CommentManager(this.http);
    this.insights = new InsightsManager(this.http);
  }

  /**
   * Get list of pages managed by the user
   */
  async getPages(): Promise<PageInfo[]> {
    const response: any = await this.http.get('/me/accounts', {
      params: {
        fields: 'id,name,category,access_token,tasks,followers_count,fan_count,link,picture'
      }
    });

    return response.data;
  }

  /**
   * Get single page information
   */
  async getPage(pageId: string): Promise<PageInfo> {
    return this.http.get(`/${pageId}`, {
      params: {
        fields: 'id,name,category,followers_count,fan_count,link,picture,about,phone,website,emails'
      }
    });
  }

  /**
   * Get page access token (never expires if from long-lived user token)
   */
  async getPageAccessToken(pageId: string): Promise<string> {
    const response: any = await this.http.get(`/${pageId}`, {
      params: {
        fields: 'access_token'
      }
    });

    return response.access_token;
  }

  /**
   * Get all pages with pagination
   */
  async *getAllPages(): AsyncGenerator<PageInfo[]> {
    yield* paginateResults(async (cursor) => {
      return this.http.get('/me/accounts', {
        params: {
          fields: 'id,name,category,access_token,tasks',
          limit: 100,
          ...(cursor && { after: cursor })
        }
      });
    });
  }

  /**
   * Update page information
   */
  async updatePage(pageId: string, data: {
    about?: string;
    phone?: string;
    website?: string;
    emails?: string[];
  }): Promise<{ success: boolean }> {
    return this.http.post(`/${pageId}`, data);
  }

  /**
   * Get page roles/admins
   */
  async getPageRoles(pageId: string): Promise<any[]> {
    const response: any = await this.http.get(`/${pageId}/roles`, {
      params: {
        fields: 'user,role'
      }
    });

    return response.data;
  }

  /**
   * Like a page (as user)
   */
  async likePage(pageId: string): Promise<{ success: boolean }> {
    return this.http.post(`/${pageId}/likes`);
  }

  /**
   * Unlike a page (as user)
   */
  async unlikePage(pageId: string): Promise<{ success: boolean }> {
    return this.http.delete(`/${pageId}/likes`);
  }

  /**
   * Get page call-to-action button
   */
  async getCallToAction(pageId: string): Promise<any> {
    return this.http.get(`/${pageId}/call_to_actions`);
  }

  /**
   * Create/Update call-to-action button
   */
  async setCallToAction(pageId: string, ctaData: {
    type: 'BOOK_NOW' | 'CONTACT_US' | 'USE_APP' | 'PLAY_GAME' | 'SHOP_NOW' | 'SIGN_UP' | 'WATCH_VIDEO' | 'CALL_NOW' | 'EMAIL' | 'MESSAGE';
    value: {
      link?: string;
      app_id?: string;
    };
  }): Promise<any> {
    return this.http.post(`/${pageId}/call_to_actions`, ctaData);
  }
}
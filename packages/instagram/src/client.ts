// ============================================
// packages/instagram/src/client.ts
// ============================================
import { HttpClient, validateConfig } from '@sndp/meta-core';
import { z } from 'zod';
import { InstagramConfig } from './types';
import { FeedMedia } from './media/feed';
import { StoryMedia } from './media/stories';
import { ReelMedia } from './media/reels';
import { CarouselMedia } from './media/carousel';
import { CommentManager } from './engagement/comments';
import { MentionManager } from './engagement/mentions';
import { HashtagManager } from './engagement/hashtags';
import { InsightsManager } from './insights/analytics';

const InstagramConfigSchema = z.object({
  accessToken: z.string().min(1, 'Access Token is required'),
  accountId: z.string().min(1, 'Instagram Account ID is required'),
  version: z.string().default('v18.0')
});

export class InstagramClient {
  private http: HttpClient;
  private accountId: string;

  public feed: FeedMedia;
  public story: StoryMedia;
  public reel: ReelMedia;
  public carousel: CarouselMedia;
  public comments: CommentManager;
  public mentions: MentionManager;
  public hashtags: HashtagManager;
  public insights: InsightsManager;

  constructor(config: InstagramConfig) {
    // Validate configuration
    const validatedConfig = validateConfig(InstagramConfigSchema, config);

    this.accountId = validatedConfig.accountId;

    // Initialize HTTP client
    this.http = new HttpClient({
      baseURL: `https://graph.facebook.com/${config.version || 'v18.0'}`,
      accessToken: validatedConfig.accessToken,
      version: config.version || 'v18.0'
    });

    // Initialize media managers
    this.feed = new FeedMedia(this.http, this.accountId);
    this.story = new StoryMedia(this.http, this.accountId);
    this.reel = new ReelMedia(this.http, this.accountId);
    this.carousel = new CarouselMedia(this.http, this.accountId);

    // Initialize engagement managers
    this.comments = new CommentManager(this.http, this.accountId);
    this.mentions = new MentionManager(this.http, this.accountId);
    this.hashtags = new HashtagManager(this.http, this.accountId);

    // Initialize insights manager
    this.insights = new InsightsManager(this.http, this.accountId);
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    return this.http.get(`/${this.accountId}`, {
      params: {
        fields: 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website'
      }
    });
  }

  /**
   * Get recent media
   */
  async getMedia(limit: number = 25): Promise<any> {
    return this.http.get(`/${this.accountId}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,thumbnail_url',
        limit
      }
    });
  }

  /**
   * Get single media by ID
   */
  async getMediaById(mediaId: string): Promise<any> {
    return this.http.get(`/${mediaId}`, {
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,thumbnail_url,children{id,media_type,media_url}'
      }
    });
  }

  /**
   * Delete media
   */
  async deleteMedia(mediaId: string): Promise<{ success: boolean }> {
    return this.http.delete(`/${mediaId}`);
  }

  /**
   * Search location
   */
  async searchLocation(latitude: number, longitude: number, distance: number = 500): Promise<any> {
    return this.http.get('/search', {
      params: {
        type: 'place',
        center: `${latitude},${longitude}`,
        distance
      }
    });
  }
}
/ ============================================
// packages/instagram/src/engagement/hashtags.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { HashtagMedia } from '../types';

export class HashtagManager {
  constructor(
    private http: HttpClient,
    private accountId: string
  ) {}

  /**
   * Search hashtag ID
   */
  async searchHashtag(hashtag: string): Promise<{ id: string }> {
    // Remove # if present
    const cleanHashtag = hashtag.replace('#', '');

    const response: any = await this.http.get('/ig_hashtag_search', {
      params: {
        user_id: this.accountId,
        q: cleanHashtag
      }
    });

    if (response.data && response.data.length > 0) {
      return { id: response.data[0].id };
    }

    throw new Error(`Hashtag #${cleanHashtag} not found`);
  }

  /**
   * Get top media for a hashtag
   */
  async getTopMedia(hashtagId: string, limit: number = 50): Promise<HashtagMedia[]> {
    const response: any = await this.http.get(`/${hashtagId}/top_media`, {
      params: {
        user_id: this.accountId,
        fields: 'id,caption,media_type,media_url,permalink,timestamp',
        limit
      }
    });

    return response.data;
  }

  /**
   * Get recent media for a hashtag
   */
  async getRecentMedia(hashtagId: string, limit: number = 50): Promise<HashtagMedia[]> {
    const response: any = await this.http.get(`/${hashtagId}/recent_media`, {
      params: {
        user_id: this.accountId,
        fields: 'id,caption,media_type,media_url,permalink,timestamp',
        limit
      }
    });

    return response.data;
  }

  /**
   * Get hashtag performance
   */
  async getHashtagPerformance(hashtag: string): Promise<{
    topMedia: HashtagMedia[];
    recentMedia: HashtagMedia[];
    totalPosts: number;
  }> {
    const { id } = await this.searchHashtag(hashtag);
    const [topMedia, recentMedia] = await Promise.all([
      this.getTopMedia(id, 10),
      this.getRecentMedia(id, 10)
    ]);

    return {
      topMedia,
      recentMedia,
      totalPosts: topMedia.length + recentMedia.length
    };
  }
}
// ============================================
// packages/instagram/src/engagement/mentions.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { Mention } from '../types';

export class MentionManager {
  constructor(
    private http: HttpClient,
    private accountId: string
  ) {}

  /**
   * Get recent mentions
   */
  async getMentions(limit: number = 50): Promise<Mention[]> {
    const response: any = await this.http.get(`/${this.accountId}/tags`, {
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
        limit
      }
    });

    return response.data;
  }

  /**
   * Get mentions in a specific time period
   */
  async getMentionsByDate(since: Date, until: Date): Promise<Mention[]> {
    const response: any = await this.http.get(`/${this.accountId}/tags`, {
      params: {
        fields: 'id,caption,media_type,timestamp',
        since: Math.floor(since.getTime() / 1000),
        until: Math.floor(until.getTime() / 1000)
      }
    });

    return response.data;
  }

  /**
   * Get mentions count
   */
  async getMentionsCount(): Promise<number> {
    const response: any = await this.http.get(`/${this.accountId}/tags`, {
      params: {
        fields: 'id',
        limit: 1
      }
    });

    return response.summary?.total_count || 0;
  }
}
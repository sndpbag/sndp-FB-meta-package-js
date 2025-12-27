// ============================================
// packages/instagram/src/media/reels.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { ReelOptions, MediaContainer, MediaPublishResponse } from '../types';

export class ReelMedia {
  constructor(
    private http: HttpClient,
    private accountId: string
  ) {}

  /**
   * Publish a reel
   */
  async publish(options: ReelOptions): Promise<MediaPublishResponse> {
    // Step 1: Create container
    const containerParams: any = {
      media_type: 'REELS',
      video_url: options.videoUrl,
      caption: options.caption,
      share_to_feed: options.shareToFeed !== false
    };

    if (options.coverUrl) {
      containerParams.cover_url = options.coverUrl;
    }

    if (options.collaborators && options.collaborators.length > 0) {
      containerParams.collaborators = options.collaborators;
    }

    const container = await this.http.post<MediaContainer>(
      `/${this.accountId}/media`,
      containerParams
    );

    // Step 2: Wait for processing
    await this.waitForContainer(container.id);

    // Step 3: Publish
    return this.http.post(`/${this.accountId}/media_publish`, {
      creation_id: container.id
    });
  }

  /**
   * Get reel insights
   */
  async getInsights(reelId: string): Promise<any> {
    return this.http.get(`/${reelId}/insights`, {
      params: {
        metric: 'plays,reach,total_interactions,likes,comments,saves,shares'
      }
    });
  }

  private async waitForContainer(containerId: string, maxAttempts: number = 60): Promise<void> {
    // Reels take longer to process
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.http.get<MediaContainer>(`/${containerId}`, {
        params: { fields: 'status,status_code' }
      });

      if (status.status === 'FINISHED') {
        return;
      }

      if (status.status === 'ERROR') {
        throw new Error(`Reel processing failed: ${status.status_code}`);
      }

      // Wait 3 seconds (reels take longer)
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    throw new Error('Reel processing timeout');
  }
}
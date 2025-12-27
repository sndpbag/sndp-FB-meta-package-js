// ============================================
// packages/instagram/src/media/feed.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { FeedPostOptions, MediaContainer, MediaPublishResponse } from '../types';

export class FeedMedia {
  constructor(
    private http: HttpClient,
    private accountId: string
  ) {}

  /**
   * Publish a single image post
   */
  async publishImage(options: FeedPostOptions): Promise<MediaPublishResponse> {
    // Step 1: Create container
    const containerParams: any = {
      image_url: options.imageUrl,
      caption: options.caption
    };

    if (options.location) {
      containerParams.location_id = options.location;
    }

    if (options.userTags && options.userTags.length > 0) {
      containerParams.user_tags = JSON.stringify(options.userTags);
    }

    const container = await this.http.post<MediaContainer>(
      `/${this.accountId}/media`,
      containerParams
    );

    // Step 2: Wait for container to be ready
    await this.waitForContainer(container.id);

    // Step 3: Publish container
    return this.publishContainer(container.id);
  }

  /**
   * Publish a video post
   */
  async publishVideo(
    videoUrl: string,
    caption?: string,
    coverUrl?: string
  ): Promise<MediaPublishResponse> {
    const containerParams: any = {
      media_type: 'VIDEO',
      video_url: videoUrl,
      caption
    };

    if (coverUrl) {
      containerParams.thumb_offset = 0; // Use first frame or specify milliseconds
    }

    const container = await this.http.post<MediaContainer>(
      `/${this.accountId}/media`,
      containerParams
    );

    await this.waitForContainer(container.id);
    return this.publishContainer(container.id);
  }

  /**
   * Update post caption
   */
  async updateCaption(mediaId: string, caption: string): Promise<{ success: boolean }> {
    return this.http.post(`/${mediaId}`, {
      caption
    });
  }

  /**
   * Enable/disable comments
   */
  async setCommentsEnabled(mediaId: string, enabled: boolean): Promise<{ success: boolean }> {
    return this.http.post(`/${mediaId}`, {
      comment_enabled: enabled
    });
  }

  private async waitForContainer(containerId: string, maxAttempts: number = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.http.get<MediaContainer>(`/${containerId}`, {
        params: { fields: 'status,status_code' }
      });

      if (status.status === 'FINISHED' || status.status === 'PUBLISHED') {
        return;
      }

      if (status.status === 'ERROR') {
        throw new Error(`Container creation failed: ${status.status_code}`);
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Container creation timeout');
  }

  private async publishContainer(containerId: string): Promise<MediaPublishResponse> {
    return this.http.post(`/${this.accountId}/media_publish`, {
      creation_id: containerId
    });
  }
}

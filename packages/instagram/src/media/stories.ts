// ============================================
// packages/instagram/src/media/stories.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { StoryOptions, MediaPublishResponse } from '../types';

export class StoryMedia {
  constructor(
    private http: HttpClient,
    private accountId: string
  ) {}

  /**
   * Publish an image story
   */
  async publishImage(imageUrl: string, options?: Partial<StoryOptions>): Promise<MediaPublishResponse> {
    const params: any = {
      media_type: 'STORIES',
      image_url: imageUrl
    };

    if (options?.caption) {
      params.caption = options.caption;
    }

    return this.http.post(`/${this.accountId}/media`, params);
  }

  /**
   * Publish a video story
   */
  async publishVideo(videoUrl: string, options?: Partial<StoryOptions>): Promise<MediaPublishResponse> {
    const params: any = {
      media_type: 'STORIES',
      video_url: videoUrl
    };

    if (options?.caption) {
      params.caption = options.caption;
    }

    return this.http.post(`/${this.accountId}/media`, params);
  }

  /**
   * Get story insights
   */
  async getInsights(storyId: string): Promise<any> {
    return this.http.get(`/${storyId}/insights`, {
      params: {
        metric: 'impressions,reach,replies,taps_forward,taps_back,exits'
      }
    });
  }
}
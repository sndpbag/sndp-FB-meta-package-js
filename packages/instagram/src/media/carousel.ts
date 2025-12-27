// ============================================
// packages/instagram/src/media/carousel.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { CarouselOptions, MediaContainer, MediaPublishResponse } from '../types';

export class CarouselMedia {
  constructor(
    private http: HttpClient,
    private accountId: string
  ) {}

  /**
   * Publish a carousel post (multiple images/videos)
   */
  async publish(options: CarouselOptions): Promise<MediaPublishResponse> {
    if (options.items.length < 2 || options.items.length > 10) {
      throw new Error('Carousel must have between 2 and 10 items');
    }

    // Step 1: Create item containers
    const itemContainers: string[] = [];

    for (const item of options.items) {
      const itemParams: any = {
        is_carousel_item: true
      };

      if (item.isVideo) {
        itemParams.media_type = 'VIDEO';
        itemParams.video_url = item.videoUrl;
      } else {
        itemParams.image_url = item.imageUrl;
      }

      const container = await this.http.post<MediaContainer>(
        `/${this.accountId}/media`,
        itemParams
      );

      itemContainers.push(container.id);
    }

    // Step 2: Wait for all items to be ready
    await Promise.all(
      itemContainers.map(id => this.waitForContainer(id))
    );

    // Step 3: Create carousel container
    const carouselParams: any = {
      media_type: 'CAROUSEL',
      children: itemContainers.join(','),
      caption: options.caption
    };

    if (options.location) {
      carouselParams.location_id = options.location;
    }

    const carouselContainer = await this.http.post<MediaContainer>(
      `/${this.accountId}/media`,
      carouselParams
    );

    // Step 4: Publish carousel
    return this.http.post(`/${this.accountId}/media_publish`, {
      creation_id: carouselContainer.id
    });
  }

  private async waitForContainer(containerId: string, maxAttempts: number = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.http.get<MediaContainer>(`/${containerId}`, {
        params: { fields: 'status,status_code' }
      });

      if (status.status === 'FINISHED') {
        return;
      }

      if (status.status === 'ERROR') {
        throw new Error(`Item processing failed: ${status.status_code}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Item processing timeout');
  }
}
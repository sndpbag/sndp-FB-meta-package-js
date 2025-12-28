
// ============================================
// packages/pages/src/posts/index.ts
// ============================================
export * from './manager';

// ============================================
// packages/pages/src/posts/manager.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { 
  Post, 
  PostOptions, 
  PhotoPostOptions, 
  VideoPostOptions, 
  LinkPostOptions 
} from '../types';

export class PostManager {
  constructor(private http: HttpClient) {}

  /**
   * Publish a text post
   */
  async publishText(pageId: string, message: string, options?: Partial<PostOptions>): Promise<{ id: string }> {
    return this.http.post(`/${pageId}/feed`, {
      message,
      published: options?.published !== false,
      ...(options?.scheduled_publish_time && {
        published: false,
        scheduled_publish_time: options.scheduled_publish_time
      })
    });
  }

  /**
   * Publish a link post
   */
  async publishLink(pageId: string, linkOptions: LinkPostOptions): Promise<{ id: string }> {
    return this.http.post(`/${pageId}/feed`, {
      link: linkOptions.link,
      message: linkOptions.message,
      published: linkOptions.published !== false
    });
  }

  /**
   * Publish a photo
   */
  async publishPhoto(pageId: string, photoOptions: PhotoPostOptions): Promise<{ id: string; post_id: string }> {
    return this.http.post(`/${pageId}/photos`, {
      url: photoOptions.url,
      caption: photoOptions.caption,
      published: photoOptions.published !== false,
      ...(photoOptions.scheduled_publish_time && {
        published: false,
        scheduled_publish_time: photoOptions.scheduled_publish_time
      })
    });
  }

  /**
   * Publish a video
   */
  async publishVideo(pageId: string, videoOptions: VideoPostOptions): Promise<{ id: string }> {
    const params: any = {
      description: videoOptions.description,
      title: videoOptions.title,
      published: videoOptions.published !== false
    };

    if (videoOptions.url) {
      params.file_url = videoOptions.url;
    } else if (videoOptions.fileUrl) {
      params.file_url = videoOptions.fileUrl;
    }

    if (videoOptions.scheduled_publish_time) {
      params.published = false;
      params.scheduled_publish_time = videoOptions.scheduled_publish_time;
    }

    return this.http.post(`/${pageId}/videos`, params);
  }

  /**
   * Get posts from a page
   */
  async getPosts(pageId: string, limit: number = 25): Promise<Post[]> {
    const response: any = await this.http.get(`/${pageId}/posts`, {
      params: {
        fields: 'id,message,story,created_time,permalink_url,full_picture,type,is_published,scheduled_publish_time,likes.summary(true),comments.summary(true),shares',
        limit
      }
    });

    return response.data;
  }

  /**
   * Get single post
   */
  async getPost(postId: string): Promise<Post> {
    return this.http.get(`/${postId}`, {
      params: {
        fields: 'id,message,story,created_time,permalink_url,full_picture,type,is_published,likes.summary(true),comments.summary(true),shares'
      }
    });
  }

  /**
   * Update post
   */
  async updatePost(postId: string, message: string): Promise<{ success: boolean }> {
    return this.http.post(`/${postId}`, {
      message
    });
  }

  /**
   * Delete post
   */
  async deletePost(postId: string): Promise<{ success: boolean }> {
    return this.http.delete(`/${postId}`);
  }

  /**
   * Get scheduled posts
   */
  async getScheduledPosts(pageId: string): Promise<Post[]> {
    const response: any = await this.http.get(`/${pageId}/scheduled_posts`, {
      params: {
        fields: 'id,message,scheduled_publish_time,from'
      }
    });

    return response.data;
  }

  /**
   * Publish a scheduled post immediately
   */
  async publishScheduledPost(postId: string): Promise<{ success: boolean }> {
    return this.http.post(`/${postId}`, {
      is_published: true
    });
  }

  /**
   * Get published posts
   */
  async getPublishedPosts(pageId: string, limit: number = 25): Promise<Post[]> {
    const response: any = await this.http.get(`/${pageId}/published_posts`, {
      params: {
        fields: 'id,message,created_time,permalink_url,full_picture,likes.summary(true),comments.summary(true),shares',
        limit
      }
    });

    return response.data;
  }

  /**
   * Get post insights
   */
  async getPostInsights(postId: string, metrics: string[] = ['post_impressions', 'post_engaged_users']): Promise<any> {
    return this.http.get(`/${postId}/insights`, {
      params: {
        metric: metrics.join(',')
      }
    });
  }

  /**
   * Promote/Boost a post
   */
  async promotePost(postId: string, options: {
    budget: number;
    duration: number;
    targeting?: any;
  }): Promise<{ id: string }> {
    return this.http.post(`/${postId}/promotions`, {
      budget_rebalance_flag: true,
      currency: 'USD',
      end_time: Math.floor(Date.now() / 1000) + (options.duration * 86400),
      start_time: Math.floor(Date.now() / 1000),
      lifetime_budget: options.budget * 100, // in cents
      ...(options.targeting && { targeting: options.targeting })
    });
  }
}
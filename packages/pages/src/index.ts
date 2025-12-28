// ============================================
// packages/pages/src/index.ts
// ============================================
export * from './client';
export * from './posts';
export * from './comments';
export * from './insights';
export * from './types';

// ============================================
// packages/pages/src/types.ts
// ============================================
export interface PagesConfig {
  accessToken: string;
  version?: string;
}

export interface PageInfo {
  id: string;
  name: string;
  category: string;
  access_token: string;
  tasks?: string[];
  followers_count?: number;
  fan_count?: number;
  link?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface PostOptions {
  message?: string;
  link?: string;
  photo?: string;
  video?: string;
  published?: boolean;
  scheduled_publish_time?: number;
}

export interface PhotoPostOptions {
  url: string;
  caption?: string;
  published?: boolean;
  scheduled_publish_time?: number;
}

export interface VideoPostOptions {
  url?: string;
  fileUrl?: string;
  description?: string;
  title?: string;
  published?: boolean;
  scheduled_publish_time?: number;
}

export interface LinkPostOptions {
  link: string;
  message?: string;
  published?: boolean;
}

export interface Post {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  permalink_url?: string;
  full_picture?: string;
  type?: string;
  is_published?: boolean;
  scheduled_publish_time?: number;
  likes?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

export interface Comment {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  created_time: string;
  like_count: number;
  comment_count?: number;
  can_comment?: boolean;
  can_remove?: boolean;
  can_hide?: boolean;
  is_hidden?: boolean;
}

export interface PageInsight {
  name: string;
  period: string;
  values: Array<{
    value: number;
    end_time: string;
  }>;
  title: string;
  description: string;
  id: string;
}

export interface PageMetrics {
  page_views_total?: number;
  page_fans?: number;
  page_impressions?: number;
  page_engaged_users?: number;
  page_post_engagements?: number;
  page_posts_impressions?: number;
}

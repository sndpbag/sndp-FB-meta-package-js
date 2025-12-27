// ============================================
// packages/instagram/src/types.ts
// ============================================
export interface InstagramConfig {
  accessToken: string;
  accountId: string;
  version?: string;
}

export interface MediaPublishResponse {
  id: string;
}

export interface MediaContainer {
  id: string;
  status: 'IN_PROGRESS' | 'PUBLISHED' | 'ERROR' | 'EXPIRED';
  status_code?: string;
}

export interface FeedPostOptions {
  imageUrl: string;
  caption?: string;
  location?: string;
  userTags?: Array<{
    username: string;
    x: number;
    y: number;
  }>;
  collaborators?: string[];
}

export interface StoryOptions {
  imageUrl?: string;
  videoUrl?: string;
  caption?: string;
}

export interface ReelOptions {
  videoUrl: string;
  caption?: string;
  coverUrl?: string;
  shareToFeed?: boolean;
  collaborators?: string[];
}

export interface CarouselItem {
  imageUrl?: string;
  videoUrl?: string;
  isVideo: boolean;
}

export interface CarouselOptions {
  items: CarouselItem[];
  caption?: string;
  location?: string;
}

export interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  like_count: number;
  from: {
    id: string;
    username: string;
  };
  replies?: {
    data: Comment[];
  };
}

export interface MediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string;
  children?: {
    data: Array<{
      id: string;
      media_type: string;
      media_url: string;
    }>;
  };
}

export interface Mention {
  id: string;
  text: string;
  timestamp: string;
  media_type: 'IMAGE' | 'VIDEO';
  like_count: number;
  comments_count: number;
}

export interface HashtagMedia {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
}

export interface InsightMetrics {
  impressions?: number;
  reach?: number;
  engagement?: number;
  saved?: number;
  video_views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  profile_visits?: number;
  follower_count?: number;
  website_clicks?: number;
}

export interface InsightPeriod {
  day?: InsightMetrics;
  week?: InsightMetrics;
  days_28?: InsightMetrics;
}

export interface MediaInsight {
  id: string;
  name: string;
  period: string;
  values: Array<{
    value: number;
    end_time?: string;
  }>;
  title: string;
  description: string;
}

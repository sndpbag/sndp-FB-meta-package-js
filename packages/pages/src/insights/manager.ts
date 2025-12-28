// ============================================
// packages/pages/src/insights/manager.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { PageInsight, PageMetrics } from '../types';

export class InsightsManager {
  constructor(private http: HttpClient) {}

  /**
   * Get page insights
   */
  async getPageInsights(
    pageId: string,
    metrics: string[],
    period: 'day' | 'week' | 'days_28' = 'day',
    since?: Date,
    until?: Date
  ): Promise<PageInsight[]> {
    const params: any = {
      metric: metrics.join(','),
      period
    };

    if (since) {
      params.since = Math.floor(since.getTime() / 1000);
    }

    if (until) {
      params.until = Math.floor(until.getTime() / 1000);
    }

    const response: any = await this.http.get(`/${pageId}/insights`, {
      params
    });

    return response.data;
  }

  /**
   * Get page views and impressions
   */
  async getPageViewsAndImpressions(
    pageId: string,
    period: 'day' | 'week' | 'days_28' = 'day'
  ): Promise<PageMetrics> {
    const metrics = [
      'page_views_total',
      'page_impressions',
      'page_impressions_unique',
      'page_impressions_paid',
      'page_impressions_organic'
    ];

    const insights = await this.getPageInsights(pageId, metrics, period);
    const result: PageMetrics = {};

    insights.forEach((insight) => {
      const value = insight.values[0]?.value || 0;
      if (insight.name === 'page_views_total') {
        result.page_views_total = value;
      } else if (insight.name === 'page_impressions') {
        result.page_impressions = value;
      }
    });

    return result;
  }

  /**
   * Get page engagement metrics
   */
  async getPageEngagement(
    pageId: string,
    period: 'day' | 'week' | 'days_28' = 'day'
  ): Promise<PageMetrics> {
    const metrics = [
      'page_engaged_users',
      'page_post_engagements',
      'page_consumptions',
      'page_negative_feedback'
    ];

    const insights = await this.getPageInsights(pageId, metrics, period);
    const result: PageMetrics = {};

    insights.forEach((insight) => {
      const value = insight.values[0]?.value || 0;
      if (insight.name === 'page_engaged_users') {
        result.page_engaged_users = value;
      } else if (insight.name === 'page_post_engagements') {
        result.page_post_engagements = value;
      }
    });

    return result;
  }

  /**
   * Get page fans (followers) metrics
   */
  async getPageFans(pageId: string): Promise<{
    total: number;
    newFans: number;
    unfollows: number;
  }> {
    const metrics = [
      'page_fans',
      'page_fan_adds',
      'page_fan_removes'
    ];

    const insights = await this.getPageInsights(pageId, metrics, 'day');
    
    let total = 0;
    let newFans = 0;
    let unfollows = 0;

    insights.forEach((insight) => {
      const value = insight.values[0]?.value || 0;
      if (insight.name === 'page_fans') {
        total = value;
      } else if (insight.name === 'page_fan_adds') {
        newFans = value;
      } else if (insight.name === 'page_fan_removes') {
        unfollows = value;
      }
    });

    return { total, newFans, unfollows };
  }

  /**
   * Get page demographics
   */
  async getPageDemographics(pageId: string): Promise<{
    byCountry?: Record<string, number>;
    byCity?: Record<string, number>;
    byAge?: Record<string, number>;
    byGender?: Record<string, number>;
  }> {
    const metrics = [
      'page_fans_country',
      'page_fans_city',
      'page_fans_gender_age'
    ];

    const insights = await this.getPageInsights(pageId, metrics, 'lifetime');
    const demographics: any = {};

    insights.forEach((insight) => {
      const value = insight.values[0]?.value;
      if (insight.name === 'page_fans_country') {
        demographics.byCountry = value;
      } else if (insight.name === 'page_fans_city') {
        demographics.byCity = value;
      } else if (insight.name === 'page_fans_gender_age') {
        demographics.byAge = value;
      }
    });

    return demographics;
  }

  /**
   * Get post reach and engagement
   */
  async getPostInsights(postId: string): Promise<{
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
  }> {
    const response: any = await this.http.get(`/${postId}/insights`, {
      params: {
        metric: 'post_impressions,post_impressions_unique,post_engaged_users,post_clicks'
      }
    });

    const insights = response.data;
    const result = {
      impressions: 0,
      reach: 0,
      engagement: 0,
      clicks: 0
    };

    insights.forEach((insight: PageInsight) => {
      const value = insight.values[0]?.value || 0;
      if (insight.name === 'post_impressions') {
        result.impressions = value;
      } else if (insight.name === 'post_impressions_unique') {
        result.reach = value;
      } else if (insight.name === 'post_engaged_users') {
        result.engagement = value;
      } else if (insight.name === 'post_clicks') {
        result.clicks = value;
      }
    });

    return result;
  }

  /**
   * Get video insights
   */
  async getVideoInsights(videoId: string): Promise<{
    views: number;
    uniqueViews: number;
    avgTimeWatched: number;
    impressions: number;
  }> {
    const response: any = await this.http.get(`/${videoId}/video_insights`, {
      params: {
        metric: 'total_video_views,total_video_views_unique,total_video_avg_time_watched,total_video_impressions'
      }
    });

    const insights = response.data;
    const result = {
      views: 0,
      uniqueViews: 0,
      avgTimeWatched: 0,
      impressions: 0
    };

    insights.forEach((insight: any) => {
      const value = insight.values[0]?.value || 0;
      if (insight.name === 'total_video_views') {
        result.views = value;
      } else if (insight.name === 'total_video_views_unique') {
        result.uniqueViews = value;
      } else if (insight.name === 'total_video_avg_time_watched') {
        result.avgTimeWatched = value;
      } else if (insight.name === 'total_video_impressions') {
        result.impressions = value;
      }
    });

    return result;
  }

  /**
   * Get comprehensive page report
   */
  async getPageReport(
    pageId: string,
    period: 'day' | 'week' | 'days_28' = 'week'
  ): Promise<{
    overview: PageMetrics;
    engagement: PageMetrics;
    fans: { total: number; newFans: number; unfollows: number };
    demographics: any;
  }> {
    const [overview, engagement, fans, demographics] = await Promise.all([
      this.getPageViewsAndImpressions(pageId, period),
      this.getPageEngagement(pageId, period),
      this.getPageFans(pageId),
      this.getPageDemographics(pageId)
    ]);

    return {
      overview,
      engagement,
      fans,
      demographics
    };
  }
}
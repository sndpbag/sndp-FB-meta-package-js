// ============================================
// packages/instagram/src/insights/analytics.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { InsightMetrics, InsightPeriod, MediaInsight } from '../types';

export class InsightsManager {
  constructor(
    private http: HttpClient,
    private accountId: string
  ) {}

  /**
   * Get account insights
   */
  async getAccountInsights(
    metrics: string[],
    period: 'day' | 'week' | 'days_28' | 'lifetime' = 'day'
  ): Promise<any> {
    return this.http.get(`/${this.accountId}/insights`, {
      params: {
        metric: metrics.join(','),
        period
      }
    });
  }

  /**
   * Get account reach and impressions
   */
  async getReachAndImpressions(period: 'day' | 'week' | 'days_28' = 'day'): Promise<InsightMetrics> {
    const response: any = await this.getAccountInsights(
      ['impressions', 'reach'],
      period
    );

    const metrics: InsightMetrics = {};

    response.data.forEach((item: MediaInsight) => {
      if (item.name === 'impressions') {
        metrics.impressions = item.values[0]?.value || 0;
      } else if (item.name === 'reach') {
        metrics.reach = item.values[0]?.value || 0;
      }
    });

    return metrics;
  }

  /**
   * Get follower insights
   */
  async getFollowerInsights(): Promise<{
    count: number;
    online_followers?: number;
    demographics?: any;
  }> {
    const response: any = await this.getAccountInsights(
      ['follower_count', 'online_followers'],
      'lifetime'
    );

    const insights: any = { count: 0 };

    response.data.forEach((item: MediaInsight) => {
      if (item.name === 'follower_count') {
        insights.count = item.values[0]?.value || 0;
      } else if (item.name === 'online_followers') {
        insights.online_followers = item.values[0]?.value || 0;
      }
    });

    return insights;
  }

  /**
   * Get engagement insights
   */
  async getEngagementInsights(period: 'day' | 'week' | 'days_28' = 'day'): Promise<InsightMetrics> {
    const response: any = await this.getAccountInsights(
      ['profile_views', 'website_clicks', 'email_contacts', 'get_directions_clicks'],
      period
    );

    const metrics: InsightMetrics = {};

    response.data.forEach((item: MediaInsight) => {
      if (item.name === 'profile_views') {
        metrics.profile_visits = item.values[0]?.value || 0;
      } else if (item.name === 'website_clicks') {
        metrics.website_clicks = item.values[0]?.value || 0;
      }
    });

    return metrics;
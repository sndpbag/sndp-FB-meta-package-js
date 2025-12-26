import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { MetaSDKError } from './error';
import { RetryHandler } from './retry';
import { RateLimiter } from './rate-limiter';

export interface HttpClientConfig {
  baseURL?: string;
  accessToken?: string;
  version?: string;
  timeout?: number;
  mock?: boolean;
}

export class HttpClient {
  private client: AxiosInstance;
  private retryHandler: RetryHandler;
  private rateLimiter: RateLimiter;

  constructor(config: HttpClientConfig) {
    const baseURL = config.baseURL || `https://graph.facebook.com/${config.version || 'v18.0'}`;
    
    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.accessToken && { 'Authorization': `Bearer ${config.accessToken}` })
      }
    });

    this.retryHandler = new RetryHandler({
      maxRetries: 3,
      baseDelay: 1000
    });

    this.rateLimiter = new RateLimiter();

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        throw MetaSDKError.fromAxiosError(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.rateLimiter.execute(() =>
      this.retryHandler.execute(async () => {
        const response = await this.client.get<T>(url, config);
        return response.data;
      })
    );
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.rateLimiter.execute(() =>
      this.retryHandler.execute(async () => {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
      })
    );
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.rateLimiter.execute(() =>
      this.retryHandler.execute(async () => {
        const response = await this.client.delete<T>(url, config);
        return response.data;
      })
    );
  }
}
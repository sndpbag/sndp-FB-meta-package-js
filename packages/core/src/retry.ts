export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export class RetryHandler {
  private config: RetryConfig;

  constructor(config: RetryConfig) {
    this.config = {
      maxDelay: 10000,
      ...config
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.maxRetries && this.shouldRetry(error)) {
          const delay = this.calculateDelay(attempt);
          
          if (this.config.onRetry) {
            this.config.onRetry(attempt + 1, lastError);
          }
          
          await this.sleep(delay);
        } else {
          break;
        }
      }
    }
    
    throw lastError!;
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors or rate limits
    return (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.response?.status === 429 ||
      error.response?.status >= 500
    );
  }

  private calculateDelay(attempt: number): number {
    const delay = this.config.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, this.config.maxDelay!);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
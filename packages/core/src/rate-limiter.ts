export class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private requestsPerMinute = 200;
  private requestCount = 0;
  private windowStart = Date.now();

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForSlot();
    return fn();
  }

  private async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      const now = Date.now();
      const windowDuration = 60000; // 1 minute

      // Reset window if needed
      if (now - this.windowStart > windowDuration) {
        this.requestCount = 0;
        this.windowStart = now;
      }

      // If under limit, proceed immediately
      if (this.requestCount < this.requestsPerMinute) {
        this.requestCount++;
        resolve();
      } else {
        // Queue the request
        this.queue.push(resolve);
        this.processQueue();
      }
    });
  }

  private processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const windowDuration = 60000;

      if (now - this.windowStart > windowDuration) {
        this.requestCount = 0;
        this.windowStart = now;
      }

      while (this.queue.length > 0 && this.requestCount < this.requestsPerMinute) {
        const resolve = this.queue.shift()!;
        this.requestCount++;
        resolve();
      }

      if (this.queue.length === 0) {
        clearInterval(checkInterval);
        this.processing = false;
      }
    }, 100);
  }
}
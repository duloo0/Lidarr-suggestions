export interface ThrottleOptions {
  requestsPerSecond: number
}

export class Throttle {
  private lastRequestTime = 0
  private interval: number

  constructor(options: ThrottleOptions) {
    this.interval = 1000 / options.requestsPerSecond
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.interval) {
      await this.delay(this.interval - timeSinceLastRequest)
    }

    this.lastRequestTime = Date.now()
    return fn()
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

let lastFmThrottle: Throttle | null = null

export function getLastFmThrottle(): Throttle {
  if (!lastFmThrottle) {
    lastFmThrottle = new Throttle({ requestsPerSecond: 5 })
  }
  return lastFmThrottle
}

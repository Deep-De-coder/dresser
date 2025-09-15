interface RateLimitConfig {
  requestsPerMinute: number
  burst: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
  burstCount: number
  burstResetTime: number
}

export class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async checkLimit(identifier: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  }> {
    const now = Date.now()
    const entry = this.limits.get(identifier) || {
      count: 0,
      resetTime: now + 60000, // 1 minute
      burstCount: 0,
      burstResetTime: now + 10000 // 10 seconds
    }

    // Check if reset time has passed
    if (now > entry.resetTime) {
      entry.count = 0
      entry.resetTime = now + 60000
    }

    if (now > entry.burstResetTime) {
      entry.burstCount = 0
      entry.burstResetTime = now + 10000
    }

    // Check burst limit first
    if (entry.burstCount >= this.config.burst) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.burstResetTime,
        retryAfter: Math.ceil((entry.burstResetTime - now) / 1000)
      }
    }

    // Check regular limit
    if (entry.count >= this.config.requestsPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }

    // Allow request and increment counters
    entry.count++
    entry.burstCount++
    this.limits.set(identifier, entry)

    return {
      allowed: true,
      remaining: this.config.requestsPerMinute - entry.count,
      resetTime: entry.resetTime
    }
  }

  async resetLimit(identifier: string): Promise<void> {
    this.limits.delete(identifier)
  }

  async getStatus(identifier: string): Promise<{
    requestsUsed: number
    requestsRemaining: number
    burstUsed: number
    burstRemaining: number
    resetTime: number
    burstResetTime: number
  }> {
    const entry = this.limits.get(identifier)
    if (!entry) {
      return {
        requestsUsed: 0,
        requestsRemaining: this.config.requestsPerMinute,
        burstUsed: 0,
        burstRemaining: this.config.burst,
        resetTime: Date.now() + 60000,
        burstResetTime: Date.now() + 10000
      }
    }

    const now = Date.now()
    const requestsRemaining = Math.max(0, this.config.requestsPerMinute - entry.count)
    const burstRemaining = Math.max(0, this.config.burst - entry.burstCount)

    return {
      requestsUsed: entry.count,
      requestsRemaining,
      burstUsed: entry.burstCount,
      burstRemaining,
      resetTime: entry.resetTime,
      burstResetTime: entry.burstResetTime
    }
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [identifier, entry] of this.limits.entries()) {
      if (now > entry.resetTime && now > entry.burstResetTime) {
        this.limits.delete(identifier)
      }
    }
  }
}

// Global rate limiter instance
let globalRateLimiter: RateLimiter | null = null

export function getRateLimiter(): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter({
      requestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
      burst: parseInt(process.env.RATE_LIMIT_BURST || '10')
    })
  }
  return globalRateLimiter
}

// Middleware helper for API routes
export async function withRateLimit(
  identifier: string,
  handler: () => Promise<Response>
): Promise<Response> {
  const rateLimiter = getRateLimiter()
  const limit = await rateLimiter.checkLimit(identifier)

  if (!limit.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: limit.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': limit.retryAfter?.toString() || '60',
          'X-RateLimit-Limit': rateLimiter['config'].requestsPerMinute.toString(),
          'X-RateLimit-Remaining': limit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(limit.resetTime / 1000).toString()
        }
      }
    )
  }

  const response = await handler()
  
  // Add rate limit headers to successful responses
  response.headers.set('X-RateLimit-Limit', rateLimiter['config'].requestsPerMinute.toString())
  response.headers.set('X-RateLimit-Remaining', limit.remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(limit.resetTime / 1000).toString())

  return response
}

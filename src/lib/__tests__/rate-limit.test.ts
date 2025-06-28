import { RateLimiter } from '../rate-limit'

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 500,
    })
  })

  describe('check method', () => {
    it('should allow requests within the limit', async () => {
      const result = await rateLimiter.check(5, 'test-token')
      
      expect(result.success).toBe(true)
      expect(result.limit).toBe(5)
      expect(result.remaining).toBe(4)
      expect(result.reset).toBeDefined()
    })

    it('should block requests exceeding the limit', async () => {
      const token = 'test-token-2'
      const limit = 3

      // Make requests up to the limit
      for (let i = 0; i < limit; i++) {
        const result = await rateLimiter.check(limit, token)
        expect(result.success).toBe(true)
        expect(result.remaining).toBe(limit - i - 1)
      }

      // Next request should fail
      const result = await rateLimiter.check(limit, token)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should track different tokens separately', async () => {
      const token1 = 'user-1'
      const token2 = 'user-2'
      const limit = 2

      // Use up token1's limit
      await rateLimiter.check(limit, token1)
      await rateLimiter.check(limit, token1)

      // token2 should still have its full limit
      const result = await rateLimiter.check(limit, token2)
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(1)
    })
  })

  describe('limit method', () => {
    it('should return rate limit headers', async () => {
      const headers = await rateLimiter.limit(10, 'test-token')
      
      expect(headers['X-RateLimit-Limit']).toBe('10')
      expect(headers['X-RateLimit-Remaining']).toBeDefined()
      expect(headers['X-RateLimit-Reset']).toBeDefined()
    })

    it('should update remaining count in headers', async () => {
      const token = 'test-token-3'
      const limit = 5

      const headers1 = await rateLimiter.limit(limit, token)
      expect(headers1['X-RateLimit-Remaining']).toBe('4')

      const headers2 = await rateLimiter.limit(limit, token)
      expect(headers2['X-RateLimit-Remaining']).toBe('3')
    })
  })

  describe('edge cases', () => {
    it('should handle zero limit', async () => {
      const result = await rateLimiter.check(0, 'test-token')
      expect(result.success).toBe(false)
      expect(result.limit).toBe(0)
      expect(result.remaining).toBe(0)
    })

    it('should handle negative limit as zero', async () => {
      const result = await rateLimiter.check(-5, 'test-token')
      expect(result.success).toBe(false)
      expect(result.limit).toBe(0)
      expect(result.remaining).toBe(0)
    })
  })
}) 
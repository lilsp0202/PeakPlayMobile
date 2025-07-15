import { RateLimiter } from '../rate-limit'
import { NextRequest } from 'next/server'

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter
  let mockRequest: NextRequest

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 500,
    })
    
    mockRequest = new NextRequest('http://localhost:3000/test', {
      method: 'GET',
      headers: { 'x-forwarded-for': '127.0.0.1' },
    })
  })

  describe('basic functionality', () => {
    it('should allow requests under the limit', async () => {
      await expect(rateLimiter.check(mockRequest, 5, 'test-token')).resolves.not.toThrow()
    })

    it('should allow multiple requests under the limit', async () => {
      const limit = 3
      const token = 'test-token'

      for (let i = 0; i < limit; i++) {
        await expect(rateLimiter.check(mockRequest, limit, token)).resolves.not.toThrow()
      }
    })

    it('should reject requests over the limit', async () => {
      const limit = 2
      const token = 'test-token'

      // Use up the limit
      await rateLimiter.check(mockRequest, limit, token)
      await rateLimiter.check(mockRequest, limit, token)

      // This should be rejected
      await expect(rateLimiter.check(mockRequest, limit, token)).rejects.toThrow()
    })
  })

  describe('token isolation', () => {
    it('should isolate limits between different tokens', async () => {
      const limit = 2
      const token1 = 'token1'
      const token2 = 'token2'

      // Use up limit for token1
      await rateLimiter.check(mockRequest, limit, token1)
      await rateLimiter.check(mockRequest, limit, token1)

      // token2 should still work
      await expect(rateLimiter.check(mockRequest, limit, token2)).resolves.not.toThrow()
    })
  })

  describe('configuration options', () => {
    it('should respect custom interval and limit settings', async () => {
      const customLimiter = new RateLimiter({
        interval: 100, // 100ms
        uniqueTokenPerInterval: 100,
      })

      await expect(customLimiter.check(mockRequest, 1, 'test-token')).resolves.not.toThrow()
      await expect(customLimiter.check(mockRequest, 1, 'test-token')).rejects.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle zero limit', async () => {
      await expect(rateLimiter.check(mockRequest, 0, 'test-token')).rejects.toThrow()
    })

    it('should handle negative limit', async () => {
      await expect(rateLimiter.check(mockRequest, -5, 'test-token')).rejects.toThrow()
    })
  })
}) 
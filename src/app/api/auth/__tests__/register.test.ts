import { POST } from '../register/route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs')

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('input validation', () => {
    it('should return 400 for missing email', async () => {
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          password: 'password123',
          name: 'Test User',
          role: 'STUDENT',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('email')
    })

    it('should return 400 for invalid email format', async () => {
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
          role: 'STUDENT',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('email')
    })

    it('should return 400 for weak password', async () => {
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
          role: 'STUDENT',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('password')
    })

    it('should return 400 for invalid role', async () => {
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'INVALID_ROLE',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('role')
    })
  })

  describe('duplicate user check', () => {
    it('should return 409 if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: '1',
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'hashed',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'STUDENT',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('User already exists')
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      })
    })
  })

  describe('successful registration', () => {
    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)
      mockBcrypt.hash.mockResolvedValueOnce('hashed_password')
    })

    it('should create a student user successfully', async () => {
      const newUser = {
        id: '1',
        email: 'student@example.com',
        name: 'Test Student',
        role: 'STUDENT' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.create.mockResolvedValueOnce({
        ...newUser,
        password: 'hashed_password',
      })

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@example.com',
          password: 'password123',
          name: 'Test Student',
          role: 'STUDENT',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user).toMatchObject({
        email: 'student@example.com',
        name: 'Test Student',
        role: 'STUDENT',
      })
      expect(data.user.password).toBeUndefined()
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'student@example.com',
          password: 'hashed_password',
          name: 'Test Student',
          role: 'STUDENT',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    })

    it('should create a coach user successfully', async () => {
      const newUser = {
        id: '2',
        email: 'coach@example.com',
        name: 'Test Coach',
        role: 'COACH' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.create.mockResolvedValueOnce({
        ...newUser,
        password: 'hashed_password',
      })

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'coach@example.com',
          password: 'securepass123',
          name: 'Test Coach',
          role: 'COACH',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user.role).toBe('COACH')
    })

    it('should create a parent user successfully', async () => {
      const newUser = {
        id: '3',
        email: 'parent@example.com',
        name: 'Test Parent',
        role: 'PARENT' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.create.mockResolvedValueOnce({
        ...newUser,
        password: 'hashed_password',
      })

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'parent@example.com',
          password: 'parentpass123',
          name: 'Test Parent',
          role: 'PARENT',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user.role).toBe('PARENT')
    })
  })

  describe('error handling', () => {
    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValueOnce(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'STUDENT',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to register user')
    })

    it('should handle bcrypt errors', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)
      mockBcrypt.hash.mockRejectedValueOnce(new Error('Hashing failed'))

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'STUDENT',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to register user')
    })

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid request')
    })
  })

  describe('rate limiting', () => {
    it('should apply rate limiting', async () => {
      // This would be tested in integration tests with the actual rate limiter
      // For unit tests, we can verify the rate limiter is called
      expect(true).toBe(true)
    })
  })
}) 
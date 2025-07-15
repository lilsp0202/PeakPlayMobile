import { POST } from '../register/route'
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

// Mock the prisma import
jest.mock('../../../../lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    student: {
      create: jest.fn(),
    },
    coach: {
      create: jest.fn(),
    },
  },
}))

// Mock other dependencies
jest.mock('bcryptjs')
jest.mock('../../../../lib/validations')
jest.mock('../../../../lib/rate-limit')

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

// Mock the prisma client
import { prisma } from '../../../../lib/prisma'
const mockPrisma = prisma as jest.Mocked<typeof prisma>

// Mock the validation functions
import { validateRequest, signUpSchema } from '../../../../lib/validations'
const mockValidateRequest = validateRequest as jest.MockedFunction<typeof validateRequest>

// Mock the rate limit function
import { checkRateLimit } from '../../../../lib/rate-limit'
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Setup default mocks
    mockCheckRateLimit.mockResolvedValue(null) // No rate limit
    mockValidateRequest.mockReturnValue({ success: true, data: { email: 'test@example.com', password: 'password123', name: 'Test User', role: 'STUDENT' } })
  })

  describe('basic functionality', () => {
    it('should create a new user successfully', async () => {
      // Mock no existing user
      mockPrisma.user.findFirst.mockResolvedValue(null)
      // Mock password hashing
      mockBcrypt.hash.mockResolvedValue('hashed_password')
      // Mock user creation
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockPrisma.user.create.mockResolvedValue(mockUser)
      mockPrisma.student.create.mockResolvedValue({
        id: '1',
        userId: '1',
        studentName: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'STUDENT',
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('User created successfully')
      expect(data.userId).toBe('1')
      expect(data.role).toBe('STUDENT')
    })

    it('should handle existing user', async () => {
      // Mock existing user
      mockPrisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'STUDENT',
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('already exists')
    })

    it('should handle validation errors', async () => {
      // Mock validation failure
      mockValidateRequest.mockReturnValue({ success: false, error: 'Invalid email format' })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
          role: 'STUDENT',
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid email format')
    })

    it('should handle rate limiting', async () => {
      // Mock rate limit response
      mockCheckRateLimit.mockResolvedValue(NextResponse.json({ error: 'Too many requests' }, { status: 429 }))

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'STUDENT',
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Too many requests')
    })
  })

  describe('error handling', () => {
    it('should handle database errors', async () => {
      mockPrisma.user.findFirst.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'STUDENT',
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Registration failed. Please try again.')
    })
  })
}) 
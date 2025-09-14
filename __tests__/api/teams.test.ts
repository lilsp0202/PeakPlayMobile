import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/teams/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    coach: {
      findUnique: jest.fn()
    },
    student: {
      findUnique: jest.fn()
    },
    team: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn()
    },
    teamMember: {
      createMany: jest.fn()
    }
  }
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

describe('Teams API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/teams', () => {
    it('should create a team with correct member count', async () => {
      // Mock session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-1', email: 'coach@test.com' }
      });

      // Mock coach lookup
      (prisma.coach.findUnique as jest.Mock).mockResolvedValue({
        id: 'coach-1',
        userId: 'user-1',
        name: 'Test Coach'
      });

      // Mock transaction
      const mockTeam = {
        id: 'team-1',
        name: 'Test Team',
        description: 'Test Description',
        coachId: 'coach-1',
        members: [
          { id: 'member-1', studentId: 'student-1', student: { studentName: 'Student 1' } },
          { id: 'member-2', studentId: 'student-2', student: { studentName: 'Student 2' } },
          { id: 'member-3', studentId: 'student-3', student: { studentName: 'Student 3' } }
        ],
        _count: {
          members: 3,
          feedback: 0,
          actions: 0
        }
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          team: {
            create: jest.fn().mockResolvedValue({ id: 'team-1' }),
            findUnique: jest.fn().mockResolvedValue(mockTeam)
          },
          teamMember: {
            createMany: jest.fn()
          }
        };
        return fn(tx);
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Team',
          description: 'Test Description',
          memberIds: ['student-1', 'student-2', 'student-3']
        })
      });

      // Call API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.team).toBeDefined();
      expect(data.team.name).toBe('Test Team');
      expect(data.team._count.members).toBe(3);
      expect(data.team.members).toHaveLength(3);
      
      // Verify cache headers
      expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');
    });

    it('should create an empty team when no members provided', async () => {
      // Mock session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-1', email: 'coach@test.com' }
      });

      // Mock coach lookup
      (prisma.coach.findUnique as jest.Mock).mockResolvedValue({
        id: 'coach-1',
        userId: 'user-1',
        name: 'Test Coach'
      });

      // Mock transaction
      const mockTeam = {
        id: 'team-1',
        name: 'Empty Team',
        description: 'No members',
        coachId: 'coach-1',
        members: [],
        _count: {
          members: 0,
          feedback: 0,
          actions: 0
        }
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          team: {
            create: jest.fn().mockResolvedValue({ id: 'team-1' }),
            findUnique: jest.fn().mockResolvedValue(mockTeam)
          },
          teamMember: {
            createMany: jest.fn()
          }
        };
        return fn(tx);
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Empty Team',
          description: 'No members',
          memberIds: []
        })
      });

      // Call API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.team).toBeDefined();
      expect(data.team.name).toBe('Empty Team');
      expect(data.team._count.members).toBe(0);
      expect(data.team.members).toHaveLength(0);
    });
  });

  describe('GET /api/teams', () => {
    it('should return teams with correct member counts', async () => {
      // Mock session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-1', email: 'coach@test.com' }
      });

      // Mock coach lookup
      (prisma.coach.findUnique as jest.Mock).mockResolvedValue({
        id: 'coach-1',
        userId: 'user-1',
        name: 'Test Coach'
      });

      // Mock student lookup
      (prisma.student.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock teams
      const mockTeams = [
        {
          id: 'team-1',
          name: 'Team A',
          _count: { members: 5, feedback: 10, actions: 3 }
        },
        {
          id: 'team-2',
          name: 'Team B',
          _count: { members: 3, feedback: 5, actions: 2 }
        }
      ];

      (prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/teams?includeStats=true');

      // Call API
      const response = await GET(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.teams).toBeDefined();
      expect(data.teams).toHaveLength(2);
      expect(data.teams[0]._count.members).toBe(5);
      expect(data.teams[1]._count.members).toBe(3);
    });

    it('should bypass cache when skipCache=true', async () => {
      // Mock session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-1', email: 'coach@test.com' }
      });

      // Mock lookups
      (prisma.coach.findUnique as jest.Mock).mockResolvedValue({
        id: 'coach-1',
        userId: 'user-1'
      });
      (prisma.student.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.team.findMany as jest.Mock).mockResolvedValue([]);

      // Create request with skipCache
      const request = new NextRequest('http://localhost:3000/api/teams?skipCache=true');

      // Call API
      const response = await GET(request);

      // Verify cache headers
      expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');
    });
  });
}); 
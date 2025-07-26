import { NextRequest } from 'next/server';
import { POST as uploadOptimized } from '../upload-optimized/route';
import { POST as demoUploadOptimized } from '../demo-upload-optimized/route';
import { GET as mediaRoute } from '../[id]/media/route';
import { FileStorageService } from '../../../../lib/fileStorage';
import { prisma } from '../../../../lib/prisma';

// Mock dependencies
jest.mock('../../../../lib/auth');
jest.mock('../../../../lib/prisma');
jest.mock('../../../../lib/fileStorage');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockFileStorageService = FileStorageService as jest.Mocked<typeof FileStorageService>;

// Mock session for athletes and coaches
const mockAthleteSession = {
  user: {
    id: 'athlete-user-id',
    email: 'athlete@test.com',
    role: 'ATHLETE'
  }
};

const mockCoachSession = {
  user: {
    id: 'coach-user-id',
    email: 'coach@test.com',
    role: 'COACH'
  }
};

// Mock file objects
const createMockFile = (size: number, type: string, name: string): File => {
  const buffer = new ArrayBuffer(size);
  const blob = new Blob([buffer], { type });
  return new File([blob], name, { type });
};

describe('Action Upload Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getServerSession
    const { getServerSession } = require('../../../../lib/auth');
    getServerSession.mockResolvedValue(mockAthleteSession);
    
    // Mock storage info
    mockFileStorageService.getStorageInfo.mockResolvedValue({
      isSupabaseAvailable: true,
      connectionStatus: 'connected',
      recommendedUploadMethod: 'supabase'
    });
  });

  describe('Proof Upload Performance', () => {
    test('should upload small image file under 3 seconds', async () => {
      const startTime = Date.now();
      
      // Mock successful upload
      mockFileStorageService.uploadImage.mockResolvedValue({
        url: 'https://test.supabase.co/image.webp',
        fileName: 'test-image.webp',
        fileSize: 50000,
        mimeType: 'image/webp',
        uploadMethod: 'supabase',
        processingTime: 1500
      });

      // Mock database queries
      mockPrisma.student.findUnique.mockResolvedValue({
        id: 'student-id',
        userId: 'athlete-user-id'
      } as any);

      mockPrisma.action.findFirst.mockResolvedValue({
        id: 'action-id',
        studentId: 'student-id',
        title: 'Test Action'
      } as any);

      mockPrisma.action.update.mockResolvedValue({
        id: 'action-id',
        proofMediaType: 'image',
        proofFileName: 'test-image.webp',
        proofUploadedAt: new Date(),
        proofFileSize: 50000,
        proofUploadMethod: 'supabase'
      } as any);

      // Create test file (1MB image)
      const testFile = createMockFile(1024 * 1024, 'image/jpeg', 'test-image.jpg');
      
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('actionId', 'action-id');

      const request = new NextRequest('http://localhost:3000/api/actions/upload-optimized', {
        method: 'POST',
        body: formData
      });

      const response = await uploadOptimized(request);
      const responseData = await response.json();

      const totalTime = Date.now() - startTime;

      // Performance assertions
      expect(totalTime).toBeLessThan(3000); // Under 3 seconds
      expect(response.status).toBe(200);
      expect(responseData.performance.uploadTime).toBeLessThan(2000);
      expect(responseData.storage.method).toBe('supabase');
    });

    test('should handle large video file with chunked processing', async () => {
      const startTime = Date.now();
      
      // Mock video upload
      mockFileStorageService.uploadFile.mockResolvedValue({
        url: 'https://test.supabase.co/video.mp4',
        fileName: 'test-video.mp4',
        fileSize: 20 * 1024 * 1024, // 20MB
        mimeType: 'video/mp4',
        uploadMethod: 'supabase',
        processingTime: 8000
      });

      // Mock database queries
      mockPrisma.student.findUnique.mockResolvedValue({
        id: 'student-id',
        userId: 'athlete-user-id'
      } as any);

      mockPrisma.action.findFirst.mockResolvedValue({
        id: 'action-id',
        studentId: 'student-id',
        title: 'Test Action'
      } as any);

      mockPrisma.action.update.mockResolvedValue({
        id: 'action-id',
        proofMediaType: 'video',
        proofFileName: 'test-video.mp4',
        proofUploadedAt: new Date(),
        proofFileSize: 20 * 1024 * 1024,
        proofUploadMethod: 'supabase'
      } as any);

      // Create test video file (20MB)
      const testFile = createMockFile(20 * 1024 * 1024, 'video/mp4', 'test-video.mp4');
      
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('actionId', 'action-id');

      const request = new NextRequest('http://localhost:3000/api/actions/upload-optimized', {
        method: 'POST',
        body: formData
      });

      const response = await uploadOptimized(request);
      const responseData = await response.json();

      const totalTime = Date.now() - startTime;

      // Performance assertions for large files
      expect(totalTime).toBeLessThan(15000); // Under 15 seconds for 20MB
      expect(response.status).toBe(200);
      expect(responseData.performance.uploadTime).toBeLessThan(10000);
      expect(responseData.storage.method).toBe('supabase');
      expect(responseData.performance.originalFileSize).toBe(20 * 1024 * 1024);
    });

    test('should reject oversized files with helpful error message', async () => {
      // Mock storage info with lower limits
      mockFileStorageService.getStorageInfo.mockResolvedValue({
        isSupabaseAvailable: false,
        connectionStatus: 'disconnected',
        recommendedUploadMethod: 'optimized_base64'
      });

      // Create oversized file (25MB when limit is 20MB for base64)
      const testFile = createMockFile(25 * 1024 * 1024, 'video/mp4', 'large-video.mp4');
      
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('actionId', 'action-id');

      const request = new NextRequest('http://localhost:3000/api/actions/upload-optimized', {
        method: 'POST',
        body: formData
      });

      const response = await uploadOptimized(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.message).toContain('20MB');
      expect(responseData.suggestions).toBeInstanceOf(Array);
      expect(responseData.storageInfo.recommendedUploadMethod).toBe('optimized_base64');
    });

    test('should provide progress callbacks during upload', async () => {
      let progressCalls: any[] = [];
      
      // Mock FileStorageService to track progress calls
      mockFileStorageService.uploadImage.mockImplementation(async (file, bucket, options) => {
        // Simulate progress callbacks
        if (options?.onProgress) {
          options.onProgress({ loaded: 0, total: 100, percentage: 0, status: 'processing' });
          options.onProgress({ loaded: 50, total: 100, percentage: 50, status: 'uploading' });
          options.onProgress({ loaded: 100, total: 100, percentage: 100, status: 'complete' });
        }
        
        return {
          url: 'https://test.supabase.co/image.webp',
          fileName: 'test-image.webp',
          fileSize: 50000,
          mimeType: 'image/webp',
          uploadMethod: 'supabase',
          processingTime: 1500
        };
      });

      // Mock database queries
      mockPrisma.student.findUnique.mockResolvedValue({
        id: 'student-id',
        userId: 'athlete-user-id'
      } as any);

      mockPrisma.action.findFirst.mockResolvedValue({
        id: 'action-id',
        studentId: 'student-id',
        title: 'Test Action'
      } as any);

      mockPrisma.action.update.mockResolvedValue({
        id: 'action-id'
      } as any);

      const testFile = createMockFile(1024 * 1024, 'image/jpeg', 'test-image.jpg');
      
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('actionId', 'action-id');

      const request = new NextRequest('http://localhost:3000/api/actions/upload-optimized', {
        method: 'POST',
        body: formData
      });

      const response = await uploadOptimized(request);

      expect(response.status).toBe(200);
      expect(mockFileStorageService.uploadImage).toHaveBeenCalledWith(
        expect.any(File),
        'action-proofs',
        expect.objectContaining({
          onProgress: expect.any(Function)
        })
      );
    });
  });

  describe('Demo Upload Performance', () => {
    test('should upload demo video efficiently for coaches', async () => {
      // Mock coach session
      const { getServerSession } = require('../../../../lib/auth');
      getServerSession.mockResolvedValue(mockCoachSession);

      const startTime = Date.now();
      
      mockFileStorageService.uploadFile.mockResolvedValue({
        url: 'https://test.supabase.co/demo-video.mp4',
        fileName: 'demo-video.mp4',
        fileSize: 10 * 1024 * 1024,
        mimeType: 'video/mp4',
        uploadMethod: 'supabase',
        processingTime: 4000
      });

      mockPrisma.coach.findUnique.mockResolvedValue({
        id: 'coach-id',
        userId: 'coach-user-id',
        name: 'Test Coach'
      } as any);

      const testFile = createMockFile(10 * 1024 * 1024, 'video/mp4', 'demo-video.mp4');
      
      const formData = new FormData();
      formData.append('file', testFile);

      const request = new NextRequest('http://localhost:3000/api/actions/demo-upload-optimized', {
        method: 'POST',
        body: formData
      });

      const response = await demoUploadOptimized(request);
      const responseData = await response.json();

      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(10000); // Under 10 seconds
      expect(response.status).toBe(200);
      expect(responseData.performance.uploadTime).toBeLessThan(5000);
      expect(responseData.storage.method).toBe('supabase');
    });
  });

  describe('Media Retrieval Performance', () => {
    test('should retrieve media URLs under 1 second', async () => {
      const startTime = Date.now();

      mockPrisma.action.findUnique.mockResolvedValue({
        id: 'action-id',
        title: 'Test Action',
        demoMediaUrl: 'https://test.supabase.co/demo.mp4',
        demoMediaType: 'video',
        demoFileName: 'demo.mp4',
        demoFileSize: 5 * 1024 * 1024,
        demoUploadMethod: 'supabase',
        demoProcessingTime: 3000,
        proofMediaUrl: null,
        studentId: 'student-id',
        coachId: 'coach-id',
        createdAt: new Date()
      } as any);

      mockPrisma.student.findUnique.mockResolvedValue({
        id: 'student-id',
        name: 'Test Student'
      } as any);

      // Mock signed URL generation
      mockFileStorageService.getSignedUrl.mockResolvedValue(
        'https://test.supabase.co/signed/demo.mp4?token=abc123'
      );

      const request = new NextRequest('http://localhost:3000/api/actions/action-id/media');
      const params = Promise.resolve({ id: 'action-id' });

      const response = await mediaRoute(request, { params });
      const responseData = await response.json();

      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(1000); // Under 1 second
      expect(response.status).toBe(200);
      expect(responseData.performance.totalTime).toBeLessThan(1000);
      expect(responseData.demoMedia.url).toContain('signed');
      
      // Check caching headers
      expect(response.headers.get('Cache-Control')).toContain('max-age=300');
      expect(response.headers.get('ETag')).toContain('action-action-id');
    });

    test('should handle concurrent media requests efficiently', async () => {
      // Mock data for multiple concurrent requests
      mockPrisma.action.findUnique.mockResolvedValue({
        id: 'action-id',
        title: 'Test Action',
        demoMediaUrl: 'https://test.supabase.co/demo.mp4',
        demoMediaType: 'video',
        demoFileName: 'demo.mp4',
        studentId: 'student-id',
        coachId: 'coach-id',
        createdAt: new Date()
      } as any);

      mockPrisma.student.findUnique.mockResolvedValue({
        id: 'student-id',
        name: 'Test Student'
      } as any);

      const startTime = Date.now();
      
      // Create 5 concurrent requests
      const requests = Array.from({ length: 5 }, (_, i) => {
        const request = new NextRequest(`http://localhost:3000/api/actions/action-${i}/media`);
        const params = Promise.resolve({ id: `action-${i}` });
        return mediaRoute(request, { params });
      });

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should complete under 3 seconds total
      expect(totalTime).toBeLessThan(3000);
      
      // All responses should be successful
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling Performance', () => {
    test('should return errors quickly without hanging', async () => {
      const startTime = Date.now();

      // Mock student not found
      mockPrisma.student.findUnique.mockResolvedValue(null);

      const testFile = createMockFile(1024, 'image/jpeg', 'test.jpg');
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('actionId', 'action-id');

      const request = new NextRequest('http://localhost:3000/api/actions/upload-optimized', {
        method: 'POST',
        body: formData
      });

      const response = await uploadOptimized(request);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(2000); // Error responses should be fast
      expect(response.status).toBe(404);
    });

    test('should handle storage service failures gracefully', async () => {
      const startTime = Date.now();

      // Mock storage service failure
      mockFileStorageService.getStorageInfo.mockResolvedValue({
        isSupabaseAvailable: false,
        connectionStatus: 'error',
        recommendedUploadMethod: 'optimized_base64'
      });

      mockFileStorageService.uploadImage.mockRejectedValue(
        new Error('Storage service unavailable')
      );

      // Mock database queries
      mockPrisma.student.findUnique.mockResolvedValue({
        id: 'student-id',
        userId: 'athlete-user-id'
      } as any);

      mockPrisma.action.findFirst.mockResolvedValue({
        id: 'action-id',
        studentId: 'student-id'
      } as any);

      const testFile = createMockFile(1024 * 1024, 'image/jpeg', 'test.jpg');
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('actionId', 'action-id');

      const request = new NextRequest('http://localhost:3000/api/actions/upload-optimized', {
        method: 'POST',
        body: formData
      });

      const response = await uploadOptimized(request);
      const responseData = await response.json();
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(5000); // Should fail fast
      expect(response.status).toBe(400);
      expect(responseData.suggestions).toBeInstanceOf(Array);
      expect(responseData.message).toContain('Storage service');
    });
  });

  describe('Performance Metrics Tracking', () => {
    test('should track and return detailed performance metrics', async () => {
      mockFileStorageService.uploadImage.mockResolvedValue({
        url: 'https://test.supabase.co/image.webp',
        fileName: 'test-image.webp',
        fileSize: 50000,
        mimeType: 'image/webp',
        uploadMethod: 'supabase',
        processingTime: 1500
      });

      mockPrisma.student.findUnique.mockResolvedValue({
        id: 'student-id',
        userId: 'athlete-user-id'
      } as any);

      mockPrisma.action.findFirst.mockResolvedValue({
        id: 'action-id',
        studentId: 'student-id'
      } as any);

      mockPrisma.action.update.mockResolvedValue({
        id: 'action-id'
      } as any);

      const testFile = createMockFile(100000, 'image/jpeg', 'test.jpg');
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('actionId', 'action-id');

      const request = new NextRequest('http://localhost:3000/api/actions/upload-optimized', {
        method: 'POST',
        body: formData
      });

      const response = await uploadOptimized(request);
      const responseData = await response.json();

      // Verify performance metrics are included
      expect(responseData.performance).toBeDefined();
      expect(responseData.performance.totalTime).toBeGreaterThan(0);
      expect(responseData.performance.uploadTime).toBeGreaterThan(0);
      expect(responseData.performance.sessionTime).toBeGreaterThan(0);
      expect(responseData.performance.originalFileSize).toBe(100000);
      expect(responseData.performance.optimizedFileSize).toBe(50000);
      expect(responseData.performance.compressionRatio).toBeGreaterThan(0);
      expect(responseData.performance.uploadMethod).toBe('supabase');
    });
  });
}); 
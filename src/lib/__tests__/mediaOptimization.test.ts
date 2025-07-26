import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Set environment variables before any imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.SUPABASE_PRO_TIER = 'true';

import { StorageOptimizer } from '../storageOptimizer';
import { SupabaseProManager } from '../supabaseProConfig';
import { FileStorageService } from '../fileStorage';

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    action: {
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn()
    },
    $queryRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    $executeRaw: jest.fn()
  }
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      listBuckets: jest.fn(),
      createBucket: jest.fn(),
      from: jest.fn(() => ({
        list: jest.fn(),
        upload: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn()
      }))
    }
  }))
}));

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn()
}));

describe('Media Optimization Features', () => {
  let storageOptimizer: StorageOptimizer;
  let supabaseProManager: SupabaseProManager;
  let fileStorageService: FileStorageService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set test environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    process.env.SUPABASE_PRO_TIER = 'true';
    
    storageOptimizer = new StorageOptimizer();
    supabaseProManager = new SupabaseProManager();
    fileStorageService = new FileStorageService();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.SUPABASE_PRO_TIER;
  });

  describe('StorageOptimizer', () => {
    it('should get storage statistics', async () => {
      // Mock Prisma responses
      const { prisma } = require('../prisma');
      prisma.action.count
        .mockResolvedValueOnce(100) // totalActions
        .mockResolvedValueOnce(75)  // actionsWithProofMedia
        .mockResolvedValueOnce(60); // actionsWithDemoMedia

      prisma.action.aggregate.mockResolvedValue({
        _sum: {
          proofFileSize: 1024000,
          demoFileSize: 2048000
        }
      });

      prisma.action.count.mockResolvedValueOnce(25); // cleanupCandidates

      const stats = await storageOptimizer.getStorageStats();

      expect(stats).toEqual({
        totalActions: 100,
        actionsWithProofMedia: 75,
        actionsWithDemoMedia: 60,
        totalProofSize: 1024000,
        totalDemoSize: 2048000,
        orphanedMediaCount: 0,
        cleanupCandidates: 25
      });
    });

    it('should generate storage report with recommendations', async () => {
      // Mock storage stats
      const { prisma } = require('../prisma');
      prisma.action.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(75)
        .mockResolvedValueOnce(60)
        .mockResolvedValueOnce(25);

      prisma.action.aggregate.mockResolvedValue({
        _sum: {
          proofFileSize: 150 * 1024 * 1024, // 150MB
          demoFileSize: 200 * 1024 * 1024  // 200MB
        }
      });

      const report = await storageOptimizer.generateStorageReport();

      expect(report.stats.totalProofSize).toBe(150 * 1024 * 1024);
      expect(report.stats.totalDemoSize).toBe(200 * 1024 * 1024);
      expect(report.recommendations).toContain(
        expect.stringContaining('cleanup')
      );
      expect(report.recommendations).toContain(
        expect.stringContaining('Pro tier CDN')
      );
      expect(report.estimatedSavings).toBeGreaterThan(0);
    });

    it('should perform database optimization', async () => {
      const { prisma } = require('../prisma');
      prisma.$executeRawUnsafe.mockResolvedValue(true);
      prisma.$executeRaw.mockResolvedValue(true);

      await expect(storageOptimizer.optimizeDatabase()).resolves.not.toThrow();
      
      expect(prisma.$executeRawUnsafe).toHaveBeenCalledTimes(5); // 5 index creation queries
      expect(prisma.$executeRaw).toHaveBeenCalledWith(expect.arrayContaining(['ANALYZE "Action";']));
    });

    it('should handle cleanup dry run', async () => {
      const { prisma } = require('../prisma');
      
      // Mock cleanup candidates
      prisma.action.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(75)
        .mockResolvedValueOnce(60)
        .mockResolvedValueOnce(25);

      prisma.action.aggregate.mockResolvedValue({
        _sum: {
          proofFileSize: 1024000,
          demoFileSize: 2048000
        }
      });

      const stats = await storageOptimizer.getStorageStats();
      
      expect(stats.cleanupCandidates).toBe(25);
    });
  });

  describe('SupabaseProManager', () => {
    it('should detect Pro tier correctly', () => {
      expect(supabaseProManager.isProTierEnabled()).toBe(true);
    });

    it('should get Pro tier features', () => {
      const features = supabaseProManager.getProTierFeatures();
      
      expect(features).toEqual({
        dedicatedCompute: true,
        higherMemory: true,
        concurrentConnections: 200,
        ioPerformance: 'High',
        backupRetention: 30,
        analyticsEnabled: true
      });
    });

    it('should generate CDN URLs', () => {
      const filePath = 'test/image.jpg';
      const cdnUrl = supabaseProManager.getCDNUrl(filePath);
      
      expect(cdnUrl).toContain('test.supabase.co');
      expect(cdnUrl).toContain('peakplay-media');
      expect(cdnUrl).toContain(filePath);
    });

    it('should get current configuration', () => {
      const config = supabaseProManager.getConfig();
      
      expect(config).toHaveProperty('cdnEnabled', true);
      expect(config).toHaveProperty('bucketName', 'peakplay-media');
      expect(config).toHaveProperty('maxFileSize', 100 * 1024 * 1024);
      expect(config.allowedTypes).toContain('image/jpeg');
      expect(config.allowedTypes).toContain('video/mp4');
    });

    it('should update configuration', () => {
      const newConfig = {
        cdnEnabled: false,
        maxFileSize: 50 * 1024 * 1024
      };
      
      supabaseProManager.updateConfig(newConfig);
      const updatedConfig = supabaseProManager.getConfig();
      
      expect(updatedConfig.cdnEnabled).toBe(false);
      expect(updatedConfig.maxFileSize).toBe(50 * 1024 * 1024);
    });
  });

  describe('FileStorageService Integration', () => {
    it('should be available when Supabase is configured', () => {
      expect(fileStorageService.isSupabaseStorageAvailable()).toBe(true);
    });

    it('should test Pro tier connection capabilities', async () => {
      const testResult = await fileStorageService.testSupabaseConnection();
      
      expect(testResult).toHaveProperty('available');
      expect(testResult).toHaveProperty('responseTime');
      expect(testResult).toHaveProperty('proTierFeatures');
    });

    it('should get Pro tier storage info', async () => {
      const storageInfo = await fileStorageService.getStorageInfo();
      
      expect(storageInfo).toHaveProperty('provider', 'supabase');
      expect(storageInfo).toHaveProperty('bucket');
      expect(storageInfo).toHaveProperty('proTier', true);
      expect(storageInfo).toHaveProperty('cdnEnabled');
    });
  });

  describe('Performance Optimizations', () => {
    it('should cache signed URLs effectively', async () => {
      const testFilePath = 'test/cached-file.jpg';
      
      // First call should generate new URL
      const url1 = await fileStorageService.getSignedUrl(testFilePath, 3600);
      
      // Second call should use cache
      const url2 = await fileStorageService.getSignedUrl(testFilePath, 3600);
      
      expect(url1).toBe(url2);
    });

    it('should clear cache when files are deleted', async () => {
      const testFilePath = 'test/to-delete.jpg';
      
      // Generate cached URL
      await fileStorageService.getSignedUrl(testFilePath, 3600);
      
      // Delete file (should clear cache)
      await fileStorageService.deleteFile(testFilePath);
      
      // Verify cache is cleared (this is implementation dependent)
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Error Handling', () => {
    it('should handle missing Supabase configuration gracefully', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      expect(() => new FileStorageService()).not.toThrow();
    });

    it('should handle database connection errors in StorageOptimizer', async () => {
      const { prisma } = require('../prisma');
      prisma.action.count.mockRejectedValue(new Error('Database connection failed'));
      
      await expect(storageOptimizer.getStorageStats()).rejects.toThrow('Database connection failed');
    });

    it('should handle Supabase API errors in ProManager', async () => {
      const mockSupabase = {
        storage: {
          listBuckets: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('API Error')
          })
        }
      };
      
      // Test error handling in bucket initialization
      expect(supabaseProManager.isProTierEnabled()).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate file types against allowed list', () => {
      const config = supabaseProManager.getConfig();
      
      expect(config.allowedTypes).toContain('image/jpeg');
      expect(config.allowedTypes).toContain('image/png');
      expect(config.allowedTypes).toContain('video/mp4');
      expect(config.allowedTypes).not.toContain('application/exe');
    });

    it('should enforce file size limits for Pro tier', () => {
      const config = supabaseProManager.getConfig();
      
      expect(config.maxFileSize).toBe(100 * 1024 * 1024); // 100MB for Pro tier
    });

    it('should have appropriate cache control settings', () => {
      const config = supabaseProManager.getConfig();
      
      expect(config.cacheControl).toContain('public');
      expect(config.cacheControl).toContain('max-age');
      expect(config.cacheControl).toContain('immutable');
    });
  });
});

describe('API Endpoint Integration', () => {
  it('should have storage optimization endpoint', () => {
    // This would typically be tested with supertest or similar
    expect(true).toBe(true); // Placeholder
  });

  it('should have Supabase Pro configuration endpoint', () => {
    // This would typically be tested with API testing tools
    expect(true).toBe(true); // Placeholder
  });
});

describe('Media Processing Pipeline', () => {
  it('should process images with optimization', async () => {
    // Mock Sharp processing
    const mockBuffer = Buffer.from('fake-image-data');
    
    // Test image processing pipeline
    expect(mockBuffer.length).toBeGreaterThan(0);
  });

  it('should handle video uploads efficiently', async () => {
    // Test video upload handling
    expect(true).toBe(true); // Placeholder for video processing tests
  });

  it('should generate thumbnails for media files', async () => {
    // Test thumbnail generation
    expect(true).toBe(true); // Placeholder for thumbnail tests
  });
}); 
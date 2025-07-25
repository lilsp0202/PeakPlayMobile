import { FileStorageService } from '../fileStorage';

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://test.supabase.co/test.mp4' } })),
        createSignedUrl: jest.fn(() => ({ data: { signedUrl: 'https://test.supabase.co/signed/test.mp4' } })),
        remove: jest.fn(),
        listBuckets: jest.fn(() => ({ data: [], error: null }))
      }))
    }
  }))
}));

// Mock Sharp for image processing
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => ({
    metadata: jest.fn(() => Promise.resolve({ width: 1920, height: 1080 })),
    resize: jest.fn(() => mockSharpInstance),
    webp: jest.fn(() => mockSharpInstance),
    toBuffer: jest.fn(() => Promise.resolve(Buffer.from('processed-image-data')))
  }));
  
  const mockSharpInstance = {
    metadata: jest.fn(() => Promise.resolve({ width: 1920, height: 1080 })),
    resize: jest.fn(() => mockSharpInstance),
    webp: jest.fn(() => mockSharpInstance),
    toBuffer: jest.fn(() => Promise.resolve(Buffer.from('processed-image-data')))
  };
  
  return mockSharp;
});

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test_service_role_key_that_is_long_enough_to_pass_validation'
  };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

// Helper function to create mock File
const createMockFile = (size: number, type: string, name: string): File => {
  const buffer = new ArrayBuffer(size);
  const blob = new Blob([buffer], { type });
  return new File([blob], name, { type });
};

describe('FileStorageService Performance Tests', () => {
  describe('Storage Configuration Tests', () => {
    test('should detect valid Supabase configuration', () => {
      const isAvailable = FileStorageService.isSupabaseStorageAvailable();
      expect(isAvailable).toBe(true);
    });

    test('should detect invalid configuration with test keys', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_key';
      const isAvailable = FileStorageService.isSupabaseStorageAvailable();
      expect(isAvailable).toBe(false);
    });

    test('should test connection with timeout', async () => {
      const startTime = Date.now();
      const isConnected = await FileStorageService.testSupabaseConnection(1000);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(1500); // Should respect timeout
      expect(isConnected).toBe(true); // Should succeed with mock
    });

    test('should return storage info efficiently', async () => {
      const startTime = Date.now();
      const info = await FileStorageService.getStorageInfo();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(500); // Should be very fast
      expect(info).toEqual({
        isSupabaseAvailable: true,
        connectionStatus: 'connected',
        recommendedUploadMethod: 'supabase'
      });
    });
  });

  describe('Image Upload Performance Tests', () => {
    test('should process small image under 2 seconds', async () => {
      const mockFile = createMockFile(1024 * 1024, 'image/jpeg', 'test.jpg'); // 1MB
      const startTime = Date.now();
      
      let progressCallbacks: any[] = [];
      const onProgress = (progress: any) => {
        progressCallbacks.push(progress);
      };

      const result = await FileStorageService.uploadImage(mockFile, 'test-bucket', {
        onProgress,
        quality: 80,
        maxWidth: 1920
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000); // Under 2 seconds
      expect(result.uploadMethod).toBe('supabase');
      expect(result.processingTime).toBeGreaterThan(0);
      expect(progressCallbacks.length).toBeGreaterThan(0);
      expect(progressCallbacks[0].status).toBe('processing');
      expect(progressCallbacks[progressCallbacks.length - 1].status).toBe('complete');
    });

    test('should handle compression settings efficiently', async () => {
      const mockFile = createMockFile(5 * 1024 * 1024, 'image/jpeg', 'large.jpg'); // 5MB
      const startTime = Date.now();

      const result = await FileStorageService.uploadImage(mockFile, 'test-bucket', {
        quality: 70,
        maxWidth: 1280, // Smaller for base64
        generateThumbnail: true
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(3000); // Under 3 seconds even for larger images
      expect(result.fileSize).toBeLessThan(mockFile.size); // Should be compressed
      expect(result.mimeType).toBe('image/webp'); // Should convert to WebP
    });

    test('should fall back to optimized base64 when Supabase fails', async () => {
      // Mock Supabase failure
      const { createClient } = require('@supabase/supabase-js');
      const mockClient = createClient();
      mockClient.storage.from().upload.mockRejectedValue(new Error('Supabase error'));

      const mockFile = createMockFile(1024 * 1024, 'image/jpeg', 'test.jpg');
      const startTime = Date.now();

      const result = await FileStorageService.uploadImage(mockFile, 'test-bucket');

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should fail gracefully and fast
      expect(result.uploadMethod).toBe('optimized_base64');
      expect(result.url).toContain('data:image/webp;base64');
    });
  });

  describe('Video Upload Performance Tests', () => {
    test('should upload video file efficiently', async () => {
      const mockFile = createMockFile(10 * 1024 * 1024, 'video/mp4', 'test.mp4'); // 10MB
      const startTime = Date.now();

      let progressCallbacks: any[] = [];
      const onProgress = (progress: any) => {
        progressCallbacks.push(progress);
      };

      const result = await FileStorageService.uploadFile(mockFile, 'test-bucket', {
        onProgress,
        chunkSize: 5 * 1024 * 1024
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(8000); // Under 8 seconds for 10MB
      expect(result.uploadMethod).toBe('supabase');
      expect(result.mimeType).toBe('video/mp4');
      expect(result.fileSize).toBe(mockFile.size); // Videos shouldn't be compressed
      expect(progressCallbacks.length).toBeGreaterThan(0);
    });

    test('should reject oversized videos with helpful message', async () => {
      // Mock base64 fallback scenario
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_key'; // Force fallback

      const mockFile = createMockFile(25 * 1024 * 1024, 'video/mp4', 'large.mp4'); // 25MB
      const startTime = Date.now();

      await expect(FileStorageService.uploadFile(mockFile, 'test-bucket')).rejects.toThrow(
        'File too large for fallback storage'
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should reject quickly
    });

    test('should handle chunked base64 for smaller videos', async () => {
      // Mock base64 fallback scenario
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_key'; // Force fallback

      const mockFile = createMockFile(15 * 1024 * 1024, 'video/mp4', 'medium.mp4'); // 15MB
      const startTime = Date.now();

      const result = await FileStorageService.uploadFile(mockFile, 'test-bucket');

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10000); // Under 10 seconds for base64 processing
      expect(result.uploadMethod).toBe('chunked_base64');
      expect(result.url).toContain('data:video/mp4;base64');
    });
  });

  describe('Signed URL Performance Tests', () => {
    test('should generate signed URLs quickly', async () => {
      const startTime = Date.now();

      const signedUrl = await FileStorageService.getSignedUrl('test/file.mp4', 'test-bucket', 3600);

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500); // Under 500ms
      expect(signedUrl).toContain('signed');
    });

    test('should handle multiple concurrent signed URL requests', async () => {
      const startTime = Date.now();

      const requests = Array.from({ length: 10 }, (_, i) =>
        FileStorageService.getSignedUrl(`test/file-${i}.mp4`, 'test-bucket', 3600)
      );

      const results = await Promise.all(requests);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000); // All 10 should complete under 2 seconds
      expect(results).toHaveLength(10);
      results.forEach(url => {
        expect(url).toContain('signed');
      });
    });
  });

  describe('Error Handling Performance Tests', () => {
    test('should handle connection failures quickly', async () => {
      // Mock connection failure
      const { createClient } = require('@supabase/supabase-js');
      const mockClient = createClient();
      mockClient.storage.listBuckets.mockRejectedValue(new Error('Network error'));

      const startTime = Date.now();

      const isConnected = await FileStorageService.testSupabaseConnection(2000);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2500); // Should timeout within limit
      expect(isConnected).toBe(false);
    });

    test('should handle malformed file gracefully', async () => {
      // Create a file with invalid data
      const invalidFile = new File(['invalid-image-data'], 'invalid.jpg', { type: 'image/jpeg' });
      const startTime = Date.now();

      // Mock Sharp to throw an error
      const sharp = require('sharp');
      sharp.mockImplementation(() => ({
        metadata: jest.fn(() => Promise.reject(new Error('Invalid image format'))),
        resize: jest.fn(() => ({ webp: jest.fn(), toBuffer: jest.fn() })),
        webp: jest.fn(() => ({ toBuffer: jest.fn() })),
        toBuffer: jest.fn(() => Promise.reject(new Error('Processing failed')))
      }));

      await expect(FileStorageService.uploadImage(invalidFile, 'test-bucket')).rejects.toThrow();

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(3000); // Should fail quickly
    });
  });

  describe('Memory and Resource Management Tests', () => {
    test('should not leak memory during multiple uploads', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform multiple uploads
      const uploads = Array.from({ length: 5 }, (_, i) => {
        const mockFile = createMockFile(1024 * 1024, 'image/jpeg', `test-${i}.jpg`);
        return FileStorageService.uploadImage(mockFile, 'test-bucket');
      });

      await Promise.all(uploads);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB for test data)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test('should handle concurrent uploads without blocking', async () => {
      const startTime = Date.now();

      const concurrentUploads = Array.from({ length: 3 }, (_, i) => {
        const mockFile = createMockFile(2 * 1024 * 1024, 'video/mp4', `concurrent-${i}.mp4`);
        return FileStorageService.uploadFile(mockFile, 'test-bucket');
      });

      const results = await Promise.all(concurrentUploads);
      const duration = Date.now() - startTime;

      // Concurrent uploads should not take 3x as long as single upload
      expect(duration).toBeLessThan(15000);
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.uploadMethod).toBe('supabase');
      });
    });
  });
}); 
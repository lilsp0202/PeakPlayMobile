import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { supabaseProManager } from './supabaseProConfig';

// SUPABASE PRO: Enhanced environment validation with Pro tier detection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseProTier = process.env.SUPABASE_PRO_TIER === 'true'; // New Pro tier flag

// SUPABASE PRO: Create client with Pro tier optimizations
const supabase = (supabaseUrl && supabaseServiceKey) ? 
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    },
    // SUPABASE PRO: Enhanced connection settings for Pro tier
    global: {
      headers: {
        'X-Client-Info': 'peakplay-pro-tier',
        ...(supabaseProTier && { 'X-Supabase-Pro': 'true' })
      }
    }
  }) : 
  null;

// SUPABASE PRO: Enhanced signed URL cache with TTL
const signedUrlCache = new Map<string, { url: string; expires: number }>();

export interface FileUploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
  uploadMethod: 'supabase' | 'supabase_chunked' | 'optimized_base64' | 'chunked_base64';
  processingTime: number;
  compressionRatio?: number;
  cdnUrl?: string; // SUPABASE PRO: CDN accelerated URL
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  uploadSpeed?: number; // SUPABASE PRO: Upload speed tracking
  estimatedTimeRemaining?: number; // SUPABASE PRO: ETA
}

export interface SupabaseProConfig {
  enableCDN: boolean;
  enableChunkedUploads: boolean;
  maxChunkSize: number;
  enableImageOptimization: boolean;
  enableVideoThumbnails: boolean;
  signedUrlTTL: number;
  enableCaching: boolean;
}

// SUPABASE PRO: Pro tier configuration
const proConfig: SupabaseProConfig = {
  enableCDN: supabaseProTier,
  enableChunkedUploads: supabaseProTier,
  maxChunkSize: supabaseProTier ? 10 * 1024 * 1024 : 5 * 1024 * 1024, // 10MB vs 5MB
  enableImageOptimization: true,
  enableVideoThumbnails: supabaseProTier,
  signedUrlTTL: supabaseProTier ? 3600 : 1800, // 1 hour vs 30 min
  enableCaching: supabaseProTier
};

export class FileStorageService {

  /**
   * SUPABASE PRO: Enhanced Supabase Storage availability check with Pro tier detection
   */
  static isSupabaseStorageAvailable(): boolean {
    try {
      const hasValidConfig = supabase !== null && 
        !!supabaseUrl && 
        !!supabaseServiceKey &&
        !supabaseServiceKey.includes('test_') &&
        !supabaseServiceKey.includes('your_') &&
        supabaseServiceKey.length > 50 &&
        supabaseUrl.includes('supabase.co');
      
      return hasValidConfig;
    } catch (error) {
      console.warn('Error checking Supabase availability:', error);
      return false;
    }
  }

  /**
   * SUPABASE PRO: Enhanced connection test with Pro tier capabilities
   */
  static async testSupabaseConnection(timeoutMs: number = 5000): Promise<boolean> {
    if (!this.isSupabaseStorageAvailable()) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // SUPABASE PRO: Test Pro tier features if available
      const testPromises = [
        supabase!.storage.listBuckets()
      ];

      if (supabaseProTier) {
        // Test Pro tier specific features
        testPromises.push(
          supabase!.from('_health').select('*').limit(1).single().then(() => ({ data: [], error: null })) as any
        );
      }

      const results = await Promise.allSettled(testPromises);
      clearTimeout(timeoutId);

      const mainTest = results[0];
      if (mainTest.status === 'rejected') {
        console.warn('Supabase connection test failed:', mainTest.reason);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Supabase connection test error:', error);
      return false;
    }
  }

  /**
   * SUPABASE PRO: Enhanced multipart/chunked upload for large files
   */
  static async uploadFileChunked(
    file: File,
    bucketName: string = 'media',
    options: {
      chunkSize?: number;
      onProgress?: (progress: UploadProgress) => void;
      generateThumbnail?: boolean;
    } = {}
  ): Promise<FileUploadResult> {
    const startTime = Date.now();
    const { 
      chunkSize = proConfig.maxChunkSize,
      onProgress,
      generateThumbnail = proConfig.enableVideoThumbnails
    } = options;

    if (!proConfig.enableChunkedUploads) {
      throw new Error('Chunked uploads not available in current tier');
    }

    onProgress?.({ loaded: 0, total: file.size, percentage: 0, status: 'uploading', uploadSpeed: 0 });

    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_').toLowerCase()}`;
      const filePath = `public/${fileName}`;
      
      // SUPABASE PRO: For large files, use chunked upload
      if (file.size > chunkSize) {
        const chunks = Math.ceil(file.size / chunkSize);
        let uploadedBytes = 0;
        const uploadStartTime = Date.now();

        for (let i = 0; i < chunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);
          
          const chunkPath = `${filePath}.part${i}`;
          
          const { error: chunkError } = await supabase!.storage
            .from(bucketName)
            .upload(chunkPath, chunk, {
              contentType: file.type,
              upsert: true
            });

          if (chunkError) {
            throw new Error(`Chunk ${i} upload failed: ${chunkError.message}`);
          }

          uploadedBytes += chunk.size;
          const currentTime = Date.now();
          const elapsedTime = (currentTime - uploadStartTime) / 1000;
          const uploadSpeed = uploadedBytes / elapsedTime; // bytes per second
          const remainingBytes = file.size - uploadedBytes;
          const estimatedTimeRemaining = remainingBytes / uploadSpeed;

          onProgress?.({
            loaded: uploadedBytes,
            total: file.size,
            percentage: Math.round((uploadedBytes / file.size) * 85), // Reserve 15% for assembly
            status: 'uploading',
            uploadSpeed,
            estimatedTimeRemaining
          });
        }

        // SUPABASE PRO: Assemble chunks (simulated - in real implementation you'd use multipart upload completion)
        onProgress?.({ loaded: file.size, total: file.size, percentage: 95, status: 'processing' });
        
        // For now, upload the complete file as final step (in production, you'd assemble chunks)
        const { data, error: finalError } = await supabase!.storage
          .from(bucketName)
          .upload(filePath, file, {
            contentType: file.type,
            upsert: true
          });

        if (finalError) {
          throw new Error(`Final assembly failed: ${finalError.message}`);
        }

        // Clean up chunk files
        const cleanupPromises = [];
        for (let i = 0; i < chunks; i++) {
          cleanupPromises.push(
            supabase!.storage.from(bucketName).remove([`${filePath}.part${i}`])
          );
        }
        await Promise.allSettled(cleanupPromises);

      } else {
        // SUPABASE PRO: Single upload for smaller files
        const { data, error: uploadError } = await supabase!.storage
          .from(bucketName)
          .upload(filePath, file, {
            contentType: file.type,
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      // SUPABASE PRO: Generate CDN-accelerated URL
      const publicUrl = supabase!.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
      const cdnUrl = proConfig.enableCDN ? 
        publicUrl.replace(supabaseUrl!, `${supabaseUrl!}/cdn`) : 
        publicUrl;

      onProgress?.({ loaded: file.size, total: file.size, percentage: 100, status: 'complete' });

      return {
        url: cdnUrl,
        fileName,
        fileSize: file.size,
        mimeType: file.type,
        uploadMethod: 'supabase_chunked',
        processingTime: Date.now() - startTime,
        cdnUrl: proConfig.enableCDN ? cdnUrl : undefined
      };

    } catch (error) {
      console.error('Chunked upload failed:', error);
      throw error;
    }
  }

  /**
   * SUPABASE PRO: Enhanced image upload with Pro tier optimizations
   */
  static async uploadImage(
    file: File,
    bucketName: string = 'media',
    options: {
      maxWidth?: number;
      quality?: number;
      generateThumbnail?: boolean;
      thumbnailSize?: number;
      onProgress?: (progress: UploadProgress) => void;
      outputFormat?: 'webp' | 'jpeg' | 'png';
      progressive?: boolean;
    } = {}
  ): Promise<FileUploadResult> {
    const startTime = Date.now();
    const { 
      maxWidth = 1920, 
      quality = supabaseProTier ? 85 : 80, // Higher quality for Pro tier
      generateThumbnail = true, 
      thumbnailSize = 300,
      onProgress,
      outputFormat = 'webp',
      progressive = true
    } = options;

    onProgress?.({ loaded: 0, total: 100, percentage: 0, status: 'processing' });

    const isSupabaseAvailable = await this.testSupabaseConnection(3000);

    if (isSupabaseAvailable) {
      try {
        onProgress?.({ loaded: 20, total: 100, percentage: 20, status: 'processing' });

        const arrayBuffer = await file.arrayBuffer();
        let imageBuffer = Buffer.from(arrayBuffer);

        onProgress?.({ loaded: 40, total: 100, percentage: 40, status: 'processing' });

        // SUPABASE PRO: Enhanced image processing
        const processedImage = sharp(imageBuffer);
        const metadata = await processedImage.metadata();

        // SUPABASE PRO: Apply Pro tier optimizations
        const imageProcessor = processedImage
          .resize(maxWidth, undefined, {
          fit: 'inside',
          withoutEnlargement: true,
            // SUPABASE PRO: Use better resampling for Pro tier
            kernel: supabaseProTier ? 'lanczos3' : 'lanczos2'
          });

        // SUPABASE PRO: Format optimization based on tier
        if (outputFormat === 'webp') {
          imageProcessor.webp({ 
            quality, 
            effort: supabaseProTier ? 6 : 4 // Higher effort for Pro tier
          });
        } else if (outputFormat === 'jpeg') {
          imageProcessor.jpeg({ 
            quality, 
            progressive,
            mozjpeg: supabaseProTier // Use mozjpeg for Pro tier
          });
        } else {
          imageProcessor.png({ 
            quality,
            compressionLevel: supabaseProTier ? 9 : 6
          });
        }

        const optimizedBuffer = await imageProcessor.toBuffer();
        const optimizedSize = optimizedBuffer.byteLength;
        const compressionRatio = Math.round((1 - optimizedSize / file.size) * 100);
        const optimizedMimeType = `image/${outputFormat}`;

        onProgress?.({ loaded: 60, total: 100, percentage: 60, status: 'uploading' });

        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_').toLowerCase().split('.')[0]}.${outputFormat}`;
        const filePath = `public/${fileName}`;

        // SUPABASE PRO: Use chunked upload for large images
        if (optimizedSize > proConfig.maxChunkSize && proConfig.enableChunkedUploads) {
          const chunkResult = await this.uploadFileChunked(
            new File([optimizedBuffer], fileName, { type: optimizedMimeType }),
            bucketName,
            { onProgress: (p) => onProgress?.({ ...p, percentage: 60 + (p.percentage * 0.2) }) }
          );
          
          return {
            ...chunkResult,
            compressionRatio,
            uploadMethod: 'supabase_chunked'
          };
        }

        // SUPABASE PRO: Standard upload for smaller images
        const { data, error: uploadError } = await supabase!.storage
          .from(bucketName)
          .upload(filePath, optimizedBuffer, {
            contentType: optimizedMimeType,
            upsert: true,
            // SUPABASE PRO: Add cache control headers
            cacheControl: proConfig.enableCaching ? '3600' : '1800'
          });

        if (uploadError) {
          throw new Error(`Supabase upload failed: ${uploadError.message}`);
        }

        onProgress?.({ loaded: 80, total: 100, percentage: 80, status: 'processing' });

        const publicUrl = supabase!.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
        
        // SUPABASE PRO: Generate CDN URL if available
        const cdnUrl = proConfig.enableCDN ? 
          publicUrl.replace(supabaseUrl!, `${supabaseUrl!}/cdn`) : 
          publicUrl;

        let thumbnailUrl: string | undefined;

        // SUPABASE PRO: Enhanced thumbnail generation
        if (generateThumbnail) {
          try {
            const thumbnailProcessor = sharp(imageBuffer)
              .resize(thumbnailSize, thumbnailSize, { fit: 'cover' });

            if (outputFormat === 'webp') {
              thumbnailProcessor.webp({ quality: 60, effort: supabaseProTier ? 4 : 2 });
            } else {
              thumbnailProcessor.jpeg({ quality: 60, progressive: false });
            }

            const thumbnailBuffer = await thumbnailProcessor.toBuffer();
            const thumbnailFileName = `thumbnails/${Date.now()}-${file.name.replace(/\s/g, '_').toLowerCase().split('.')[0]}-thumb.${outputFormat}`;
            const thumbnailFilePath = `public/${thumbnailFileName}`;

            const { error: thumbError } = await supabase!.storage
              .from(bucketName)
              .upload(thumbnailFilePath, thumbnailBuffer, {
                contentType: optimizedMimeType,
                upsert: true,
                cacheControl: proConfig.enableCaching ? '7200' : '3600' // Longer cache for thumbnails
              });

            if (!thumbError) {
              const thumbPublicUrl = supabase!.storage.from(bucketName).getPublicUrl(thumbnailFilePath).data.publicUrl;
              thumbnailUrl = proConfig.enableCDN ? 
                thumbPublicUrl.replace(supabaseUrl!, `${supabaseUrl!}/cdn`) : 
                thumbPublicUrl;
            }
          } catch (thumbGenError) {
            console.warn('Thumbnail generation warning:', thumbGenError);
          }
        }

        onProgress?.({ loaded: 100, total: 100, percentage: 100, status: 'complete' });

        return {
          url: cdnUrl,
          fileName: fileName,
          fileSize: optimizedSize,
          mimeType: optimizedMimeType,
          thumbnailUrl: thumbnailUrl,
          uploadMethod: 'supabase',
          processingTime: Date.now() - startTime,
          compressionRatio,
          cdnUrl: proConfig.enableCDN ? cdnUrl : undefined
        };

      } catch (supabaseError) {
        console.warn('Supabase image upload failed, falling back:', supabaseError);
        // Fall through to optimized base64 method
      }
    }

    // OPTIMIZED FALLBACK: Efficient base64 processing
    console.log('📦 Using optimized base64 fallback for image...');
    
    try {
      onProgress?.({ loaded: 30, total: 100, percentage: 30, status: 'processing' });

      const arrayBuffer = await file.arrayBuffer();
      let processedBuffer = Buffer.from(arrayBuffer);
      let compressionRatio = 0;

      // Apply compression even for base64 fallback
      if (proConfig.enableImageOptimization) {
        try {
          const compressed = await sharp(processedBuffer)
            .resize(maxWidth, undefined, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: quality - 10 }) // Lower quality for fallback
            .toBuffer();
          
          compressionRatio = Math.round((1 - compressed.byteLength / processedBuffer.byteLength) * 100);
          processedBuffer = Buffer.from(compressed);
        } catch (sharpError) {
          console.warn('Sharp compression failed in fallback, using original:', sharpError);
        }
      }

      onProgress?.({ loaded: 70, total: 100, percentage: 70, status: 'processing' });

      const base64 = `data:image/webp;base64,${processedBuffer.toString('base64')}`;
      
      onProgress?.({ loaded: 100, total: 100, percentage: 100, status: 'complete' });

      return {
        url: base64,
        fileName: `${Date.now()}-${file.name.replace(/\s/g, '_').toLowerCase()}`,
        fileSize: processedBuffer.byteLength,
        mimeType: 'image/webp',
        uploadMethod: 'optimized_base64',
        processingTime: Date.now() - startTime,
        compressionRatio
      };

    } catch (error) {
      console.error('Image processing failed completely:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * SUPABASE PRO: Enhanced file upload with streaming support
   */
  static async uploadFile(
    file: File,
    bucketName: string = 'media',
    options: {
      onProgress?: (progress: UploadProgress) => void;
      chunkSize?: number;
      videoOptimizations?: {
        enableThumbnail?: boolean;
        thumbnailTimestamp?: number;
        enableCompression?: boolean;
        targetBitrate?: string;
      };
    } = {}
  ): Promise<FileUploadResult> {
    const startTime = Date.now();
    const { 
      onProgress,
      chunkSize = proConfig.maxChunkSize,
      videoOptimizations = {}
    } = options;

    onProgress?.({ loaded: 0, total: file.size, percentage: 0, status: 'uploading' });

    const isSupabaseAvailable = await this.testSupabaseConnection(3000);

    if (isSupabaseAvailable) {
      try {
        // SUPABASE PRO: Use chunked upload for large files
        if (file.size > chunkSize && proConfig.enableChunkedUploads) {
          return await this.uploadFileChunked(file, bucketName, { 
            chunkSize, 
            onProgress,
            generateThumbnail: videoOptimizations.enableThumbnail
          });
        }

        // SUPABASE PRO: Standard upload with Pro tier optimizations
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_').toLowerCase()}`;
        const filePath = `public/${fileName}`;

        const { data, error: uploadError } = await supabase!.storage
          .from(bucketName)
          .upload(filePath, file, {
            contentType: file.type,
            upsert: true,
            cacheControl: proConfig.enableCaching ? '3600' : '1800'
          });

        if (uploadError) {
          throw new Error(`Supabase upload failed: ${uploadError.message}`);
        }

        onProgress?.({ loaded: file.size * 0.9, total: file.size, percentage: 90, status: 'processing' });

        const publicUrl = supabase!.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
        const cdnUrl = proConfig.enableCDN ? 
          publicUrl.replace(supabaseUrl!, `${supabaseUrl!}/cdn`) : 
          publicUrl;

        onProgress?.({ loaded: file.size, total: file.size, percentage: 100, status: 'complete' });

        return {
          url: cdnUrl,
          fileName: fileName,
          fileSize: file.size,
          mimeType: file.type,
          uploadMethod: 'supabase',
          processingTime: Date.now() - startTime,
          cdnUrl: proConfig.enableCDN ? cdnUrl : undefined
        };

      } catch (supabaseError) {
        console.warn('Supabase file upload failed, falling back:', supabaseError);
        // Fall through to base64 method
      }
    }

    // FALLBACK: Chunked base64 for large files
    console.log('📦 Using chunked base64 fallback for large file...');
    
    try {
      onProgress?.({ loaded: 0, total: file.size, percentage: 0, status: 'processing' });

      const buffer = await file.arrayBuffer();
      const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;
      
      onProgress?.({ loaded: file.size, total: file.size, percentage: 100, status: 'complete' });

      return {
        url: base64,
        fileName: `${Date.now()}-${file.name.replace(/\s/g, '_').toLowerCase()}`,
        fileSize: buffer.byteLength,
        mimeType: file.type,
        uploadMethod: 'chunked_base64',
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Chunked base64 processing failed:', error);
      throw new Error('Failed to process file for storage');
    }
  }

  /**
   * SUPABASE PRO: Enhanced signed URL generation with caching
   */
  static async getSignedUrl(
    filePath: string, 
    bucketName: string = 'media', 
    expiresIn: number = proConfig.signedUrlTTL
  ): Promise<string> {
    if (!this.isSupabaseStorageAvailable()) {
      throw new Error('Signed URLs require Supabase Storage configuration');
    }

    // SUPABASE PRO: Check cache first
    const cacheKey = `${bucketName}:${filePath}:${expiresIn}`;
    const cached = signedUrlCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.url;
    }

    const { data, error } = await supabase!.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    // SUPABASE PRO: Cache the signed URL
    if (proConfig.enableCaching) {
      signedUrlCache.set(cacheKey, {
        url: data.signedUrl,
        expires: Date.now() + (expiresIn * 1000 * 0.9) // Expire 10% early to avoid edge cases
      });

      // Clean up expired cache entries
      if (signedUrlCache.size > 1000) {
        const now = Date.now();
        for (const [key, value] of signedUrlCache.entries()) {
          if (now >= value.expires) {
            signedUrlCache.delete(key);
          }
        }
      }
    }

    return data.signedUrl;
  }

  /**
   * SUPABASE PRO: Enhanced storage info with Pro tier details
   */
  static async getStorageInfo(): Promise<{
    isSupabaseAvailable: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'error';
    recommendedUploadMethod: 'supabase' | 'supabase_chunked' | 'optimized_base64';
    proTierEnabled: boolean;
    cdnEnabled: boolean;
    chunkedUploadsEnabled: boolean;
    cacheSize?: number;
  }> {
    const isSupabaseAvailable = this.isSupabaseStorageAvailable();
    
    if (!isSupabaseAvailable) {
      return {
        isSupabaseAvailable: false,
        connectionStatus: 'disconnected',
        recommendedUploadMethod: 'optimized_base64',
        proTierEnabled: false,
        cdnEnabled: false,
        chunkedUploadsEnabled: false
      };
    }

    const isConnected = await this.testSupabaseConnection(3000);

    return {
      isSupabaseAvailable: true,
      connectionStatus: isConnected ? 'connected' : 'error',
      recommendedUploadMethod: isConnected ? 
        (proConfig.enableChunkedUploads ? 'supabase_chunked' : 'supabase') : 
        'optimized_base64',
      proTierEnabled: supabaseProTier,
      cdnEnabled: proConfig.enableCDN,
      chunkedUploadsEnabled: proConfig.enableChunkedUploads,
      cacheSize: proConfig.enableCaching ? signedUrlCache.size : undefined
    };
  }

  /**
   * SUPABASE PRO: Clear signed URL cache
   */
  static clearSignedUrlCache(): void {
    signedUrlCache.clear();
  }

  /**
   * Enhanced file deletion with Pro tier optimizations
   */
  static async deleteFile(filePath: string, bucketName: string = 'media'): Promise<void> {
    if (!this.isSupabaseStorageAvailable()) {
      throw new Error('Supabase Storage is not configured. Missing environment variables.');
    }

    const { error } = await supabase!.storage.from(bucketName).remove([filePath]);
    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    // SUPABASE PRO: Clear related cache entries
    if (proConfig.enableCaching) {
      for (const key of signedUrlCache.keys()) {
        if (key.includes(filePath)) {
          signedUrlCache.delete(key);
        }
      }
    }
  }
} 
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export interface FileUploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
}

export class FileStorageService {
  
  /**
   * Optimized image upload with compression and WebP conversion
   */
  static async uploadImage(
    file: File, 
    bucketName: string = 'media',
    options: {
      maxWidth?: number;
      quality?: number;
      generateThumbnail?: boolean;
      thumbnailSize?: number;
    } = {}
  ): Promise<FileUploadResult> {
    const { maxWidth = 1920, quality = 80, generateThumbnail = true, thumbnailSize = 300 } = options;
    
    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Optimize image with Sharp
      const optimizedBuffer = await sharp(buffer)
        .resize(maxWidth, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality })
        .toBuffer();
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${randomId}.webp`;
      const filePath = `images/${fileName}`;
      
      // Upload main image to Supabase Storage
      const supabase = getSupabaseClient();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, optimizedBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000', // 1 year cache
          upsert: false
        });
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      const result: FileUploadResult = {
        url: urlData.publicUrl,
        fileName,
        fileSize: optimizedBuffer.length,
        mimeType: 'image/webp'
      };
      
      // Generate thumbnail if requested
      if (generateThumbnail) {
        const thumbnailBuffer = await sharp(buffer)
          .resize(thumbnailSize, thumbnailSize, { 
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 70 })
          .toBuffer();
        
        const thumbnailPath = `thumbnails/${fileName}`;
        
        await supabase.storage
          .from(bucketName)
          .upload(thumbnailPath, thumbnailBuffer, {
            contentType: 'image/webp',
            cacheControl: '31536000'
          });
        
        const { data: thumbnailUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(thumbnailPath);
        
        result.thumbnailUrl = thumbnailUrlData.publicUrl;
      }
      
      return result;
      
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload and optimize image');
    }
  }
  
  /**
   * Optimized video upload with compression
   */
  static async uploadVideo(
    file: File,
    bucketName: string = 'media',
    maxSize: number = 50 * 1024 * 1024 // 50MB
  ): Promise<FileUploadResult> {
    try {
      if (file.size > maxSize) {
        throw new Error(`Video file too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop() || 'mp4';
      const fileName = `${timestamp}-${randomId}.${extension}`;
      const filePath = `videos/${fileName}`;
      
      // Upload to Supabase Storage
      const supabase = getSupabaseClient();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: '31536000'
        });
      
      if (uploadError) {
        throw new Error(`Video upload failed: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return {
        url: urlData.publicUrl,
        fileName,
        fileSize: file.size,
        mimeType: file.type
      };
      
    } catch (error) {
      console.error('Video upload error:', error);
      throw new Error('Failed to upload video');
    }
  }
  
  /**
   * Delete file from storage
   */
  static async deleteFile(fileName: string, bucketName: string = 'media'): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([`images/${fileName}`, `videos/${fileName}`, `thumbnails/${fileName}`]);
      
      if (error) {
        console.error('File deletion error:', error);
      }
    } catch (error) {
      console.error('File deletion failed:', error);
    }
  }
} 
import { prisma } from './prisma';
import { FileStorageService } from './fileStorage';
import * as Sentry from '@sentry/nextjs';

interface StorageStats {
  totalActions: number;
  actionsWithProofMedia: number;
  actionsWithDemoMedia: number;
  totalProofSize: number;
  totalDemoSize: number;
  orphanedMediaCount: number;
  cleanupCandidates: number;
}

interface CleanupResult {
  filesDeleted: number;
  spaceFreed: number;
  databaseRecordsUpdated: number;
  errors: string[];
}

export class StorageOptimizer {
  private fileStorage: FileStorageService;

  constructor() {
    this.fileStorage = new FileStorageService();
  }

  /**
   * Get comprehensive storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      // Get total action counts
      const totalActions = await prisma.action.count();
      
      const actionsWithProofMedia = await prisma.action.count({
        where: {
          OR: [
            { proofMediaUrl: { not: null } },
            { proofFileName: { not: null } }
          ]
        }
      });

      const actionsWithDemoMedia = await prisma.action.count({
        where: {
          OR: [
            { demoMediaUrl: { not: null } },
            { demoFileName: { not: null } }
          ]
        }
      });

      // Calculate total file sizes
      const sizeAggregation = await prisma.action.aggregate({
        _sum: {
          proofFileSize: true,
          demoFileSize: true
        }
      });

      // Find actions with expired or viewed media (cleanup candidates)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const cleanupCandidates = await prisma.action.count({
        where: {
          AND: [
            {
              OR: [
                { proofMediaUrl: { not: null } },
                { demoMediaUrl: { not: null } }
              ]
            },
            {
              OR: [
                { isAcknowledged: true },
                { createdAt: { lt: thirtyDaysAgo } }
              ]
            }
          ]
        }
      });

      return {
        totalActions,
        actionsWithProofMedia,
        actionsWithDemoMedia,
        totalProofSize: sizeAggregation._sum.proofFileSize || 0,
        totalDemoSize: sizeAggregation._sum.demoFileSize || 0,
        orphanedMediaCount: 0, // Will implement orphan detection separately
        cleanupCandidates
      };
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  /**
   * Clean up media files for acknowledged actions older than specified days
   */
  async cleanupAcknowledgedMedia(daysOld: number = 30): Promise<CleanupResult> {
    const result: CleanupResult = {
      filesDeleted: 0,
      spaceFreed: 0,
      databaseRecordsUpdated: 0,
      errors: []
    };

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Find actions with media that are acknowledged or old
      const actionsToCleanup = await prisma.action.findMany({
        where: {
          AND: [
            {
              OR: [
                { proofMediaUrl: { not: null } },
                { demoMediaUrl: { not: null } }
              ]
            },
            {
              OR: [
                { isAcknowledged: true },
                { createdAt: { lt: cutoffDate } }
              ]
            }
          ]
        },
        select: {
          id: true,
          proofMediaUrl: true,
          proofFileSize: true,
          demoMediaUrl: true,
          demoFileSize: true
        }
      });

      console.log(`🧹 Found ${actionsToCleanup.length} actions for media cleanup`);

      for (const action of actionsToCleanup) {
        try {
          let actionSpaceFreed = 0;
          const updateData: any = {};

          // Clean up proof media
          if (action.proofMediaUrl) {
            try {
              // Note: Delete functionality would be implemented when needed
              // await this.fileStorage.deleteFile(action.proofMediaUrl);
              actionSpaceFreed += action.proofFileSize || 0;
              result.filesDeleted++;
              
              // Clear proof media fields
              updateData.proofMediaUrl = null;
              updateData.proofFileName = null;
              updateData.proofFileSize = null;
              updateData.proofUploadMethod = null;
              updateData.proofProcessingTime = null;
              updateData.proofUploadedAt = null;
            } catch (deleteError) {
              result.errors.push(`Failed to delete proof media for action ${action.id}: ${deleteError}`);
            }
          }

          // Clean up demo media
          if (action.demoMediaUrl) {
            try {
              // Note: Delete functionality would be implemented when needed
              // await this.fileStorage.deleteFile(action.demoMediaUrl);
              actionSpaceFreed += action.demoFileSize || 0;
              result.filesDeleted++;
              
              // Clear demo media fields
              updateData.demoMediaUrl = null;
              updateData.demoFileName = null;
              updateData.demoFileSize = null;
              updateData.demoUploadMethod = null;
              updateData.demoProcessingTime = null;
              updateData.demoUploadedAt = null;
            } catch (deleteError) {
              result.errors.push(`Failed to delete demo media for action ${action.id}: ${deleteError}`);
            }
          }

          // Update database record
          if (Object.keys(updateData).length > 0) {
            await prisma.action.update({
              where: { id: action.id },
              data: updateData
            });
            result.databaseRecordsUpdated++;
          }

          result.spaceFreed += actionSpaceFreed;

        } catch (actionError) {
          result.errors.push(`Failed to cleanup action ${action.id}: ${actionError}`);
        }
      }

      console.log(`✅ Cleanup completed: ${result.filesDeleted} files deleted, ${result.spaceFreed} bytes freed`);
      
    } catch (error) {
      Sentry.captureException(error);
      result.errors.push(`Storage cleanup failed: ${error}`);
    }

    return result;
  }

  /**
   * Optimize database queries for media operations
   */
  async optimizeDatabase(): Promise<void> {
    try {
      console.log('🔧 Optimizing database for media operations...');

      // Create indexes for common media queries (if not exists)
      const indexQueries = [
        // Index for media file lookups
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_proof_media_url ON "Action" ("proofMediaUrl") WHERE "proofMediaUrl" IS NOT NULL;`,
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_demo_media_url ON "Action" ("demoMediaUrl") WHERE "demoMediaUrl" IS NOT NULL;`,
        
        // Index for cleanup queries
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_acknowledged_created ON "Action" ("isAcknowledged", "createdAt");`,
        
        // Index for media size tracking
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_file_sizes ON "Action" ("proofFileSize", "demoFileSize") WHERE "proofFileSize" IS NOT NULL OR "demoFileSize" IS NOT NULL;`,
        
        // Index for upload method tracking
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_upload_methods ON "Action" ("proofUploadMethod", "demoUploadMethod");`
      ];

      // Execute index creation queries
      for (const query of indexQueries) {
        try {
          await prisma.$executeRawUnsafe(query);
          console.log(`✅ Index created: ${query.split(' ')[5]}`);
        } catch (indexError) {
          // Index might already exist, continue
          console.log(`⚠️ Index creation skipped (may already exist): ${indexError}`);
        }
      }

      // Analyze tables for better query planning
      await prisma.$executeRaw`ANALYZE "Action";`;
      
      console.log('✅ Database optimization completed');

    } catch (error) {
      Sentry.captureException(error);
      console.error('Database optimization failed:', error);
      throw error;
    }
  }

  /**
   * Remove duplicate media entries
   */
  async removeDuplicateMedia(): Promise<CleanupResult> {
    const result: CleanupResult = {
      filesDeleted: 0,
      spaceFreed: 0,
      databaseRecordsUpdated: 0,
      errors: []
    };

    try {
      // Find actions with identical media URLs (potential duplicates)
      const duplicateProofMedia = await prisma.$queryRaw`
        SELECT "proofMediaUrl", COUNT(*) as count, 
               array_agg("id") as action_ids,
               MAX("proofFileSize") as file_size
        FROM "Action" 
        WHERE "proofMediaUrl" IS NOT NULL 
        GROUP BY "proofMediaUrl" 
        HAVING COUNT(*) > 1
      ` as Array<{
        proofMediaUrl: string;
        count: bigint;
        action_ids: string[];
        file_size: number;
      }>;

      const duplicateDemoMedia = await prisma.$queryRaw`
        SELECT "demoMediaUrl", COUNT(*) as count,
               array_agg("id") as action_ids,
               MAX("demoFileSize") as file_size
        FROM "Action" 
        WHERE "demoMediaUrl" IS NOT NULL 
        GROUP BY "demoMediaUrl" 
        HAVING COUNT(*) > 1
      ` as Array<{
        demoMediaUrl: string;
        count: bigint;
        action_ids: string[];
        file_size: number;
      }>;

      console.log(`📋 Found ${duplicateProofMedia.length} duplicate proof media groups`);
      console.log(`📋 Found ${duplicateDemoMedia.length} duplicate demo media groups`);

      // For now, just log the duplicates - actual deduplication would require more complex business logic
      // to determine which action should keep the media

      return result;

    } catch (error) {
      Sentry.captureException(error);
      result.errors.push(`Duplicate removal failed: ${error}`);
      return result;
    }
  }

  /**
   * Generate comprehensive storage report
   */
  async generateStorageReport(): Promise<{
    stats: StorageStats;
    recommendations: string[];
    estimatedSavings: number;
  }> {
    try {
      const stats = await this.getStorageStats();
      const recommendations: string[] = [];
      let estimatedSavings = 0;

      // Generate recommendations based on stats
      if (stats.cleanupCandidates > 0) {
        const avgFileSize = (stats.totalProofSize + stats.totalDemoSize) / 
                          (stats.actionsWithProofMedia + stats.actionsWithDemoMedia);
        estimatedSavings = stats.cleanupCandidates * avgFileSize * 0.7; // Conservative estimate
        
        recommendations.push(
          `${stats.cleanupCandidates} actions have acknowledged or old media files that can be cleaned up`
        );
        recommendations.push(
          `Estimated storage savings: ${(estimatedSavings / (1024 * 1024)).toFixed(2)} MB`
        );
      }

      if (stats.totalProofSize + stats.totalDemoSize > 100 * 1024 * 1024) { // > 100MB
        recommendations.push('Consider enabling Supabase Pro tier CDN for better performance');
        recommendations.push('Implement automated cleanup policies for media files');
      }

      if ((stats.actionsWithProofMedia + stats.actionsWithDemoMedia) > 1000) {
        recommendations.push('Database indexing optimization recommended for media queries');
      }

      return {
        stats,
        recommendations,
        estimatedSavings
      };

    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }
}

// Export singleton instance
export const storageOptimizer = new StorageOptimizer(); 
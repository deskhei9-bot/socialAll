import express from 'express';
import { MediaCleanupService } from '../services/media-cleanup';

const router = express.Router();

/**
 * GET /api/media-cleanup/stats
 * Get cleanup statistics
 */
router.get('/stats', async (req: any, res) => {
  try {
    const stats = await MediaCleanupService.getCleanupStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting cleanup stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/media-cleanup/orphaned
 * Manually trigger orphaned media cleanup
 */
router.post('/orphaned', async (req: any, res) => {
  try {
    await MediaCleanupService.cleanupOrphanedMedia();
    res.json({ message: 'Orphaned media cleanup completed' });
  } catch (error: any) {
    console.error('Error cleaning orphaned media:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/media-cleanup/post/:postId
 * Manually trigger cleanup for a specific post
 */
router.post('/post/:postId', async (req: any, res) => {
  try {
    const { postId } = req.params;
    const { immediate } = req.body;

    await MediaCleanupService.cleanupPostMedia(postId, { immediate: immediate === true });
    
    res.json({ 
      message: immediate 
        ? 'Media cleanup triggered immediately' 
        : 'Media cleanup scheduled for 5 minutes'
    });
  } catch (error: any) {
    console.error('Error triggering cleanup:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

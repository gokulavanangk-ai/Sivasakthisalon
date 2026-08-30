import { Router } from 'express';
import {
  uploadMediaHandler,
  listLocalMediaHandler,
  listMediaLibraryHandler,
  getMediaFileHandler,
  deleteMediaFileHandler,
} from '../controllers/media.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { uploadMedia } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

// All media routes are admin-only; uploads additionally carry a stricter limiter.
router.post('/upload', authenticate, isAdmin, uploadLimiter, uploadMedia.single('file'), uploadMediaHandler);
router.get('/local', authenticate, isAdmin, listLocalMediaHandler);
router.get('/library', authenticate, isAdmin, listMediaLibraryHandler);
router.get('/:publicId', authenticate, isAdmin, getMediaFileHandler);
router.delete('/:publicId', authenticate, isAdmin, deleteMediaFileHandler);

export default router;

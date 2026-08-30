import { Router } from 'express';
import {
  uploadMediaHandler,
  listLocalMediaHandler,
  listMediaLibraryHandler,
  deleteMediaFileHandler,
} from '../controllers/media.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { uploadMedia } from '../middleware/upload';

const router = Router();

router.post('/upload', authenticate, isAdmin, uploadMedia.single('file'), uploadMediaHandler);
router.get('/local', authenticate, isAdmin, listLocalMediaHandler);
router.get('/library', authenticate, isAdmin, listMediaLibraryHandler);
router.delete('/:publicId', authenticate, isAdmin, deleteMediaFileHandler);

export default router;
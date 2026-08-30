import { Router } from 'express';
import {
  uploadMediaHandler,
  listLocalMediaHandler,
  deleteMediaFileHandler,
} from '../controllers/media.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { uploadMedia } from '../middleware/upload';

const router = Router();

router.post('/upload', authenticate, isAdmin, uploadMedia.single('file'), uploadMediaHandler);
router.get('/local', authenticate, isAdmin, listLocalMediaHandler);
router.delete('/:publicId', authenticate, isAdmin, deleteMediaFileHandler);

export default router;
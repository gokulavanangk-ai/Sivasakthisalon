import { Router } from 'express';
import {
  listGalleryHandler,
  createGalleryHandler,
  updateGalleryHandler,
  deleteGalleryHandler,
} from '../controllers/gallery.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { gallerySchema } from '../validators/gallery.validator';

const router = Router();

router.get('/', listGalleryHandler);
router.post('/', authenticate, isAdmin, uploadImage.single('image'), validate(gallerySchema), createGalleryHandler);
router.put('/:id', authenticate, isAdmin, uploadImage.single('image'), validate(gallerySchema), updateGalleryHandler);
router.delete('/:id', authenticate, isAdmin, deleteGalleryHandler);

export default router;
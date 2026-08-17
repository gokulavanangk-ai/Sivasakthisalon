import { Router } from 'express';
import {
  getSalonHandler,
  updateSalonHandler,
  uploadLogoHandler,
  deleteLogoHandler,
} from '../controllers/salon.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { salonSettingsSchema } from '../validators/salon.validator';

const router = Router();

router.get('/', getSalonHandler);
router.put('/', authenticate, isAdmin, validate(salonSettingsSchema), updateSalonHandler);
router.post('/logo', authenticate, isAdmin, uploadImage.single('logo'), uploadLogoHandler);
router.delete('/logo', authenticate, isAdmin, deleteLogoHandler);

export default router;
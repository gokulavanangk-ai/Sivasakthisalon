import { Router } from 'express';
import {
  listHairstylesHandler,
  createHairstyleHandler,
  updateHairstyleHandler,
  deleteHairstyleHandler,
} from '../controllers/hairstyle.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { hairstyleSchema } from '../validators/hairstyle.validator';

const router = Router();

router.get('/', listHairstylesHandler);
router.post('/', authenticate, isAdmin, validate(hairstyleSchema), createHairstyleHandler);
router.put('/:id', authenticate, isAdmin, validate(hairstyleSchema), updateHairstyleHandler);
router.delete('/:id', authenticate, isAdmin, deleteHairstyleHandler);

export default router;
import { Router } from 'express';
import {
  listBarbersHandler,
  createBarberHandler,
  updateBarberHandler,
  deleteBarberHandler,
} from '../controllers/barber.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { barberSchema } from '../validators/barber.validator';

const router = Router();

router.get('/', listBarbersHandler);
router.post('/', authenticate, isAdmin, validate(barberSchema), createBarberHandler);
router.put('/:id', authenticate, isAdmin, validate(barberSchema), updateBarberHandler);
router.delete('/:id', authenticate, isAdmin, deleteBarberHandler);

export default router;
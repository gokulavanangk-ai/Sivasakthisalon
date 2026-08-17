import { Router } from 'express';
import {
  getBusinessHoursHandler,
  updateBusinessHoursHandler,
} from '../controllers/businessHours.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { businessHoursSchema } from '../validators/salon.validator';

const router = Router();

router.get('/', getBusinessHoursHandler);
router.put('/', authenticate, isAdmin, validate(businessHoursSchema), updateBusinessHoursHandler);

export default router;
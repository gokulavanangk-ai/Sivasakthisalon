import { Router } from 'express';
import {
  listServicesHandler,
  getServiceHandler,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
} from '../controllers/service.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { serviceSchema } from '../validators/service.validator';

const router = Router();

// Public
router.get('/', listServicesHandler);
router.get('/:id', getServiceHandler);

// Admin
router.post('/', authenticate, isAdmin, validate(serviceSchema), createServiceHandler);
router.put('/:id', authenticate, isAdmin, validate(serviceSchema), updateServiceHandler);
router.delete('/:id', authenticate, isAdmin, deleteServiceHandler);

export default router;
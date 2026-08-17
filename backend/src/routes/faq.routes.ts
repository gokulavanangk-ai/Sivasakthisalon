import { Router } from 'express';
import {
  listFaqsHandler,
  createFaqHandler,
  updateFaqHandler,
  deleteFaqHandler,
} from '../controllers/faq.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { faqSchema } from '../validators/faq.validator';

const router = Router();

router.get('/', listFaqsHandler);
router.post('/', authenticate, isAdmin, validate(faqSchema), createFaqHandler);
router.put('/:id', authenticate, isAdmin, validate(faqSchema), updateFaqHandler);
router.delete('/:id', authenticate, isAdmin, deleteFaqHandler);

export default router;
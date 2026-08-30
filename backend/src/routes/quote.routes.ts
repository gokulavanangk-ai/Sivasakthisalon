import { Router } from 'express';
import {
  listQuotesHandler,
  getQuoteHandler,
  createQuoteHandler,
  updateQuoteHandler,
  deleteQuoteHandler,
} from '../controllers/quote.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { quoteSchema } from '../validators/quote.validator';

const router = Router();

router.get('/', listQuotesHandler);
router.get('/:id', getQuoteHandler);
router.post('/', authenticate, isAdmin, validate(quoteSchema), createQuoteHandler);
router.put('/:id', authenticate, isAdmin, validate(quoteSchema), updateQuoteHandler);
router.delete('/:id', authenticate, isAdmin, deleteQuoteHandler);

export default router;

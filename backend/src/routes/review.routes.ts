import { Router } from 'express';
import {
  listReviewsHandler,
  createReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
} from '../controllers/review.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reviewSchema } from '../validators/review.validator';

const router = Router();

router.get('/', listReviewsHandler);
router.post('/', authenticate, isAdmin, validate(reviewSchema), createReviewHandler);
router.put('/:id', authenticate, isAdmin, validate(reviewSchema), updateReviewHandler);
router.delete('/:id', authenticate, isAdmin, deleteReviewHandler);

export default router;
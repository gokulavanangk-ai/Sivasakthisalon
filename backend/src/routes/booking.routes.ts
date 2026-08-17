import { Router } from 'express';
import {
  availableSlotsHandler,
  bookHandler,
  lookupBookingHandler,
  listBookingsHandler,
  getBookingHandler,
  updateBookingStatusHandler,
} from '../controllers/booking.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { bookingLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { bookingSchema, bookingStatusSchema } from '../validators/booking.validator';

const router = Router();

// Public
router.get('/slots/available', bookingLimiter, availableSlotsHandler);
router.post('/', bookingLimiter, validate(bookingSchema), bookHandler);
router.get('/lookup/:bookingId', lookupBookingHandler);

// Admin
router.get('/', authenticate, isAdmin, listBookingsHandler);
router.get('/:id', authenticate, isAdmin, getBookingHandler);
router.put('/:id/status', authenticate, isAdmin, validate(bookingStatusSchema), updateBookingStatusHandler);

export default router;
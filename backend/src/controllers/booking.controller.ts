import type { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { createBooking } from '../services/bookingService';
import { getAvailableSlots, isActiveStatus } from '../services/slotService';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok, paginated } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';
import type { BookingStatus } from '../types';

export const availableSlotsHandler = asyncHandler(async (req: Request, res: Response) => {
  const date = String(req.query.date ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw ApiError.badRequest('Invalid date', 'INVALID_DATE');
  }
  const slots = await getAvailableSlots(date);
  ok(res, { date, slots });
});

export const bookHandler = asyncHandler(async (req: Request, res: Response) => {
  const booking = await createBooking(req.body);
  created(res, { bookingId: booking.bookingId, status: booking.status }, 'Booking received');
});

export const lookupBookingHandler = asyncHandler(async (req: Request, res: Response) => {
  const bookingId = String(req.params.bookingId ?? '');
  const booking = await Booking.findOne({ bookingId }).exec();
  if (!booking) throw ApiError.notFound('Booking not found');
  ok(res, {
    bookingId: booking.bookingId,
    name: booking.name,
    service: booking.service,
    date: booking.date,
    time: booking.time,
    status: booking.status,
  });
});

export const listBookingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));

  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.date) filter.date = String(req.query.date);
  if (req.query.q) {
    const q = String(req.query.q).trim();
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { bookingId: { $regex: q, $options: 'i' } },
      { service: { $regex: q, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Booking.find(filter as never)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    Booking.countDocuments(filter as never),
  ]);

  paginated(res, { items, page, pages: Math.ceil(total / limit), total, limit });
});

export const getBookingHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Booking not found');
  const booking = await Booking.findById(req.params.id).exec();
  if (!booking) throw ApiError.notFound('Booking not found');
  ok(res, booking);
});

export const updateBookingStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Booking not found');
  const booking = await Booking.findById(req.params.id).exec();
  if (!booking) throw ApiError.notFound('Booking not found');

  const previousStatus = booking.status;
  const nextStatus = req.body.status as BookingStatus;

  // No actual change → no DB write, no email. The frontend already guards
  // against this, but the backend is the source of truth.
  if (previousStatus === nextStatus) {
    ok(res, booking, 'Booking status is unchanged');
    return;
  }

  booking.status = nextStatus;
  // pending/confirmed keep the slot locked; rejected/cancelled/completed release it.
  booking.activeSlot = isActiveStatus(nextStatus);

  try {
    await booking.save();
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 11000) {
      throw ApiError.conflict(
        'This slot is now booked by another customer.',
        'SLOT_TAKEN',
      );
    }
    throw err;
  }

  ok(res, booking, `Booking marked as ${booking.status}`);
});
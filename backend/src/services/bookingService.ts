import crypto from 'crypto';
import { Booking, type BookingDocument } from '../models/Booking';
import { ApiError } from '../utils/ApiError';
import {
  assertSlotAvailable,
  isBookingEnabled,
  logSlotContext,
} from './slotService';
import { logger } from '../config/logger';

export interface BookingInput {
  name: string;
  phone: string;
  email: string;
  service: string;
  serviceId?: string | null;
  barber?: string;
  date: string;
  time: string;
  message?: string;
}

export function generateBookingId(): string {
  return `SS-${new Date().getFullYear()}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;
}

export async function createBooking(input: BookingInput): Promise<BookingDocument> {
  if (!(await isBookingEnabled())) {
    throw ApiError.conflict('Online booking is currently unavailable. Please call us.', 'BOOKING_DISABLED');
  }

  const slotDate = new Date(`${input.date}T00:00:00`);
  if (Number.isNaN(slotDate.getTime())) {
    throw ApiError.badRequest('Invalid date', 'INVALID_DATE');
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (slotDate < today) {
    throw ApiError.badRequest('Cannot book a past date', 'PAST_DATE');
  }

  await assertSlotAvailable(input.date, input.time);
  await logSlotContext(input.date, input.time);

  const bookingId = generateBookingId();
  let booking: BookingDocument;
  try {
    booking = await Booking.create({
      bookingId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      service: input.service,
      serviceId: input.serviceId ?? null,
      barber: input.barber ?? '',
      date: input.date,
      time: input.time,
      message: input.message ?? '',
      status: 'pending',
      activeSlot: true,
    });
  } catch (err) {
    logger.error({ err, date: input.date, time: input.time }, 'Booking create failed');
    const code = (err as { code?: number }).code;
    if (code === 11000) {
      throw ApiError.conflict('This slot is no longer available', 'SLOT_TAKEN');
    }
    throw err;
  }

  // Email notifications (via EmailJS on the frontend) must never fail the
  // booking, so nothing email-related happens here — the slot lock above is
  // the only side effect of creating a booking.

  return booking;
}
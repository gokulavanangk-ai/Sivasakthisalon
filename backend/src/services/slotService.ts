import { BusinessHours, type BusinessHoursDocument, type DayHours } from '../models/BusinessHours';
import { Booking } from '../models/Booking';
import { SalonSettings } from '../models/SalonSettings';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export const WEEK_DAYS: WeekDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const ACTIVE_STATUSES = ['pending', 'confirmed'];

/**
 * True when a booking currently holds its slot (pending/confirmed).
 * Rejected/cancelled/completed bookings return false and release the slot.
 */
export function isActiveStatus(status: string): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function weekdayKey(d: Date): WeekDay {
  const days: WeekDay[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[d.getDay()];
}

export async function getBusinessHours(): Promise<BusinessHoursDocument> {
  let hours = await BusinessHours.findOne().exec();
  if (!hours) {
    hours = await BusinessHours.create({});
  }
  return hours;
}

export function generateSlotsForDay(day: DayHours, slotMinutes: number): string[] {
  if (!day.isOpen) return [];
  const open = toMinutes(day.open);
  const close = toMinutes(day.close);
  if (close <= open) return [];
  const breakStart = day.breakStart ? toMinutes(day.breakStart) : null;
  const breakEnd = day.breakEnd ? toMinutes(day.breakEnd) : null;

  const slots: string[] = [];
  for (let t = open; t + slotMinutes <= close; t += slotMinutes) {
    if (breakStart !== null && breakEnd !== null && t >= breakStart && t < breakEnd) {
      continue;
    }
    slots.push(formatMinutes(t));
  }
  return slots;
}

export interface SlotInfo {
  time: string;
  available: boolean;
}

export async function getAvailableSlots(dateStr: string): Promise<SlotInfo[]> {
  const hours = await getBusinessHours();
  const day = weekdayKey(new Date(`${dateStr}T00:00:00`));
  const slots = generateSlotsForDay(hours.workingHours[day], hours.slotDurationMinutes);

  if (hours.blockedDates.includes(dateStr)) return [];

  const booked = await Booking.find({
    date: dateStr,
    status: { $in: ACTIVE_STATUSES },
  })
    .select('time')
    .lean();

  const bookedTimes = new Set(booked.map((b) => b.time));

  // Exclude past slots when the requested date is today.
  const today = dateKey(new Date());
  const nowMinutes = today === dateStr ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

  return slots.map((time) => ({
    time,
    available: !bookedTimes.has(time) && !(nowMinutes > -1 && toMinutes(time) <= nowMinutes),
  }));
}

export async function assertSlotAvailable(dateStr: string, time: string): Promise<void> {
  const hours = await getBusinessHours();
  const day = weekdayKey(new Date(`${dateStr}T00:00:00`));
  const dayConfig = hours.workingHours[day];

  if (!dayConfig.isOpen) {
    throw ApiError.conflict('Salon is closed on this day', 'SLOT_UNAVAILABLE');
  }
  if (hours.blockedDates.includes(dateStr)) {
    throw ApiError.conflict('This date is blocked. Please choose another day.', 'SLOT_UNAVAILABLE');
  }
  if (toMinutes(time) < toMinutes(dayConfig.open) || toMinutes(time) >= toMinutes(dayConfig.close)) {
    throw ApiError.conflict('Selected time is outside opening hours', 'SLOT_UNAVAILABLE');
  }
  if (
    dayConfig.breakStart &&
    dayConfig.breakEnd &&
    toMinutes(time) >= toMinutes(dayConfig.breakStart) &&
    toMinutes(time) < toMinutes(dayConfig.breakEnd)
  ) {
    throw ApiError.conflict('Selected time falls in break time', 'SLOT_UNAVAILABLE');
  }

  const existing = await Booking.findOne({
    date: dateStr,
    time,
    status: { $in: ACTIVE_STATUSES },
  })
    .select('_id')
    .lean();

  if (existing) {
    throw ApiError.conflict('This slot is no longer available', 'SLOT_TAKEN');
  }
}

export async function isBookingEnabled(): Promise<boolean> {
  const settings = await SalonSettings.findOne().select('toggles.bookingEnabled').lean();
  return settings?.toggles.bookingEnabled !== false;
}

export async function logSlotContext(dateStr: string, time: string): Promise<void> {
  logger.debug({ dateStr, time }, 'Slot availability check');
}
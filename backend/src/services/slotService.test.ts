import { describe, expect, it } from 'vitest';
import {
  toMinutes,
  formatMinutes,
  generateSlotsForDay,
  dateKey,
  weekdayKey,
  isActiveStatus,
  type WeekDay,
} from '../services/slotService';

describe('generateSlotsForDay', () => {
  it('generates 30-min slots between open and close', () => {
    const slots = generateSlotsForDay(
      { open: '09:00', close: '11:00', isOpen: true, breakStart: '', breakEnd: '' },
      30,
    );
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30']);
  });

  it('excludes break time', () => {
    const slots = generateSlotsForDay(
      { open: '09:00', close: '12:00', isOpen: true, breakStart: '11:00', breakEnd: '11:30' },
      30,
    );
    expect(slots).toContain('10:30');
    expect(slots).not.toContain('11:00');
    // 11:30 starts exactly when the break ends, so it is a valid slot.
    expect(slots).toContain('11:30');
  });

  it('never produces a slot when closed', () => {
    const slots = generateSlotsForDay(
      { open: '09:00', close: '17:00', isOpen: false, breakStart: '', breakEnd: '' },
      30,
    );
    expect(slots).toEqual([]);
  });

  it('returns empty when close is not after open', () => {
    const slots = generateSlotsForDay(
      { open: '17:00', close: '09:00', isOpen: true, breakStart: '', breakEnd: '' },
      30,
    );
    expect(slots).toEqual([]);
  });

  it('rounds to slot duration correctly (slot must fit before close)', () => {
    const slots = generateSlotsForDay(
      { open: '09:10', close: '10:20', isOpen: true, breakStart: '', breakEnd: '' },
      30,
    );
    expect(slots).toEqual(['09:10', '09:40']);
  });
});

describe('time helpers', () => {
  it('converts HH:mm to minutes', () => {
    expect(toMinutes('09:30')).toBe(570);
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('23:59')).toBe(1439);
  });

  it('formats minutes back to HH:mm', () => {
    expect(formatMinutes(570)).toBe('09:30');
    expect(formatMinutes(0)).toBe('00:00');
    expect(formatMinutes(5)).toBe('00:05');
  });
});

describe('isActiveStatus', () => {
  it('keeps the slot locked for pending and confirmed bookings', () => {
    expect(isActiveStatus('pending')).toBe(true);
    expect(isActiveStatus('confirmed')).toBe(true);
  });

  it('releases the slot for rejected, cancelled and completed bookings', () => {
    expect(isActiveStatus('rejected')).toBe(false);
    expect(isActiveStatus('cancelled')).toBe(false);
    expect(isActiveStatus('completed')).toBe(false);
  });
});

describe('date helpers', () => {
  it('formats a date key as YYYY-MM-DD', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('maps a date to a weekday', () => {
    // 2026-08-16 is a Sunday
    expect(weekdayKey(new Date(2026, 7, 16))).toBe<WeekDay>('sunday');
    // 2026-08-17 is a Monday
    expect(weekdayKey(new Date(2026, 7, 17))).toBe<WeekDay>('monday');
  });
});
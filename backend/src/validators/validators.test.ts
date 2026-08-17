import { describe, expect, it } from 'vitest';
import { bookingSchema } from '../validators/booking.validator';
import { loginSchema } from '../validators/auth.validator';

function parseBooking(body: unknown) {
  return bookingSchema.safeParse({ body });
}

describe('bookingSchema validation', () => {
  const valid = {
    name: 'Murugan',
    phone: '9790446470',
    email: 'murugan@example.com',
    service: 'Premium Fade',
    date: '2026-09-01',
    time: '10:30',
  };

  it('accepts a valid booking payload', () => {
    expect(parseBooking(valid).success).toBe(true);
  });

  it('rejects a missing name', () => {
    const r = parseBooking({ ...valid, name: '' });
    expect(r.success).toBe(false);
  });

  it('rejects an invalid phone', () => {
    const r = parseBooking({ ...valid, phone: 'abc' });
    expect(r.success).toBe(false);
  });

  it('rejects a bad date format', () => {
    const r = parseBooking({ ...valid, date: '01/09/2026' });
    expect(r.success).toBe(false);
  });

  it('rejects a bad time format', () => {
    const r = parseBooking({ ...valid, time: '10:30 PM' });
    expect(r.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const r = parseBooking({ ...valid, email: 'not-an-email' });
    expect(r.success).toBe(false);
  });
});

describe('loginSchema validation', () => {
  it('accepts identifier and password', () => {
    expect(loginSchema.safeParse({ body: { identifier: 'admin', password: 'secret123' } }).success).toBe(true);
  });

  it('rejects short passwords', () => {
    expect(loginSchema.safeParse({ body: { identifier: 'admin', password: '123' } }).success).toBe(false);
  });
});
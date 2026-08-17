import { z } from 'zod';

export const bookingSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name is required').max(80),
    phone: z
      .string()
      .trim()
      .min(8, 'Valid phone number is required')
      .max(15)
      .regex(/^[+\d][\d\s-]{7,14}$/, 'Enter a valid phone number'),
    email: z.string().trim().email('Valid email is required').max(120),
    service: z.string().trim().min(2, 'Service is required').max(120),
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    barber: z.string().trim().max(80).optional().default(''),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:mm (24h)'),
    message: z.string().trim().max(500).optional().default(''),
  }),
});

export const bookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'rejected']),
  }),
});
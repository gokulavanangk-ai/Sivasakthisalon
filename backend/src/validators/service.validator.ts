import { z } from 'zod';

export const serviceSchema = z.object({
  body: z.object({
    tamilName: z.string().trim().min(1).max(80),
    englishName: z.string().trim().min(1).max(80),
    subtitle: z.string().trim().max(120).optional().default(''),
    description: z.string().trim().max(800).optional().default(''),
    durationMinutes: z.number().int().min(5).max(480).optional(),
    price: z.number().min(0).nullable().optional(),
    priceVisible: z.boolean().optional(),
    imageUrl: z.string().trim().max(600).optional().default(''),
    category: z.string().trim().max(60).optional().default('general'),
    isActive: z.boolean().optional(),
    isSignature: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});
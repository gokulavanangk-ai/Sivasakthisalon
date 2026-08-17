import { z } from 'zod';

export const reviewSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60),
    initial: z.string().trim().max(2).optional().default(''),
    rating: z.number().int().min(1).max(5),
    text: z.string().trim().min(5).max(600),
    service: z.string().trim().max(60).optional().default(''),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});
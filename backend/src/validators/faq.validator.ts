import { z } from 'zod';

export const faqSchema = z.object({
  body: z.object({
    question: z.string().trim().min(1).max(300),
    answer: z.string().trim().min(1).max(2000),
    sortOrder: z.number().int().min(0).optional().default(0),
    isActive: z.boolean().optional().default(true),
  }),
});
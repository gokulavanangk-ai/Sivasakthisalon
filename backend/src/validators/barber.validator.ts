import { z } from 'zod';

export const barberSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60),
    tamilName: z.string().trim().max(80).optional().default(''),
    specialty: z.string().trim().max(120).optional().default(''),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});
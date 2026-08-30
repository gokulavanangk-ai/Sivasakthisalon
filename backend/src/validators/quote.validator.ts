import { z } from 'zod';

export const QUOTE_SOURCES = ['home', 'about', 'contact', 'general'] as const;

const quoteImageSchema = z
  .object({
    url: z.string().url().max(800),
    publicId: z.string().max(300).default(''),
  })
  .nullish();

export const quoteSchema = z.object({
  body: z.object({
    text: z.string().trim().min(2).max(600),
    author: z.string().trim().max(120).nullish(),
    role: z.string().trim().max(120).optional().default(''),
    source: z.enum(QUOTE_SOURCES).optional().default('general'),
    image: quoteImageSchema,
    isActive: z.boolean().optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
  }),
});

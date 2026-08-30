import { z } from 'zod';

export const MEDIA_TYPES = ['image', 'video'] as const;
export const MEDIA_SOURCES = ['upload', 'url', 'local'] as const;

/** Coerce "true"/"false" strings (multipart) to booleans. */
export const boolish = z.preprocess(
  (v) => (v === 'true' ? true : v === 'false' ? false : v),
  z.boolean(),
);

export const mediaSchema = z.object({
  mediaType: z.enum(MEDIA_TYPES).optional().default('image'),
  sourceType: z.enum(MEDIA_SOURCES).optional().default('url'),
  url: z.string().trim().max(1000).optional().default(''),
  localPath: z.string().trim().max(1000).optional().default(''),
  publicId: z.string().trim().max(400).optional().default(''),
  alt: z.string().trim().max(300).optional().default(''),
  title: z.string().trim().max(120).optional().default(''),
  isActive: boolish.optional().default(true),
  order: z.coerce.number().int().min(0).optional().default(0),
});

export type MediaBody = z.infer<typeof mediaSchema>;

export const heroMediaSchema = z.object({
  mediaType: z.enum(['image', 'video', 'none']).optional().default('image'),
  sourceType: z.enum(MEDIA_SOURCES).optional().default('url'),
  url: z.string().trim().max(1000).optional().default(''),
  posterUrl: z.string().trim().max(1000).optional().default(''),
  publicId: z.string().trim().max(400).optional().default(''),
  autoplay: boolish.optional().default(true),
  muted: boolish.optional().default(true),
  loop: boolish.optional().default(true),
  playsInline: boolish.optional().default(true),
});
import { z } from 'zod';
import { GALLERY_CATEGORIES } from '../models/GalleryItem';
import { boolish, mediaSchema } from './media.validator';

export const gallerySchema = z.object({
  body: z.object({
    title: z.string().trim().max(120).optional().default(''),
    description: z.string().trim().max(500).optional().default(''),
    category: z.enum(GALLERY_CATEGORIES).optional().default('salon-interior'),
    sortOrder: z.coerce.number().int().min(0).optional().default(0),
    isActive: boolish.optional().default(true),
    // New media model.
    media: mediaSchema.optional(),
    // Legacy flat fields (kept for backward compatibility).
    imageUrl: z.string().trim().max(600).optional(),
    publicId: z.string().trim().max(300).optional().default(''),
  }),
});
import { z } from 'zod';
import { GALLERY_CATEGORIES } from '../models/GalleryItem';

export const gallerySchema = z.object({
  body: z.object({
    title: z.string().trim().max(120).optional().default(''),
    description: z.string().trim().max(500).optional().default(''),
    category: z.enum(GALLERY_CATEGORIES),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    imageUrl: z.string().trim().max(600).optional(),
    publicId: z.string().trim().max(300).optional().default(''),
  }),
});
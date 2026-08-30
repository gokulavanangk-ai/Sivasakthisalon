import { z } from 'zod';
import { HAIRSTYLE_CATEGORIES, FACE_SHAPES, STYLE_TYPES, HAIR_TYPES } from '../models/Hairstyle';
import { mediaSchema } from './media.validator';

export const hairstyleSchema = z.object({
  body: z.object({
    tamilName: z.string().trim().min(1).max(80),
    englishName: z.string().trim().min(1).max(80),
    category: z.enum(HAIRSTYLE_CATEGORIES),
    description: z.string().trim().max(800).optional().default(''),
    faceShapes: z.array(z.enum(FACE_SHAPES)).optional().default([]),
    styleTypes: z.array(z.enum(STYLE_TYPES)).optional().default([]),
    hairTypes: z.array(z.enum(HAIR_TYPES)).optional().default([]),
    imageUrl: z.string().trim().max(600).optional().default(''),
    isActive: z.boolean().optional(),
    sortOrder: z.coerce.number().int().min(0).optional().default(0),
    image: mediaSchema.optional(),
    thumbnail: mediaSchema.optional(),
    video: mediaSchema.optional(),
  }),
});
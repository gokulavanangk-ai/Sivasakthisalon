import mongoose, { type Document, type Schema } from 'mongoose';

export interface HairstyleDocument extends Document {
  tamilName: string;
  englishName: string;
  category: string;
  description: string;
  faceShapes: string[];
  styleTypes: string[];
  hairTypes: string[];
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export const HAIRSTYLE_CATEGORIES = [
  'classic',
  'fade',
  'modern',
  'textured',
  'formal',
  'beard',
  'hair-beard',
] as const;

export const FACE_SHAPES = ['oval', 'round', 'square', 'rectangle', 'diamond', 'heart'] as const;
export const STYLE_TYPES = ['classic', 'modern', 'bold', 'professional', 'low-maintenance'] as const;
export const HAIR_TYPES = ['straight', 'wavy', 'curly'] as const;

const hairstyleSchema: Schema = new mongoose.Schema(
  {
    tamilName: { type: String, required: true, trim: true },
    englishName: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: HAIRSTYLE_CATEGORIES },
    description: { type: String, default: '' },
    faceShapes: { type: [String], default: [], index: true },
    styleTypes: { type: [String], default: [], index: true },
    hairTypes: { type: [String], default: [] },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

hairstyleSchema.index({ isActive: 1, sortOrder: 1 });

export const Hairstyle = mongoose.model<HairstyleDocument>('Hairstyle', hairstyleSchema);
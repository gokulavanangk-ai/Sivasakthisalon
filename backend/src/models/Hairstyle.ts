import mongoose, { type Document, type Schema } from 'mongoose';

export interface HairstyleMedia {
  mediaType: 'image' | 'video';
  sourceType: 'upload' | 'url' | 'local';
  url: string;
  publicId: string;
  alt: string;
  isActive: boolean;
  order: number;
}

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
  image: HairstyleMedia;
  thumbnail: HairstyleMedia;
  video: HairstyleMedia;
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

const mediaSchema: Schema = new mongoose.Schema(
  {
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    sourceType: { type: String, enum: ['upload', 'url', 'local'], default: 'url' },
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const hairstyleSchema: Schema = new mongoose.Schema(
  {
    tamilName: { type: String, required: true, trim: true },
    englishName: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: HAIRSTYLE_CATEGORIES },
    description: { type: String, default: '' },
    faceShapes: { type: [String], default: [], index: true },
    styleTypes: { type: [String], default: [], index: true },
    hairTypes: { type: [String], default: [] },
    // Backward-compatible legacy field — kept in sync with `image.url`.
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    image: { type: mediaSchema, default: () => ({}) },
    thumbnail: { type: mediaSchema, default: () => ({}) },
    video: { type: mediaSchema, default: () => ({}) },
  },
  { timestamps: true },
);

hairstyleSchema.index({ isActive: 1, sortOrder: 1 });

export const Hairstyle = mongoose.model<HairstyleDocument>('Hairstyle', hairstyleSchema);
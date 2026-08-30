import mongoose, { type Document, type Schema } from 'mongoose';

export interface GalleryMedia {
  mediaType: 'image' | 'video';
  sourceType: 'upload' | 'url' | 'local';
  url: string;
  publicId: string;
  alt: string;
  title: string;
  isActive: boolean;
  order: number;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  resourceType?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface GalleryItemDocument extends Document {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  publicId: string;
  sortOrder: number;
  isActive: boolean;
  media: GalleryMedia;
}

export const GALLERY_CATEGORIES = [
  'salon-interior',
  'haircuts',
  'beard-styles',
  'customers',
  'atmosphere',
  'staff',
  'other',
] as const;

const mediaSchema: Schema = new mongoose.Schema(
  {
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    sourceType: { type: String, enum: ['upload', 'url', 'local'], default: 'url' },
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
    title: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    bytes: { type: Number, default: 0 },
    format: { type: String, default: '' },
    resourceType: { type: String, default: 'image' },
    createdBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
  },
  { _id: false },
);

const gallerySchema: Schema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    description: { type: String, default: '' },
    category: {
      type: String,
      required: true,
      enum: GALLERY_CATEGORIES,
      index: true,
    },
    // Backward-compatible legacy fields — kept in sync with `media`.
    imageUrl: { type: String, required: true },
    publicId: { type: String, default: '' },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    media: { type: mediaSchema, default: () => ({}) },
  },
  { timestamps: true },
);

gallerySchema.index({ category: 1, sortOrder: 1, isActive: 1 });

export const GalleryItem = mongoose.model<GalleryItemDocument>('GalleryItem', gallerySchema);
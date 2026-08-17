import mongoose, { type Document, type Schema } from 'mongoose';

export interface GalleryItemDocument extends Document {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  publicId: string;
  sortOrder: number;
  isActive: boolean;
}

export const GALLERY_CATEGORIES = [
  'salon-interior',
  'haircuts',
  'beard-styles',
  'customers',
  'atmosphere',
] as const;

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
    imageUrl: { type: String, required: true },
    publicId: { type: String, default: '' },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

gallerySchema.index({ category: 1, sortOrder: 1, isActive: 1 });

export const GalleryItem = mongoose.model<GalleryItemDocument>('GalleryItem', gallerySchema);
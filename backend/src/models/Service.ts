import mongoose, { type Document, type Schema } from 'mongoose';

export interface ServiceMedia {
  mediaType: 'image' | 'video';
  sourceType: 'upload' | 'url' | 'local';
  url: string;
  publicId: string;
  alt: string;
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

export interface ServiceDocument extends Document {
  tamilName: string;
  englishName: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  price: number | null;
  priceVisible: boolean;
  imageUrl: string;
  category: string;
  isActive: boolean;
  isSignature: boolean;
  sortOrder: number;
  media: ServiceMedia;
}

const mediaSchema: Schema = new mongoose.Schema(
  {
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    sourceType: { type: String, enum: ['upload', 'url', 'local'], default: 'url' },
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
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

const serviceSchema: Schema = new mongoose.Schema(
  {
    tamilName: { type: String, required: true, trim: true },
    englishName: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    durationMinutes: { type: Number, default: 30, min: 5 },
    price: { type: Number, default: null, min: 0 },
    priceVisible: { type: Boolean, default: false },
    imageUrl: { type: String, default: '' },
    category: { type: String, default: 'general', trim: true },
    isActive: { type: Boolean, default: true, index: true },
    isSignature: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0, index: true },
    media: { type: mediaSchema, default: () => ({}) },
  },
  { timestamps: true },
);

serviceSchema.index({ isActive: 1, sortOrder: 1 });
serviceSchema.index({ category: 1 });

export const Service = mongoose.model<ServiceDocument>('Service', serviceSchema);
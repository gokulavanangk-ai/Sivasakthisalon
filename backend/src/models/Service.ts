import mongoose, { type Document, type Schema } from 'mongoose';

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
}

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
  },
  { timestamps: true },
);

serviceSchema.index({ isActive: 1, sortOrder: 1 });
serviceSchema.index({ category: 1 });

export const Service = mongoose.model<ServiceDocument>('Service', serviceSchema);
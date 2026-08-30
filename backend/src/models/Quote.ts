import mongoose, { type Document, type Schema } from 'mongoose';

export type QuoteSource = 'home' | 'about' | 'contact' | 'general';

export interface QuoteDocument extends Document {
  text: string;
  author: string | null;
  role: string;
  source: QuoteSource;
  image: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
    resourceType?: string;
  } | null;
  isActive: boolean;
  sortOrder: number;
}

const quoteSchema: Schema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 600 },
    author: { type: String, default: null, trim: true, maxlength: 120 },
    role: { type: String, default: '', trim: true, maxlength: 120 },
    source: {
      type: String,
      enum: ['home', 'about', 'contact', 'general'],
      default: 'general',
      index: true,
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      bytes: { type: Number, default: 0 },
      format: { type: String, default: '' },
      resourceType: { type: String, default: 'image' },
    },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

quoteSchema.index({ isActive: 1, source: 1, sortOrder: 1 });

export const Quote = mongoose.model<QuoteDocument>('Quote', quoteSchema);

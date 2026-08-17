import mongoose, { type Document, type Schema } from 'mongoose';

export interface ReviewDocument extends Document {
  name: string;
  initial: string;
  rating: number;
  text: string;
  service: string;
  isActive: boolean;
  sortOrder: number;
}

const reviewSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    initial: { type: String, default: '', trim: true, maxlength: 2 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 600 },
    service: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

reviewSchema.index({ isActive: 1, sortOrder: -1 });

export const Review = mongoose.model<ReviewDocument>('Review', reviewSchema);
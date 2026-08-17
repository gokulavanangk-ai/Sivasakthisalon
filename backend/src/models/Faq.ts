import mongoose, { type Document, type Schema } from 'mongoose';

export interface FaqDocument extends Document {
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

const faqSchema: Schema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

faqSchema.index({ isActive: 1, sortOrder: 1 });

export const Faq = mongoose.model<FaqDocument>('Faq', faqSchema);
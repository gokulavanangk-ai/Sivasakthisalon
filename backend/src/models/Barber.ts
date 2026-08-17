import mongoose, { type Document, type Schema } from 'mongoose';

export interface BarberDocument extends Document {
  name: string;
  tamilName: string;
  specialty: string;
  isActive: boolean;
  sortOrder: number;
}

const barberSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tamilName: { type: String, default: '', trim: true },
    specialty: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

barberSchema.index({ isActive: 1, sortOrder: 1 });

export const Barber = mongoose.model<BarberDocument>('Barber', barberSchema);
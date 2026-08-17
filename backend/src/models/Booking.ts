import mongoose, { type Document, type Schema } from 'mongoose';
import type { BookingStatus, EmailStatus } from '../types';

export interface BookingDocument extends Document {
  bookingId: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  serviceId?: Schema.Types.ObjectId;
  barber?: string;
  date: string;
  time: string;
  message?: string;
  status: BookingStatus;
  activeSlot: boolean;
  emailStatus: EmailStatus;
  emailStatusNote?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingSchema: Schema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    service: { type: String, required: true, trim: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null },
    barber: { type: String, default: '', trim: true },
    date: { type: String, required: true, index: true },
    time: { type: String, required: true, index: true },
    message: { type: String, default: '', trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
      index: true,
    },
    // Atomic slot lock: true while the booking holds its slot (pending/confirmed).
    // The unique partial index below guarantees at most ONE active booking per
    // date+time, which is what makes concurrent double-bookings impossible.
    activeSlot: { type: Boolean, default: true },
    emailStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    emailStatusNote: { type: String, default: '' },
  },
  { timestamps: true },
);

bookingSchema.index({ date: 1, status: 1, createdAt: -1 });
// Unique while active — enforces the slot lock at the database level so two
// customers can never both take the same slot. Rejected/cancelled/completed
// bookings set activeSlot=false and no longer participate in this index, which
// releases the slot for reuse.
bookingSchema.index(
  { date: 1, time: 1 },
  { unique: true, partialFilterExpression: { activeSlot: true }, name: 'unique_active_slot' },
);

export const Booking = mongoose.model<BookingDocument>('Booking', bookingSchema);
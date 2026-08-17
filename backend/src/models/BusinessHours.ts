import mongoose, { type Document, type Schema } from 'mongoose';

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
  breakStart: string;
  breakEnd: string;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface BusinessHoursDocument extends Document {
  workingHours: WorkingHours;
  slotDurationMinutes: number;
  blockedDates: string[];
  timezone: string;
}

const dayHoursSchema: Schema = new mongoose.Schema(
  {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '21:00' },
    isOpen: { type: Boolean, default: true },
    breakStart: { type: String, default: '' },
    breakEnd: { type: String, default: '' },
  },
  { _id: false },
);

const businessHoursSchema: Schema = new mongoose.Schema(
  {
    workingHours: {
      monday: { type: dayHoursSchema, default: () => ({}) },
      tuesday: { type: dayHoursSchema, default: () => ({}) },
      wednesday: { type: dayHoursSchema, default: () => ({}) },
      thursday: { type: dayHoursSchema, default: () => ({}) },
      friday: { type: dayHoursSchema, default: () => ({}) },
      saturday: { type: dayHoursSchema, default: () => ({}) },
      sunday: { type: dayHoursSchema, default: () => ({ isOpen: false }) },
    },
    slotDurationMinutes: { type: Number, default: 30, min: 15, max: 120 },
    blockedDates: { type: [String], default: [] },
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  { timestamps: true },
);

export const BusinessHours = mongoose.model<BusinessHoursDocument>(
  'BusinessHours',
  businessHoursSchema,
);
import mongoose, { type Document, type Schema } from 'mongoose';

export interface AdminDocument extends Document {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const adminSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin', enum: ['admin', 'superadmin'] },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

adminSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  const { verify } = require('argon2') as typeof import('argon2');
  return verify(this.passwordHash, candidate);
};

export const Admin = mongoose.model<AdminDocument>('Admin', adminSchema);
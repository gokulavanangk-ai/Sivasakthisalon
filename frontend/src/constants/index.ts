export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

import type { BookingStatus, FaceShape, GalleryCategory, HairstyleCategory, HairType, StyleType } from '@/types';

/** Builds a wa.me link from a raw phone number. Returns '' when no number is provided. */
export function whatsappLink(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, '');
  if (!digits) return '';
  const normalized = digits.startsWith('91') ? digits : `91${digits}`;
  return `https://wa.me/${normalized}`;
}

/** Builds an Instagram profile link from a handle. Returns '' when no handle is provided. */
export function instagramLink(handle: string): string {
  const clean = handle.replace(/^@/, '').trim();
  if (!clean) return '';
  return `https://instagram.com/${clean}`;
}

export const SALON_KEYWORDS = [
  "Men's Salon in Virudhunagar",
  "Men's Haircut in Virudhunagar",
  "Men's Grooming Salon in Rosalpatti",
  'Haircut and Beard Styling in Virudhunagar',
];

export const GALLERY_CATEGORIES: { value: GalleryCategory; label: string; tamil: string }[] = [
  { value: 'salon-interior', label: 'Salon Interior', tamil: 'கடை அமைப்பு' },
  { value: 'haircuts', label: 'Haircuts', tamil: 'ஹேர்கட்' },
  { value: 'beard-styles', label: 'Beard Styles', tamil: 'மீசை ஸ்டைல்ஸ்' },
  { value: 'customers', label: 'Customers', tamil: 'வாடிக்கையாளர்கள்' },
  { value: 'atmosphere', label: 'Atmosphere', tamil: 'சூழல்' },
  { value: 'staff', label: 'Staff', tamil: 'ஊழியர்கள்' },
  { value: 'other', label: 'Other', tamil: 'மற்றவை' },
];

export const HAIRSTYLE_CATEGORY_LABELS: Record<HairstyleCategory, { label: string; tamil: string }> = {
  classic: { label: 'Classic', tamil: 'கிளாசிக்' },
  fade: { label: 'Fade', tamil: 'ஃபேட்' },
  modern: { label: 'Modern', tamil: 'மாடர்ன்' },
  textured: { label: 'Textured', tamil: 'டெக்ஸ்சர்டு' },
  formal: { label: 'Formal', tamil: 'ஃபார்மல்' },
  beard: { label: 'Beard', tamil: 'மீசை' },
  'hair-beard': { label: 'Hair + Beard', tamil: 'ஹேர் + பியர்டு' },
};

export const FACE_SHAPES: { value: FaceShape; label: string; tamil: string }[] = [
  { value: 'oval', label: 'Oval', tamil: 'முட்டை வடிவம்' },
  { value: 'round', label: 'Round', tamil: 'வட்ட வடிவம்' },
  { value: 'square', label: 'Square', tamil: 'சதுர வடிவம்' },
  { value: 'rectangle', label: 'Rectangle', tamil: 'செவ்வக வடிவம்' },
  { value: 'diamond', label: 'Diamond', tamil: 'டைமண்ட்' },
  { value: 'heart', label: 'Heart', tamil: 'ஹார்ட்' },
];

export const STYLE_TYPES: { value: StyleType; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'modern', label: 'Modern' },
  { value: 'bold', label: 'Bold' },
  { value: 'professional', label: 'Professional' },
  { value: 'low-maintenance', label: 'Low Maintenance' },
];

export const HAIR_TYPES: { value: HairType; label: string; tamil: string }[] = [
  { value: 'straight', label: 'Straight', tamil: 'நேரான' },
  { value: 'wavy', label: 'Wavy', tamil: 'அலை போன்ற' },
  { value: 'curly', label: 'Curly', tamil: 'சுருள்' },
];

export const BOOKING_STATUS: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
];
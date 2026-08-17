import { clsx, type ClassValue } from 'clsx';
import { BUSINESS_FALLBACK } from '@/constants';
import type { BusinessInfo, SalonSettings } from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function businessInfoOf(salon?: SalonSettings): BusinessInfo {
  return { ...BUSINESS_FALLBACK, ...(salon?.businessInfo ?? {}) } as BusinessInfo;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
}

export function displayDate(date: string, time?: string): string {
  const d = new Date(`${date}T00:00:00`);
  const formatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
  return time ? `${formatted} \u00b7 ${time}` : formatted;
}

export function to12Hour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function todayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

export function addDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

export function nextNDays(count: number): string[] {
  const today = todayDateKey();
  return Array.from({ length: count }, (_, i) => addDays(today, i));
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[c];
  });
}
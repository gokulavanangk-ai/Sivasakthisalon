import { describe, expect, it } from 'vitest';
import { formatPhone, businessInfoOf } from '@/lib/utils';
import { whatsappLink, instagramLink } from '@/constants';
import type { SalonSettings } from '@/types';

function salonWith(businessInfo: Record<string, unknown>): SalonSettings {
  return { businessInfo } as unknown as SalonSettings;
}

describe('null-safe business-content helpers', () => {
  it('formatPhone accepts undefined/null without crashing', () => {
    expect(formatPhone(undefined)).toBe('');
    expect(formatPhone(null)).toBe('');
    expect(formatPhone('')).toBe('');
    expect(formatPhone('9876543210')).toBe('+91 98765 43210');
  });

  it('whatsappLink accepts undefined/null without crashing', () => {
    expect(whatsappLink(undefined)).toBe('');
    expect(whatsappLink(null)).toBe('');
    expect(whatsappLink('')).toBe('');
    expect(whatsappLink('9876543210')).toMatch(/^https:\/\/wa\.me\//);
  });

  it('instagramLink accepts undefined/null without crashing', () => {
    expect(instagramLink(undefined)).toBe('');
    expect(instagramLink(null)).toBe('');
    expect(instagramLink('')).toBe('');
    expect(instagramLink('@sivasakthi')).toBe('https://instagram.com/sivasakthi');
  });

  it('businessInfoOf coerces missing/null fields to their declared type', () => {
    const bi = businessInfoOf(salonWith({ phone: null, whatsapp: undefined }));
    expect(bi.phone).toBe('');
    expect(bi.whatsapp).toBe('');
    expect(bi.instagram).toBe('');
    expect(bi.salonName).toBe('');
  });

  it('businessInfoOf preserves present string fields', () => {
    const bi = businessInfoOf(salonWith({ whatsapp: '9090909090', phone: '9876543210' }));
    expect(bi.whatsapp).toBe('9090909090');
    expect(bi.phone).toBe('9876543210');
  });

  it('businessInfoOf preserves numeric fields when present', () => {
    const bi = businessInfoOf(salonWith({ experienceYears: 10 }));
    expect(bi.experienceYears).toBe(10);
    expect(bi.phone).toBe('');
  });
});

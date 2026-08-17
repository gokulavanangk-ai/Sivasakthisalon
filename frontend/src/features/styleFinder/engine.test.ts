import { describe, expect, it } from 'vitest';
import { recommendHairstyles, getCombination } from './engine';
import type { Hairstyle } from '@/types';

const styles: Hairstyle[] = [
  {
    _id: '1',
    tamilName: 'கிளாசிக் சைட் பார்ட்',
    englishName: 'Classic Side Part',
    category: 'classic',
    description: '',
    faceShapes: ['oval', 'rectangle'],
    styleTypes: ['professional', 'classic'],
    hairTypes: ['straight', 'wavy'],
    imageUrl: '',
    isActive: true,
    sortOrder: 1,
  },
  {
    _id: '2',
    tamilName: 'லோ ஃபேட்',
    englishName: 'Low Fade',
    category: 'fade',
    description: '',
    faceShapes: ['oval', 'round', 'square'],
    styleTypes: ['modern', 'low-maintenance'],
    hairTypes: ['straight', 'wavy', 'curly'],
    imageUrl: '',
    isActive: true,
    sortOrder: 2,
  },
  {
    _id: '3',
    tamilName: 'ஹை ஃபேட்',
    englishName: 'High Fade',
    category: 'fade',
    description: '',
    faceShapes: ['diamond'],
    styleTypes: ['bold', 'modern'],
    hairTypes: ['straight'],
    imageUrl: '',
    isActive: true,
    sortOrder: 3,
  },
];

describe('recommendHairstyles', () => {
  it('ranks matching face shape and style type first', () => {
    const result = recommendHairstyles(styles, {
      faceShape: 'oval',
      styleType: 'professional',
      hairType: 'straight',
    });
    expect(result[0].englishName).toBe('Classic Side Part');
  });

  it('returns empty when no styles match anything', () => {
    const result = recommendHairstyles([], {
      faceShape: 'heart',
      styleType: 'professional',
      hairType: 'curly',
    });
    expect(result.length).toBe(0);
  });

  it('ranks stronger partial matches above weaker ones', () => {
    const result = recommendHairstyles(styles, {
      faceShape: 'diamond',
      styleType: 'modern',
      hairType: 'straight',
    });
    // High Fade matches all three (diamond + modern + straight).
    expect(result[0].englishName).toBe('High Fade');
    // Low Fade matches two (modern + straight) and lands second.
    expect(result[1].englishName).toBe('Low Fade');
  });

  it('never exceeds four recommendations', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      ...styles[0],
      _id: String(i),
      faceShapes: ['oval'] as ('oval' | 'round' | 'square' | 'rectangle' | 'diamond' | 'heart')[],
    }));
    const result = recommendHairstyles(many, { faceShape: 'oval', styleType: 'professional', hairType: 'straight' });
    expect(result.length).toBeLessThanOrEqual(4);
  });
});

describe('getCombination', () => {
  it('returns a combination for a known pair', () => {
    const combo = getCombination('classic', 'stubble');
    expect(combo.headline).toBeTruthy();
    expect(combo.description).toBeTruthy();
  });

  it('falls back gracefully for unknown pairs', () => {
    const combo = getCombination('unknown', 'unknown');
    expect(combo.headline).toBeTruthy();
  });
});
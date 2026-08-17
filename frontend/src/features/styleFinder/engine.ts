import type { FaceShape, Hairstyle, HairType, StyleType } from '@/types';

export interface StylePreference {
  faceShape: FaceShape;
  styleType: StyleType;
  hairType: HairType;
}

/** Rule-based recommendation engine — pure function, no API requirement. */
export function recommendHairstyles(hairstyles: Hairstyle[], preference: StylePreference): Hairstyle[] {
  const { faceShape, styleType, hairType } = preference;

  const scored = hairstyles.map((style) => {
    let score = 0;

    if (style.faceShapes.includes(faceShape)) score += 3;
    if (style.styleTypes.includes(styleType)) score += 3;
    if (style.hairTypes.includes(hairType)) score += 2;

    // Tie-breakers that make recommendations feel more deliberate.
    if (style.category === 'fade' && styleType === 'modern') score += 1;
    if (style.category === 'classic' && styleType === 'professional') score += 1;
    if (style.category === 'formal' && styleType === 'professional') score += 0.5;
    if (style.category === 'textured' && styleType === 'low-maintenance') score += 1;

    return { style, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.style);
}

export interface HairCombination {
  hair: string;
  beard: string;
  headline: string;
  description: string;
}

const COMBO_MATRIX: Record<string, Record<string, HairCombination>> = {
  classic: {
    clean: {
      hair: 'Classic Side Part',
      beard: 'Clean',
      headline: 'தலை வேலை. தாடி முழுமை.',
      description: 'ஒரு executive மாதிரி sharp-ஐ வேணும் என்றால் — classic part + clean shave perfect combo.',
    },
    stubble: {
      hair: 'Classic Side Part',
      beard: 'Stubble',
      headline: 'நேர்த்தியான முதிர்ச்சி',
      description: 'Classic hair + light stubble — professional-ஆய், அதே சமயம் casual-ஆய் இருக்கும்.',
    },
    'short-beard': {
      hair: 'Classic Side Part',
      beard: 'Short Beard',
      headline: 'பாரம்பரிய அழகு',
      description: 'கிளாசிக் கட் + short beard — எங்களின் signature combination.',
    },
    'full-beard': {
      hair: 'Classic Side Part',
      beard: 'Full Beard',
      headline: 'கம்பீரத் தோற்றம்',
      description: 'Full beard-உடன் classic hair — கம்பீரமும் நேர்த்தியும் ஒன்றாக.',
    },
  },
  fade: {
    clean: {
      hair: 'Premium Fade',
      beard: 'Clean',
      headline: 'Sharp & Clean',
      description: 'Fade + clean shave — urban, crisp, காலம் செல்லாத look.',
    },
    stubble: {
      hair: 'Premium Fade',
      beard: 'Stubble',
      headline: 'சிட்டி ஸ்டைல்',
      description: 'Fade + stubble — குறைந்த maintenance-இல் maximum style.',
    },
    'short-beard': {
      hair: 'Premium Fade',
      beard: 'Short Beard',
      headline: 'நாயகன் ஸ்டைல்',
      description: 'High fade + short beard — முகத்திற்கு definition சேர்க்கும் combo.',
    },
    'full-beard': {
      hair: 'Premium Fade',
      beard: 'Full Beard',
      headline: 'முழு கம்பீரம்',
      description: 'Bold fade + full beard — தெருவிலேயே திரும்பிப் பார்க்க வைக்கும் look.',
    },
  },
  textured: {
    clean: {
      hair: 'Textured Crop',
      beard: 'Clean',
      headline: 'இளமை அழகு',
      description: 'Textured crop + clean face — young, fresh, easy.',
    },
    stubble: {
      hair: 'Textured Crop',
      beard: 'Stubble',
      headline: 'கேஷுவல் கூல்',
      description: 'Texture + stubble — weekend சமாசாரத்திற்கு ரெடி.',
    },
    'short-beard': {
      hair: 'Textured Crop',
      beard: 'Short Beard',
      headline: 'மாடர்ன் மேன்',
      description: 'Textured crop + short beard — contemporary masculine look.',
    },
    'full-beard': {
      hair: 'Textured Crop',
      beard: 'Full Beard',
      headline: 'வலிமையான அழகு',
      description: 'Textured top + full beard — rugged, bold, movie-hero energy.',
    },
  },
  'slick-back': {
    clean: {
      hair: 'Slick Back',
      beard: 'Clean',
      headline: 'பவர் லுக்கு',
      description: 'Slick back + clean — boardroom-ready, zero noise.',
    },
    stubble: {
      hair: 'Slick Back',
      beard: 'Stubble',
      headline: 'கடினமான நேர்த்தி',
      description: 'Slick back + stubble — opposite forces, perfect balance.',
    },
    'short-beard': {
      hair: 'Slick Back',
      beard: 'Short Beard',
      headline: 'மாஃபியா மூடு',
      description: 'Slick + short beard — determined, stylish, unforgettable.',
    },
    'full-beard': {
      hair: 'Slick Back',
      beard: 'Full Beard',
      headline: 'ஆட்சி செய்யும் அழகு',
      description: 'Slick back + full beard — full authority on any occasion.',
    },
  },
};

export const HAIR_CHOICES: { value: string; label: string; tamil: string }[] = [
  { value: 'classic', label: 'Classic', tamil: 'கிளாசிக்' },
  { value: 'fade', label: 'Fade', tamil: 'ஃபேடு' },
  { value: 'textured', label: 'Textured', tamil: 'டெக்ஸ்சர்டு' },
  { value: 'slick-back', label: 'Slick Back', tamil: 'ஸ்லிக் பேக்' },
];

export const BEARD_CHOICES: { value: string; label: string; tamil: string }[] = [
  { value: 'clean', label: 'Clean', tamil: 'சவுண்டு' },
  { value: 'stubble', label: 'Stubble', tamil: 'மென்மை' },
  { value: 'short-beard', label: 'Short Beard', tamil: 'குட்டை மீசை' },
  { value: 'full-beard', label: 'Full Beard', tamil: 'முழு மீசை' },
];

export function getCombination(hair: string, beard: string): HairCombination {
  return COMBO_MATRIX[hair]?.[beard] ?? {
    hair,
    beard,
    headline: 'உனக்கான Combination',
    description: 'தேர்ந்தெடுத்த ஹேர் & பியர்டு combo-வை நம் barbers-ஆல் அழகாக style செய்வார்கள்.',
  };
}
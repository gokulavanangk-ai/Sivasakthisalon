import type { OfferItem, SalonSettings } from '@/types';

export type FieldType = 'text' | 'textarea' | 'number' | 'url' | 'boolean';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  full?: boolean;
  note?: string;
  min?: number;
  isImage?: boolean;
}

export interface SectionMeta {
  key: string;
  label: string;
  tamil?: string;
  description: string;
  savePaths: string[];
  fields: FieldDef[];
}

export function getPath(obj: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
}

export function setPath<T>(obj: T, key: string, value: unknown): T {
  const parts = key.split('.');
  const out: Record<string, unknown> = Array.isArray(obj)
    ? (obj as unknown as Record<string, unknown>)
    : { ...(obj as Record<string, unknown>) };
  let cursor = out;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const next = cursor[part];
    if (next == null || typeof next !== 'object') {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
  return out as T;
}

export function buildPayload(salon: SalonSettings | undefined, section: SectionMeta): Partial<SalonSettings> {
  if (!salon) return {};
  const payload: Record<string, unknown> = {};
  section.savePaths.forEach((path) => {
    payload[path] = (salon as unknown as Record<string, unknown>)[path];
  });
  return payload as Partial<SalonSettings>;
}

export function emptyOffer(): OfferItem {
  return { title: '', description: '', price: null, originalPrice: null, badge: '', imageUrl: '', isActive: true, sortOrder: 0 };
}

export const SECTIONS: SectionMeta[] = [
  {
    key: 'hero',
    label: 'Hero',
    tamil: 'முகப்பு',
    description: 'Big title, subtitle, background video/poster and call-to-action buttons.',
    savePaths: ['hero', 'sections', 'toggles'],
    fields: [
      { key: 'hero.title', label: 'Hero title (Tamil, line breaks allowed)', type: 'textarea', full: true },
      { key: 'hero.subtitle', label: 'Hero subtitle (eyebrow)', type: 'text', full: true, placeholder: 'e.g. 23+ YEARS OF EXPERIENCE' },
      { key: 'sections.hero.ctaPrimary', label: 'Primary button label', type: 'text' },
      { key: 'sections.hero.ctaSecondary', label: 'Secondary button label', type: 'text' },
      { key: 'toggles.heroVideoEnabled', label: 'Play background video', type: 'boolean' },
    ],
  },
  {
    key: 'services',
    label: 'Services',
    tamil: 'சேவைகள்',
    description: 'Heading for the services grid. Add / edit services themselves in the Services page.',
    savePaths: ['sections', 'toggles'],
    fields: [
      { key: 'sections.services.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'sections.services.englishTitle', label: 'English title', type: 'text' },
      { key: 'sections.services.title', label: 'Tamil title', type: 'textarea', full: true },
      { key: 'toggles.pricingVisible', label: 'Show prices on site', type: 'boolean' },
    ],
  },
  {
    key: 'signature',
    label: 'Signature Styles',
    tamil: 'சிறப்பு ஸ்டைல்கள்',
    description: 'Heading for the signature experience row. Mark services as signature in the Services page.',
    savePaths: ['sections'],
    fields: [
      { key: 'sections.signature.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'sections.signature.englishTitle', label: 'English title', type: 'text' },
      { key: 'sections.signature.title', label: 'Tamil title', type: 'textarea', full: true },
    ],
  },
  {
    key: 'beforeAfter',
    label: 'Before / After',
    tamil: 'முன் / பின்',
    description: 'Heading for the transformation slider. Pairs are built from gallery titles ending in "before" / "after".',
    savePaths: ['sections', 'toggles'],
    fields: [
      { key: 'sections.beforeAfter.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'sections.beforeAfter.englishTitle', label: 'English title', type: 'text' },
      { key: 'sections.beforeAfter.title', label: 'Tamil title', type: 'textarea', full: true },
      { key: 'toggles.beforeAfterEnabled', label: 'Show Before / After section', type: 'boolean' },
    ],
  },
  {
    key: 'team',
    label: 'Barbers / Team',
    tamil: 'குழு',
    description: 'Heading for the barbers team section. Add, edit or remove team members right in this section.',
    savePaths: ['sections', 'toggles'],
    fields: [
      { key: 'sections.team.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'sections.team.englishTitle', label: 'English title', type: 'text' },
      { key: 'sections.team.title', label: 'Tamil title', type: 'textarea', full: true },
      { key: 'toggles.teamEnabled', label: 'Show Team section', type: 'boolean' },
    ],
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    tamil: 'மதிப்புரைகள்',
    description: 'Heading for customer reviews. Manage reviews in the Reviews page.',
    savePaths: ['sections', 'toggles'],
    fields: [
      { key: 'sections.testimonials.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'sections.testimonials.englishTitle', label: 'English title', type: 'text' },
      { key: 'sections.testimonials.title', label: 'Tamil title', type: 'textarea', full: true },
      { key: 'toggles.reviewsEnabled', label: 'Show customer reviews', type: 'boolean' },
    ],
  },
  {
    key: 'offers',
    label: 'Offers',
    tamil: 'சலுகைகள்',
    description: 'Heading, enable/disable switch and a list of offers with prices and badges.',
    savePaths: ['offers', 'sections', 'toggles'],
    fields: [
      { key: 'toggles.offersEnabled', label: 'Show Offers section', type: 'boolean' },
      { key: 'offers.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'offers.englishTitle', label: 'English title', type: 'text' },
      { key: 'offers.title', label: 'Tamil title', type: 'textarea', full: true },
    ],
  },
  {
    key: 'cta',
    label: 'Call to action',
    tamil: 'அழைப்பு',
    description: 'The closing call-to-action band. Shown across the site and edited from the Home tab.',
    savePaths: ['sections'],
    fields: [
      { key: 'sections.cta.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'sections.cta.title', label: 'Title (Tamil, line breaks allowed)', type: 'textarea', full: true },
      { key: 'sections.cta.subtitle', label: 'Subtitle', type: 'text', full: true },
      { key: 'sections.cta.primaryCta', label: 'Primary button label', type: 'text' },
      { key: 'sections.cta.secondaryCta', label: 'Secondary button label', type: 'text' },
    ],
  },
];

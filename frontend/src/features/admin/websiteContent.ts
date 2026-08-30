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
      { key: 'hero.tagline', label: 'Hero tagline (Tamil)', type: 'text', full: true },
      { key: 'hero.videoUrl', label: 'Background video URL', type: 'url' },
      { key: 'hero.posterUrl', label: 'Poster image', type: 'string', isImage: true },
      { key: 'hero.mobileImageUrl', label: 'Mobile fallback image', type: 'string', isImage: true },
      { key: 'sections.hero.ctaPrimary', label: 'Primary button label', type: 'text' },
      { key: 'sections.hero.ctaSecondary', label: 'Secondary button label', type: 'text' },
      { key: 'toggles.heroVideoEnabled', label: 'Play background video', type: 'boolean' },
    ],
  },
  {
    key: 'about',
    label: 'About',
    tamil: 'எங்களை பற்றி',
    description: 'The story section heading, narrative, image and experience years.',
    savePaths: ['about', 'sections'],
    fields: [
      { key: 'about.heading', label: 'Heading (Tamil)', type: 'textarea', full: true },
      { key: 'about.body', label: 'Body text (Tamil)', type: 'textarea', full: true },
      { key: 'about.imageUrl', label: 'Image', type: 'string', full: true, isImage: true },
      { key: 'about.experienceYears', label: 'Experience years', type: 'number', min: 0 },
      { key: 'sections.about.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'sections.about.storyNote', label: 'Story note (Tamil)', type: 'textarea', full: true },
      { key: 'sections.about.yearsLabel', label: 'Years badge label', type: 'text' },
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
    key: 'gallery',
    label: 'Gallery',
    tamil: 'கேலரி',
    description: 'Heading for the gallery strip. Manage images in the Gallery page.',
    savePaths: ['sections'],
    fields: [
      { key: 'sections.gallery.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'sections.gallery.englishTitle', label: 'English title', type: 'text' },
      { key: 'sections.gallery.title', label: 'Tamil title', type: 'textarea', full: true },
    ],
  },
  {
    key: 'team',
    label: 'Barbers / Team',
    tamil: 'குழு',
    description: 'Heading for the barbers team section. Manage barbers in Settings.',
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
    key: 'faq',
    label: 'FAQ',
    tamil: 'கேள்விகள்',
    description: 'Heading for frequently asked questions. Manage questions in the FAQs page.',
    savePaths: ['sections', 'toggles'],
    fields: [
      { key: 'sections.faq.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'sections.faq.englishTitle', label: 'English title', type: 'text' },
      { key: 'sections.faq.title', label: 'Tamil title', type: 'textarea', full: true },
      { key: 'toggles.faqEnabled', label: 'Show FAQ section', type: 'boolean' },
    ],
  },
  {
    key: 'contact',
    label: 'Contact',
    tamil: 'தொடர்பு',
    description: 'Contact page headings, quote, phone, WhatsApp, Instagram, address, maps and opening hours.',
    savePaths: ['sections', 'address', 'openingHours', 'social', 'maps'],
    fields: [
      { key: 'sections.contact.eyebrow', label: 'Eyebrow label', type: 'text' },
      { key: 'sections.contact.englishTitle', label: 'English title', type: 'text' },
      { key: 'sections.contact.title', label: 'Tamil title', type: 'text', full: true },
      { key: 'sections.contact.quote', label: 'Contact quote (Tamil)', type: 'textarea', full: true },
      { key: 'address', label: 'Address', type: 'text', full: true },
      { key: 'openingHours', label: 'Opening hours (display text)', type: 'text', full: true },
      { key: 'social.phone', label: 'Phone', type: 'text' },
      { key: 'social.whatsapp', label: 'WhatsApp number', type: 'text' },
      { key: 'social.instagram', label: 'Instagram handle', type: 'text' },
      { key: 'social.email', label: 'Email', type: 'text' },
      { key: 'maps.embedUrl', label: 'Google Maps embed URL', type: 'url', full: true },
      { key: 'maps.directionsUrl', label: 'Directions URL', type: 'url', full: true },
      { key: 'sections.contact.callTitle', label: 'Call card title', type: 'text' },
      { key: 'sections.contact.callTamil', label: 'Call card Tamil', type: 'text' },
      { key: 'sections.contact.whatsappTitle', label: 'WhatsApp card title', type: 'text' },
      { key: 'sections.contact.whatsappTamil', label: 'WhatsApp card Tamil', type: 'text' },
      { key: 'sections.contact.instagramTitle', label: 'Instagram card title', type: 'text' },
      { key: 'sections.contact.instagramTamil', label: 'Instagram card Tamil', type: 'text' },
      { key: 'sections.contact.addressTitle', label: 'Address card title', type: 'text' },
      { key: 'sections.contact.addressTamil', label: 'Address card Tamil', type: 'text' },
      { key: 'sections.contact.openingHoursTitle', label: 'Opening hours label', type: 'text' },
    ],
  },
  {
    key: 'footer',
    label: 'Footer',
    tamil: 'கால்பகுதி',
    description: 'Footer column headings, tagline and footer text.',
    savePaths: ['sections', 'footerText', 'tagline', 'taglineTamil'],
    fields: [
      { key: 'sections.footer.exploreTitle', label: 'Explore column heading', type: 'text' },
      { key: 'sections.footer.contactTitle', label: 'Contact column heading', type: 'text' },
      { key: 'tagline', label: 'Tagline (English)', type: 'text', full: true },
      { key: 'taglineTamil', label: 'Tagline (Tamil)', type: 'text', full: true },
      { key: 'footerText', label: 'Footer text', type: 'textarea', full: true },
    ],
  },
  {
    key: 'cta',
    label: 'Call to action',
    tamil: 'அழைப்பு',
    description: 'The final CTA band shown on the home and about pages.',
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

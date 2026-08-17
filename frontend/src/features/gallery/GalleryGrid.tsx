import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem } from '@/types';
import { GALLERY_CATEGORIES } from '@/constants';
import { SmartImage } from '@/components/shared/SmartImage';
import { cn } from '@/lib/utils';

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [active, setActive] = useState<string | 'all'>('all');
  const [current, setCurrent] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!current) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCurrent(null);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const filtered = useMemo(
    () => (active === 'all' ? items : items.filter((i) => i.category === active)),
    [active, items],
  );

  const next = () => {
    if (!current) return;
    const idx = filtered.findIndex((i) => i._id === current._id);
    setCurrent(filtered[(idx + 1) % filtered.length]);
  };
  const prev = () => {
    if (!current) return;
    const idx = filtered.findIndex((i) => i._id === current._id);
    setCurrent(filtered[(idx - 1 + filtered.length) % filtered.length]);
  };

  const categories = useMemo(
    () => [
      { value: 'all', label: 'All', tamil: 'அனைத்தும்' },
      ...GALLERY_CATEGORIES.map((c) => ({ value: c.value, label: c.label, tamil: c.tamil })),
    ],
    [],
  );

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setActive(c.value)}
            className={cn(
              'rounded-full border px-4 py-2 font-sans text-[11px] font-semibold uppercase tracking-widest transition-colors',
              active === c.value
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-line text-muted hover:border-gold/40 hover:text-cream',
            )}
          >
            {c.label}
            <span className="ml-1.5 font-tamil">· {c.tamil}</span>
          </button>
        ))}
      </div>

      <div className="columns-2 gap-4 lg:columns-3 lg:gap-5 [column-fill:_balance]">
        {filtered.map((item, i) => (
          <motion.button
            key={item._id}
            type="button"
            onClick={() => setCurrent(item)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 6) * 0.06 }}
            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-md lg:mb-5"
            aria-label={`View ${item.title || item.category} photo`}
          >
            <SmartImage
              src={item.imageUrl}
              alt={item.title || `${item.category} photo at Sivasakthi men's salon`}
              aspect={i % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[3/4]'}
              imgClassName="transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {item.title && (
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-left font-tamil text-lg text-cream">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 line-clamp-1 text-left text-xs text-cream/70">{item.description}</p>
                )}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCurrent(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <button
              type="button"
              className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line text-cream"
              onClick={() => setCurrent(null)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line text-cream sm:left-6"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line text-cream sm:right-6"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="max-h-[85vh] max-w-5xl overflow-hidden rounded-md" onClick={(e) => e.stopPropagation()}>
              <SmartImage src={current.imageUrl} alt={current.title || 'Gallery photo'} aspect="aspect-auto" className="h-[70vh] w-auto max-w-full" eager />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
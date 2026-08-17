import { useMemo, useState } from 'react';
import { useHairstyles } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SmartImage } from '@/components/shared/SmartImage';
import { ErrorMessage, LoadingSpinner, EmptyState } from '@/components/ui/Feedback';
import { StyleFinder } from '@/features/styleFinder/StyleFinder';
import { ComboBuilder } from '@/features/styleFinder/ComboBuilder';
import { HAIRSTYLE_CATEGORY_LABELS } from '@/constants';
import { cn } from '@/lib/utils';
import { CtaSection } from '@/features/home/CtaSection';

export default function StylesPage() {
  const { data: hairstyles = [], isLoading, error } = useHairstyles();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = useMemo(
    () => [{ key: 'all', label: 'All', tamil: 'அனைத்தும்' }, ...Object.entries(HAIRSTYLE_CATEGORY_LABELS).map(([key, v]) => ({ key, ...v }))],
    [],
  );

  const filtered = useMemo(
    () => (activeCategory === 'all' ? hairstyles : hairstyles.filter((h) => h.category === activeCategory)),
    [hairstyles, activeCategory],
  );

  return (
    <div className="pt-28 pb-24 sm:pt-36">
      <div className="container-x">
        <SectionHeading
          eyebrow="Lookbook"
          englishTitle="Hairstyle showcase"
          title="ஒவ்வொரு முகத்திற்கும் ஒரு Style"
        />
      </div>

      <div className="container-x">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message="Styles-ஐ load செய்ய முடியவில்லை." />
        ) : hairstyles.length === 0 ? (
          <EmptyState title="Styles விரைவில் வரும்." />
        ) : (
          <>
            <div className="mb-10 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setActiveCategory(c.key)}
                  className={cn(
                    'rounded-full border px-4 py-2 font-sans text-[11px] font-semibold uppercase tracking-widest transition-colors',
                    activeCategory === c.key
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-line text-muted hover:border-gold/40 hover:text-cream',
                  )}
                >
                  {c.label}
                  <span className="ml-1.5 font-tamil">· {c.tamil}</span>
                </button>
              ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((style) => (
                <article
                  key={style._id}
                  id={style.englishName.toLowerCase().replace(/\s+/g, '-')}
                  className="group overflow-hidden rounded-md border border-line bg-ink-800"
                >
                  <div className="overflow-hidden">
                    <SmartImage
                      src={style.imageUrl}
                      alt={`${style.tamilName} (${style.englishName}) hairstyle at Sivasakthi men's salon`}
                      aspect="aspect-[4/3]"
                      imgClassName="transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-gold">
                      {HAIRSTYLE_CATEGORY_LABELS[style.category]?.label}
                    </p>
                    <h3 className="mt-1 font-tamil text-2xl text-cream">{style.tamilName}</h3>
                    <p className="font-sans text-xs uppercase tracking-widest text-muted">{style.englishName}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{style.description}</p>
                    {style.faceShapes.length > 0 && (
                      <p className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                        <span className="text-muted/60">Face:</span>
                        {style.faceShapes.map((f) => (
                          <span key={f} className="rounded-full border border-line px-2 py-0.5 capitalize">
                            {f}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <StyleFinder />
      <ComboBuilder />
      <CtaSection />
    </div>
  );
}
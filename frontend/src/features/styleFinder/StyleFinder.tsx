import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHairstyles } from '@/hooks/useContent';
import type { FaceShape, HairType, StyleType } from '@/types';
import { recommendHairstyles } from '@/features/styleFinder/engine';
import { FACE_SHAPES, STYLE_TYPES, HAIR_TYPES } from '@/constants';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SmartImage } from '@/components/shared/SmartImage';
import { ErrorMessage, LoadingSpinner, EmptyState } from '@/components/ui/Feedback';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Selection = FaceShape | StyleType | HairType | '';

export function StyleFinder() {
  const { data: hairstyles = [], isLoading, error } = useHairstyles();
  const [face, setFace] = useState<Selection>('');
  const [style, setStyle] = useState<Selection>('');
  const [hair, setHair] = useState<Selection>('');

  const results = useMemo(() => {
    if (!face || !style || !hair) return [];
    return recommendHairstyles(hairstyles, {
      faceShape: face as FaceShape,
      styleType: style as StyleType,
      hairType: hair as HairType,
    });
  }, [face, style, hair, hairstyles]);

  const active = Boolean(face && style && hair);

  const renderGrid = (
    options: { value: string; label: string; tamil?: string }[],
    selected: Selection,
    set: (v: Selection) => void,
  ) => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => set(selected === opt.value ? '' : (opt.value as Selection))}
          className={cn(
            'rounded-md border px-3 py-3 text-left transition-colors',
            selected === opt.value
              ? 'border-gold bg-gold/10'
              : 'border-line bg-ink-800 hover:border-gold/40',
          )}
        >
          <span className="block font-sans text-sm font-medium text-cream">{opt.label}</span>
          {'tamil' in opt && opt.tamil && (
            <span className="mt-0.5 block font-tamil text-xs text-muted">{opt.tamil}</span>
          )}
        </button>
      ))}
    </div>
  );

  const stepLabel = (title: string, sub: string) => (
    <div className="mb-4 flex items-baseline gap-3">
      <h3 className="font-tamil text-xl text-cream">{title}</h3>
      <span className="font-sans text-xs uppercase tracking-widest text-muted">{sub}</span>
    </div>
  );

  return (
    <section className="container-x py-24 lg:py-32" id="find-style">
      <SectionHeading
        eyebrow="Style Finder"
        englishTitle="Interactive recommendation"
        title="உனக்கான Style எது?"
        align="center"
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="mx-auto max-w-md">
          <ErrorMessage message="Could not load style options." />
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-9">
            <div>
              {stepLabel('Face Shape', 'முக வடிவம்')}
              {renderGrid(FACE_SHAPES, face, setFace)}
            </div>
            <div>
              {stepLabel('Preferred Style', 'விருப்ப ஸ்டைல்')}
              {renderGrid(STYLE_TYPES, style, setStyle)}
            </div>
            <div>
              {stepLabel('Hair Type', 'முடி வகை')}
              {renderGrid(HAIR_TYPES, hair, setHair)}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-line bg-ink-700 p-6">
              <p className="eyebrow mb-4">Recommendations</p>
              {!active ? (
                <EmptyState
                  title="உன் details-ஐ தேர்ந்தெடு"
                  body="முக வடிவம், ஸ்டைல், முடி வகை — மூன்றையும் தேர்ந்தெடுத்தால் உனக்கான hairstyles காட்டுவோம்."
                />
              ) : results.length === 0 ? (
                <EmptyState
                  title="மேலும் சில ஸ்டைல்கள்"
                  body="இந்த combination-க்கு இன்னும் styles சேர்க்கப்படவில்லை. நம் barbers-ஐ ask செய்வோம்!"
                />
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence>
                    {results.map((r, i) => (
                      <motion.li
                        key={r._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Link
                          to={`/styles#${r.englishName.toLowerCase().replace(/\s+/g, '-')}`}
                          className="group flex items-center gap-4 rounded-md p-2 transition-colors hover:bg-ink-800"
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md">
                            <SmartImage src={r.imageUrl} alt={r.englishName} aspect="aspect-square" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-tamil text-lg text-cream">{r.tamilName}</p>
                            <p className="truncate font-sans text-xs uppercase tracking-widest text-muted">
                              {r.englishName}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-gold" />
                        </Link>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
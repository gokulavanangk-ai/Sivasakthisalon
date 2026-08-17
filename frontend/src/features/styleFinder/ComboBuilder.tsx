import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getCombination, HAIR_CHOICES, BEARD_CHOICES } from './engine';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { cn } from '@/lib/utils';

export function ComboBuilder() {
  const [hair, setHair] = useState('classic');
  const [beard, setBeard] = useState('stubble');

  const combo = useMemo(() => getCombination(hair, beard), [hair, beard]);

  const renderSelect = (
    label: string,
    sub: string,
    options: { value: string; label: string; tamil: string }[],
    value: string,
    onChange: (v: string) => void,
  ) => (
    <div>
      <div className="mb-4 flex items-baseline gap-3">
        <h3 className="font-tamil text-xl text-cream">{label}</h3>
        <span className="font-sans text-xs uppercase tracking-widest text-muted">{sub}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md border px-3 py-3 text-left transition-colors',
              value === opt.value ? 'border-gold bg-gold/10' : 'border-line bg-ink-800 hover:border-gold/40',
            )}
          >
            <span className="block font-sans text-sm font-medium text-cream">{opt.label}</span>
            <span className="mt-0.5 block font-tamil text-xs text-muted">{opt.tamil}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className="container-x py-24 lg:py-32" id="combos">
      <SectionHeading
        eyebrow="Hair + Beard"
        englishTitle="Style combination studio"
        title="ஹேர் + பியர்டு Combo"
        align="center"
      />

      <div className="mx-auto max-w-5xl">
        <div className="space-y-9 rounded-md border border-line bg-ink-800/60 p-6 sm:p-8">
          {renderSelect('Hair', 'ஹேர்', HAIR_CHOICES, hair, setHair)}
          {renderSelect('Beard', 'பியர்டு', BEARD_CHOICES, beard, setBeard)}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${hair}-${beard}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-start justify-between gap-5 rounded-md border border-gold/30 bg-ink-700 p-6 sm:flex-row sm:items-center"
            >
              <div>
                <h4 className="font-tamil text-2xl text-gold">{combo.headline}</h4>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">{combo.description}</p>
                <p className="mt-2 font-sans text-xs uppercase tracking-widest text-cream/70">
                  {combo.hair} + {combo.beard}
                </p>
              </div>
              <a href="/booking" className="btn-primary shrink-0" aria-label="Book this combination">
                Book Combo <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
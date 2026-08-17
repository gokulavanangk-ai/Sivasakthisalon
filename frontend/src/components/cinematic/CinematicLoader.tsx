import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Scissors } from 'lucide-react';

interface CinematicLoaderProps {
  onDone: () => void;
}

const SEQUENCE = [
  { step: 'brand', ms: 700 },
  { step: 'tagline', ms: 1200 },
];

function useLoaderDone(): boolean {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const total = SEQUENCE.reduce((a, s) => a + s.ms, 0);
    const t = window.setTimeout(() => setDone(true), total);
    return () => window.clearTimeout(t);
  }, []);
  return done;
}

export function CinematicLoader({ onDone }: CinematicLoaderProps) {
  const [step, setStep] = useState<'brand' | 'tagline'>('brand');
  const done = useLoaderDone();

  useEffect(() => {
    const t1 = window.setTimeout(() => setStep('tagline'), SEQUENCE[0].ms);
    return () => window.clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (done) {
      const t = window.setTimeout(onDone, 600);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [done, onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          aria-hidden="true"
          role="status"
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-gold/50"
            >
              <Scissors className="h-7 w-7 text-gold" strokeWidth={1.25} />
            </motion.div>
            <p className="font-tamil text-center text-2xl tracking-wide text-cream sm:text-3xl">
              சிவசக்தி
            </p>
            <p className="mt-1 font-tamilSans text-sm tracking-[0.5em] text-muted">
              சிகை அலங்காரம்
            </p>

            <AnimatePresence mode="wait">
              {step === 'tagline' && (
                <motion.div
                  key="tagline"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mt-12 flex flex-col items-center"
                >
                  <div className="gold-line w-40" />
                  <p className="mt-6 font-tamil text-center text-lg text-gold">
                    ஒவ்வொரு வெட்டிலும் ஒரு கதை.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="absolute bottom-12 h-px overflow-hidden bg-white/10"
            style={{ width: 160 }}
          >
            <motion.div
              className="h-full bg-gold"
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 2.2, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
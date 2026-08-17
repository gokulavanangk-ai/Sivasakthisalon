import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useSalon, useFaqs } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { ErrorMessage, LoadingSpinner } from '@/components/ui/Feedback';
import { cn } from '@/lib/utils';

interface FaqItem {
  q: string;
  a: string;
}

const FALLBACK_FAQS: FaqItem[] = [
  {
    q: 'How do I book an appointment?',
    a: 'Tap "BOOK NOW" anywhere on the site and pick your service, date and time. You will see a confirmation immediately and we will call you to confirm the slot.',
  },
  {
    q: 'Can I walk in without a booking?',
    a: 'Yes, walk-ins are always welcome. Booking ahead simply means less waiting and a guaranteed slot at your preferred time.',
  },
  {
    q: 'Do I need to pay online?',
    a: 'No. Booking is completely free and you only pay at the salon after your service.',
  },
  {
    q: 'What if I need to cancel or reschedule?',
    a: 'Just call us or message us on WhatsApp and we will shift your booking to another time that suits you. No charges, no hassle.',
  },
  {
    q: 'What are the opening hours?',
    a: 'Check the Opening Hours section on the Contact page for the latest schedule, including Sunday timings.',
  },
];

export function FaqSection() {
  const { data: salon } = useSalon();
  const { data: faqs, isLoading, error } = useFaqs();
  const enabled = salon?.toggles?.faqEnabled !== false;
  const [open, setOpen] = useState<number | null>(0);

  if (!enabled) return null;

  const items: FaqItem[] = (faqs ?? []).length > 0
    ? (faqs ?? []).map((f) => ({ q: f.question, a: f.answer }))
    : FALLBACK_FAQS;

  const heading = salon?.sections?.faq ?? {
    eyebrow: 'FAQ',
    englishTitle: 'Answers',
    title: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
  };

  return (
    <section className="container-x max-w-4xl py-24 lg:py-28" id="faq">
      <SectionHeading
        eyebrow={heading.eyebrow}
        englishTitle={heading.englishTitle}
        title={heading.title}
        align="center"
      />

      {isLoading ? (
        <LoadingSpinner label="Loading FAQ" />
      ) : error ? (
        <ErrorMessage message="Could not load the FAQ." />
      ) : (
        <div className="space-y-3">
          {items.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-md border border-line bg-ink-700">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-sans text-base font-medium text-cream">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-gold transition-transform duration-300',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-line px-5 py-4 text-sm leading-relaxed text-muted">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
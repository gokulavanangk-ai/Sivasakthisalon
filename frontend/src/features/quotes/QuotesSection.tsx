import { useQuotes } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';
import { ErrorMessage, LoadingSpinner } from '@/components/ui/Feedback';

/**
 * Displays reusable quotes that are shown across the site from the shared
 * `quotes` collection (single source of truth). Only renders when there is at
 * least one active quote. Quotes are read from the same MongoDB records the
 * admin edits, so a change anywhere updates every page instantly.
 */
export function QuotesSection({ source = 'general' }: { source?: 'home' | 'about' | 'contact' | 'general' }) {
  const { data: quotes = [], isLoading, error } = useQuotes({ source });
  const active = quotes.filter((q) => q.isActive);

  if (isLoading) return <LoadingSpinner label="Loading quotes" />;
  if (error) {
    return (
      <div className="container-x py-16">
        <ErrorMessage message="Could not load quotes." />
      </div>
    );
  }
  if (active.length === 0) return null;

  return (
    <section className="container-x py-24 lg:py-32" id="quotes">
      <SectionHeading
        eyebrow="Quotes"
        englishTitle="Words we live by"
        title="நம்பிக்கையின் வரிகள்"
        align="center"
      />
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        {active.map((quote, i) => (
          <Reveal key={quote._id} delay={(i % 2) * 0.08}>
            <figure
              className={`flex h-full flex-col justify-between rounded-md border border-line bg-ink-700 p-7 ${
                quote.image?.url ? 'sm:flex-row sm:items-center sm:gap-6' : ''
              }`}
            >
              {quote.image?.url && (
                <img
                  src={quote.image.url}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
              )}
              <div className="flex-1">
                <blockquote className="font-tamil text-base leading-relaxed text-cream/90">
                  “{quote.text}”
                </blockquote>
                {(quote.author || quote.role) && (
                  <figcaption className="mt-4 border-t border-line pt-3">
                    <p className="font-sans text-sm font-semibold text-cream">
                      {quote.author ? `— ${quote.author}` : ''}
                      {quote.role ? <span className="font-normal text-muted"> · {quote.role}</span> : ''}
                    </p>
                  </figcaption>
                )}
              </div>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

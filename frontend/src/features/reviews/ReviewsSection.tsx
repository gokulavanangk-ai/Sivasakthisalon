import { Star, Quote } from 'lucide-react';
import { useReviews } from '@/hooks/useContent';
import { useSalon } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';
import { ErrorMessage, LoadingSpinner } from '@/components/ui/Feedback';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? 'h-4 w-4 fill-gold text-gold drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]'
              : 'h-4 w-4 text-muted/30'
          }
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const { data: salon } = useSalon();
  const enabled = salon?.toggles?.reviewsEnabled !== false;
  const { data: reviews = [], isLoading, error } = useReviews();

  if (!enabled) return null;
  if (isLoading) return <LoadingSpinner label="Loading reviews" />;
  if (error) {
    return (
      <div className="container-x py-16">
        <ErrorMessage message="Could not load reviews." />
      </div>
    );
  }
  if (reviews.length === 0) return null;

  const heading = salon?.sections?.testimonials ?? {
    eyebrow: 'Testimonials',
    englishTitle: 'What our customers think',
    title: 'எங்களை நம்பியவர்கள்',
  };

  return (
    <section className="container-x relative py-24 lg:py-32" id="reviews">
      {/* ambient backdrop glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-[380px] max-w-5xl bg-gold/10 blur-[130px]"
      />

      <SectionHeading
        eyebrow={heading.eyebrow}
        englishTitle={heading.englishTitle}
        title={heading.title}
        align="center"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, i) => (
          <Reveal key={review._id} delay={(i % 3) * 0.08}>
            <figure className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line/80 bg-ink-700/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:bg-ink-700 hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.75)]">
              {/* watermark quote mark */}
              <Quote
                aria-hidden
                className="absolute -right-2 -top-2 h-20 w-20 rotate-6 text-gold/[0.06] transition-transform duration-700 group-hover:rotate-3 group-hover:text-gold/[0.1]"
                strokeWidth={1}
              />

              {/* hover edge glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(160px circle at 20% 0%, rgba(212,175,55,0.10), transparent 70%)',
                }}
              />

              <div className="relative">
                <Stars rating={review.rating} />
              </div>

              <blockquote className="relative mt-4 flex-1 font-tamil text-base leading-relaxed text-cream/90">
                “{review.text}”
              </blockquote>

              <figcaption className="relative mt-6 flex items-center gap-3 border-t border-line/70 pt-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-ink-800 font-tamil text-gold shadow-[0_0_16px_rgba(212,175,55,0.25)] transition-shadow duration-500 group-hover:shadow-[0_0_24px_rgba(212,175,55,0.4)]">
                  {review.initial || review.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-sans text-sm font-semibold text-cream">{review.name}</p>
                  {review.service && (
                    <p className="font-sans text-xs uppercase tracking-widest text-muted">{review.service}</p>
                  )}
                </div>
              </figcaption>

              {/* animated underline accent */}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
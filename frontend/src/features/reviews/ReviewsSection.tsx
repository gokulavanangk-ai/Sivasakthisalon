import { Star } from 'lucide-react';
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
          className={i < rating ? 'h-4 w-4 fill-gold text-gold' : 'h-4 w-4 text-muted/40'}
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
    <section className="container-x py-24 lg:py-32" id="reviews">
      <SectionHeading
        eyebrow={heading.eyebrow}
        englishTitle={heading.englishTitle}
        title={heading.title}
        align="center"
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, i) => (
          <Reveal key={review._id} delay={(i % 3) * 0.08}>
            <figure className="flex h-full flex-col rounded-md border border-line bg-ink-700 p-6">
              <Stars rating={review.rating} />
              <blockquote className="mt-4 flex-1 font-tamil text-base leading-relaxed text-cream/90">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 font-tamil text-gold">
                  {review.initial || review.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-sans text-sm font-semibold text-cream">{review.name}</p>
                  {review.service && (
                    <p className="font-sans text-xs uppercase tracking-widest text-muted">{review.service}</p>
                  )}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
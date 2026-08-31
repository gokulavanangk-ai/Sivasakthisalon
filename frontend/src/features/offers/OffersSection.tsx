import { useSalon } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';
import { SmartImage } from '@/components/shared/SmartImage';

export function OffersSection() {
  const { data: salon } = useSalon();
  const enabled = salon?.toggles?.offersEnabled === true;
  const offers = salon?.offers;
  const items = (offers?.items ?? []).filter((o) => o.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  if (!enabled || items.length === 0) return null;

  const heading = {
    eyebrow: offers?.eyebrow ?? 'Offers',
    englishTitle: offers?.englishTitle ?? 'Current offers',
    title: offers?.title ?? 'சலுகைகள்',
  };

  return (
    <section className="container-x relative py-24 lg:py-28" id="offers">
      {/* ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[420px] max-w-4xl bg-gold/10 blur-[120px]"
      />

      <SectionHeading eyebrow={heading.eyebrow} englishTitle={heading.englishTitle} title={heading.title} align="center" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((offer, i) => (
          <Reveal key={i} delay={(i % 3) * 0.08}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line/80 bg-ink-700 shadow-[0_0_0_1px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
              {/* gold edge glow on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(140px circle at var(--x,50%) var(--y,0%), rgba(212,175,55,0.12), transparent 70%)',
                }}
              />

              {offer.badge && (
                <span className="absolute right-3 top-3 z-20 rounded-full bg-gold px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-ink shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                  {offer.badge}
                </span>
              )}

              {offer.imageUrl ? (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <SmartImage
                    src={offer.imageUrl}
                    alt={offer.title}
                    aspect="aspect-auto"
                    className="h-full w-full"
                    imgClassName="transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  />
                  {/* cinematic vignette so the card melts into the panel below */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-700 via-ink-700/10 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-ink-800">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-40 transition-transform duration-[1200ms] group-hover:scale-110"
                    style={{
                      background:
                        'radial-gradient(60% 60% at 50% 40%, rgba(212,175,55,0.25), transparent 70%)',
                    }}
                  />
                  <span className="relative font-tamil text-4xl text-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                    சி
                  </span>
                </div>
              )}

              <div className="relative flex flex-1 flex-col p-5">
                <h3 className="font-tamil text-xl text-cream transition-colors duration-300 group-hover:text-gold">
                  {offer.title}
                </h3>
                {offer.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{offer.description}</p>
                )}

                {(offer.price != null || offer.originalPrice != null) && (
                  <div className="mt-auto flex items-end gap-2 pt-4">
                    {offer.originalPrice != null && (
                      <span className="font-sans text-sm text-muted line-through decoration-muted/60">
                        ₹{offer.originalPrice}
                      </span>
                    )}
                    {offer.price != null && (
                      <span className="font-sans text-2xl font-bold tracking-tight text-gold [text-shadow:0_0_18px_rgba(212,175,55,0.35)]">
                        ₹{offer.price}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* thin animated underline accent */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
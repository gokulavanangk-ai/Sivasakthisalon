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
    <section className="container-x py-24 lg:py-28" id="offers">
      <SectionHeading eyebrow={heading.eyebrow} englishTitle={heading.englishTitle} title={heading.title} align="center" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((offer, i) => (
          <Reveal key={i} delay={(i % 3) * 0.08}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-md border border-line bg-ink-700">
              {offer.badge && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-gold px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-ink">
                  {offer.badge}
                </span>
              )}
              {offer.imageUrl ? (
                <div className="aspect-[16/9] overflow-hidden">
                  <SmartImage src={offer.imageUrl} alt={offer.title} aspect="aspect-auto" className="h-full w-full" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-ink-800">
                  <span className="font-tamil text-4xl text-gold">சி</span>
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-tamil text-xl text-cream">{offer.title}</h3>
                {offer.description && <p className="mt-2 text-sm leading-relaxed text-muted">{offer.description}</p>}
                {(offer.price != null || offer.originalPrice != null) && (
                  <div className="mt-4 flex items-end gap-2">
                    {offer.originalPrice != null && (
                      <span className="font-sans text-sm text-muted line-through">₹{offer.originalPrice}</span>
                    )}
                    {offer.price != null && (
                      <span className="font-sans text-xl font-bold text-gold">₹{offer.price}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
import { useSalon } from '@/hooks/useContent';
import { Reveal, RevealText } from '@/components/shared/Reveal';
import { SmartImage } from '@/components/shared/SmartImage';
import { businessInfoOf } from '@/lib/utils';

export function StorySection() {
  const { data: salon } = useSalon();
  const bi = businessInfoOf(salon);
  const years = bi.experienceYears || 0;
  const heading = salon?.sections?.about?.heading || `${years} ஆண்டுகளின் அனுபவம். ஒரே நோக்கம்.`;
  const body =
    salon?.sections?.about?.body ||
    `${years} ஆண்டுகளாக, தோற்றத்தை மட்டும் மாற்றாமல், ஒவ்வொரு வாடிக்கையாளரின் தனித்துவத்தையும் அவர்களின் ஸ்டைலாக மாற்றி வருகிறோம்.`;
  const imageUrl = salon?.sections?.about?.imageUrl || salon?.about?.imageUrl;
  const eyebrow = salon?.sections?.about?.eyebrow ?? 'Our Story';
  const storyNote = salon?.sections?.about?.storyNote ?? 'இங்கு ஒவ்வொரு நாற்காலியும் ஒரு கதைசொல்லி. உன் வருகை அதன் அடுத்த அத்தியாயம்.';
  const yearsLabel = salon?.sections?.about?.yearsLabel ?? 'Years of Craft';

  return (
    <section className="container-x grid items-center gap-14 py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:py-32" id="story">
      <div className="order-2 lg:order-1">
        <Reveal>
          <p className="eyebrow mb-4">{eyebrow}</p>
        </Reveal>
        <RevealText className="h-display text-3xl sm:text-4xl lg:text-[3.4rem]" delay={0.05}>
          {heading}
        </RevealText>
        <Reveal delay={0.15}>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-muted">{body}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mt-10 max-w-md font-tamil text-lg leading-relaxed text-cream/90">
            {storyNote}
          </p>
        </Reveal>
      </div>

      <div className="order-1 lg:order-2">
        <Reveal className="relative">
          <div className="overflow-hidden">
            <SmartImage
              src={imageUrl}
              alt="Sivasakthi men's salon interior craftsmanship"
              aspect="aspect-[4/5]"
            />
          </div>
          <div className="absolute -bottom-6 -right-4 hidden rounded-md border border-line bg-ink-800/90 px-8 py-6 backdrop-blur sm:block">
            <p className="font-display text-5xl text-gold">{years}+</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted">{yearsLabel}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
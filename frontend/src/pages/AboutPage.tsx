import { Reveal, RevealText } from '@/components/shared/Reveal';
import { SmartImage } from '@/components/shared/SmartImage';
import { useSalon, useServices, useHairstyles, useGallery } from '@/hooks/useContent';
import { CtaSection } from '@/features/home/CtaSection';
import { Marquee } from '@/components/shared/Marquee';
import { businessInfoOf } from '@/lib/utils';

const VALUES = [
  {
    tamil: 'நேர்மை',
    english: 'Honesty',
    body: 'உனக்கு பிடிக்கும் style-ஐ மட்டும் சொல்வதில்லை — உனக்கு suit ஆகும் style-ஐ சொல்வோம்.',
  },
  {
    tamil: 'புதுமை',
    english: 'Craft',
    body: 'Blend, fade, texture — ஒவ்வொரு cut-ஐயும் ஃவினிஷ் வரை கவனத்துடன் செய்வோம்.',
  },
  {
    tamil: 'நிலைத்தன்மை',
    english: 'Consistency',
    body: 'மாறாத நேர்த்தி, மாறாத அன்பு, மாறாத தரம். மாறியது எங்கள் ஸ்டைல்கள் மட்டுமே.',
  },
];

export default function AboutPage() {
  const { data: salon } = useSalon();
  const { data: services } = useServices();
  const { data: hairstyles } = useHairstyles();
  const { data: gallery } = useGallery();
  const bi = businessInfoOf(salon);
  const years = bi.experienceYears;

  const stats = [
    { value: `${years}+`, label: 'Years of craft' },
    { value: services?.items?.length ?? 0, label: 'Services' },
    { value: hairstyles?.length ?? 0, label: 'Signature styles' },
    { value: gallery?.length ?? 0, label: 'Gallery moments' },
    ...(bi.happyCustomers ? [{ value: bi.happyCustomers.toLocaleString('en-IN') + '+', label: 'Happy customers' }] : []),
    ...(bi.professionalBarbers ? [{ value: `${bi.professionalBarbers}+`, label: 'Professional barbers' }] : []),
  ];

  return (
    <div className="pt-28 pb-24 sm:pt-36">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow mb-4">About Us</p>
        </Reveal>
        <RevealText className="h-display max-w-3xl text-4xl sm:text-6xl">
          {salon?.about?.heading || `${years} ஆண்டுகளின் அனுபவம். ஒரே நோக்கம்.`}
        </RevealText>
      </div>

      <div className="container-x mt-16 grid gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="overflow-hidden rounded-md">
            <SmartImage src={salon?.about?.imageUrl} alt={`Inside ${bi.salonName}`} aspect="aspect-[4/5]" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="lg:pt-8">
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              {salon?.about?.body ||
                `${years} ஆண்டுகளாக, தோற்றத்தை மட்டும் மாற்றாமல், ஒவ்வொரு வாடிக்கையாளரின் தனித்துவத்தையும் அவர்களின் ஸ்டைலாக மாற்றி வருகிறோம்.`}
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/85">
              {bi.address} — இங்கே ஒவ்வொரு நாற்காலியும் ஒரு கதைசொல்லி. கிளாசிக் cut முதல் bold fade வரை, நம்மோட {years} வருட அனுபவம் ஒவ்வொரு கத்தரி இயக்கத்திலும் காட்டும்.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={0.05 * i}>
                  <p className="font-display text-4xl text-gold">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="container-x mt-24">
        <Marquee items={['Trusted since day one', `${years}+ years`, 'Local · Family · Premium']} />
      </div>

      <div className="container-x mt-24 grid gap-6 md:grid-cols-3">
        {VALUES.map((v, i) => (
          <Reveal key={v.english} delay={i * 0.08}>
            <div className="card h-full p-7">
              <p className="font-tamil text-2xl text-gold">{v.tamil}</p>
              <p className="mt-1 font-sans text-[11px] font-semibold uppercase tracking-widest text-muted">
                {v.english}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">{v.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <CtaSection />
    </div>
  );
}
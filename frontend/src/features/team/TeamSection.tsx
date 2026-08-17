import { useBarbers, useSalon } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';
import { businessInfoOf } from '@/lib/utils';

export function TeamSection() {
  const { data: salon } = useSalon();
  const bi = businessInfoOf(salon);
  const enabled = salon?.toggles?.teamEnabled === true;
  const { data } = useBarbers();
  const barbers = (data?.items ?? []).filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  if (!enabled) return null;

  const fallbackBarbers = [
    { name: bi.salonName, tamilName: bi.tamilName, specialty: 'Founder · Master barber' },
    { name: 'Expert Team', tamilName: 'நிபுணர் குழு', specialty: 'Fades · Beard · Cleanup' },
  ];

  const members = barbers.length > 0
    ? barbers.map((b) => ({ name: b.name, tamilName: b.tamilName, specialty: b.specialty }))
    : fallbackBarbers;

  const heading = salon?.sections?.team ?? {
    eyebrow: 'TEAM',
    englishTitle: 'The barbers',
    title: 'கைவண்ணம் காட்டுபவர்கள்',
  };

  return (
    <section className="container-x py-24 lg:py-28" id="team">
      <SectionHeading eyebrow={heading.eyebrow} englishTitle={heading.englishTitle} title={heading.title} align="center" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member, i) => (
          <Reveal key={member.name} delay={(i % 4) * 0.08}>
            <div className="flex h-full flex-col items-center rounded-md border border-line bg-ink-700 p-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 font-tamil text-2xl text-gold">
                {member.tamilName?.charAt(0) || member.name.charAt(0)}
              </span>
              <h3 className="mt-4 font-sans text-lg font-semibold text-cream">{member.name}</h3>
              {member.tamilName && <p className="font-tamil text-base text-gold/80">{member.tamilName}</p>}
              {member.specialty && <p className="mt-2 text-xs uppercase tracking-widest text-muted">{member.specialty}</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
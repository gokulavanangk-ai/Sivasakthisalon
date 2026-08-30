import { useCallback, useMemo, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { useGallery, useSalon } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { mediaTypeOf, mediaUrlOf } from '@/lib/utils';

interface Pair {
  id: string;
  label: string;
  before: string;
  after: string;
}

function buildPairs(items: { _id: string; title: string; imageUrl: string; media?: { url?: string; mediaType?: string } }[]): Pair[] {
  const images = items.filter((item) => mediaTypeOf(item) === 'image');
  const map = new Map<string, Pair>();
  for (const item of images) {
    const t = item.title?.trim() ?? '';
    const before = t.match(/(.+)\s+before$/i);
    const after = t.match(/(.+)\s+after$/i);
    const key = before?.[1] ?? after?.[1];
    if (!key) continue;
    if (!map.has(key)) map.set(key, { id: key, label: key, before: '', after: '' });
    const pair = map.get(key)!;
    const url = mediaUrlOf(item);
    if (before && !pair.before) pair.before = url;
    if (after && !pair.after) pair.after = url;
  }
  return [...map.values()].filter((p) => p.before && p.after);
}

function BeforeAfterSlider({ pair }: { pair: Pair }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointer = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(95, Math.max(5, pct)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="group relative aspect-[4/3] select-none overflow-hidden rounded-md border border-line"
      onPointerDown={(e) => onPointer(e.clientX)}
      onPointerMove={(e) => e.buttons > 0 && onPointer(e.clientX)}
      onPointerUp={() => undefined}
      role="slider"
      aria-label={`Before and after comparison for ${pair.label}`}
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setPos((p) => Math.max(5, p - 5));
        if (e.key === 'ArrowRight') setPos((p) => Math.min(95, p + 5));
      }}
    >
      <img src={pair.before} alt={`${pair.label} before`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={pair.after} alt={`${pair.label} after`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/80">
        Before
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-gold px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-widest text-ink">
        After
      </span>
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-cream"
        style={{ left: `${pos}%` }}
        aria-hidden="true"
      >
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-ink">
          <MoveHorizontal className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

export function BeforeAfterSection() {
  const { data: salon } = useSalon();
  const enabled = salon?.toggles?.beforeAfterEnabled === true;
  const { data: gallery = [] } = useGallery();

  const pairs = useMemo(() => buildPairs(gallery), [gallery]);

  if (!enabled || pairs.length === 0) return null;

  const heading = salon?.sections?.beforeAfter ?? {
    eyebrow: 'Before / After',
    englishTitle: 'The transformation',
    title: 'மாற்றத்தின் கதை',
  };

  return (
    <section className="container-x py-24 lg:py-32" id="before-after">
      <SectionHeading
        eyebrow={heading.eyebrow}
        englishTitle={heading.englishTitle}
        title={heading.title}
        align="center"
      />
      <div className="mx-auto grid max-w-4xl gap-10">
        {pairs.slice(0, 2).map((pair) => (
          <div key={pair.id}>
            <BeforeAfterSlider pair={pair} />
            <p className="mt-3 text-center font-tamil text-lg text-cream">{pair.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
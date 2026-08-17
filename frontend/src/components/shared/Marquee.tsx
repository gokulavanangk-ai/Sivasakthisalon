import { useReducedMotion } from '@/hooks/useMedia';

export function Marquee({ items }: { items: string[] }) {
  const reduced = useReducedMotion();

  const row = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-line py-5 mask-fade-x">
      <div
        className="flex w-max whitespace-nowrap"
        style={
          reduced
            ? undefined
            : {
                animation: 'marquee 32s linear infinite',
              }
        }
      >
        {row.map((item, i) => (
          <span key={i} className="mx-6 flex items-center gap-6">
            <span className="font-tamil text-xl text-cream/70">{item}</span>
            <span aria-hidden="true" className="text-gold">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FadeIn } from './Reveal';

export function SectionHeading({
  eyebrow,
  title,
  englishTitle,
  className,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  englishTitle?: string;
  className?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={cn('mb-12', align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <FadeIn>
          <p className={cn('eyebrow mb-4', align === 'center' && 'flex justify-center')}>{eyebrow}</p>
        </FadeIn>
      )}
      <h2 className="h-display text-3xl sm:text-4xl lg:text-[3.4rem]">{title}</h2>
      {englishTitle && (
        <FadeIn delay={0.12}>
          <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-widest2 text-muted">
            {englishTitle}
          </p>
        </FadeIn>
      )}
    </div>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <div className="text-sm leading-relaxed text-muted">{children}</div>;
}
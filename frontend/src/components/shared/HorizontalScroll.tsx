import { useRef, type ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/useMedia';

interface HorizontalScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

export function HorizontalScroll<T>({ items, renderItem, className }: HorizontalScrollProps<T>) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const trackRef = useRef<HTMLDivElement>(null);

  if (isDesktop) {
    return (
      <div className="relative">
        <div
          className="flex gap-6 overflow-x-auto overflow-y-hidden pb-6"
          ref={trackRef}
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {items.map((item, i) => (
            <div key={i} className={className} style={{ scrollSnapAlign: 'start' }}>
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4" style={{ scrollSnapType: 'x mandatory' }}>
      {items.map((item, i) => (
        <div key={i} className={className} style={{ scrollSnapAlign: 'start' }}>
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}
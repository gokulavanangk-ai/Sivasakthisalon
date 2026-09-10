import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw, Inbox, MapPin } from 'lucide-react';

export function LoadingSpinner({ className, label = 'Loading…' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16', className)} role="status" aria-live="polite">
      <span className="relative h-9 w-9">
        <span className="absolute inset-0 rounded-full border border-gold/20" />
        <span className="absolute inset-0 animate-spin rounded-full border-t border-gold" />
      </span>
      <span className="font-sans text-xs uppercase tracking-widest text-muted">{label}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-md bg-ink-700/90',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent',
        className,
      )}
    />
  );
}

export function ServicesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading services">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex h-56 flex-col justify-between rounded-md border border-line bg-ink-700/60 p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-1.5 pt-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-line/60 pt-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HairstylesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading hairstyles">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-md border border-line bg-ink-800">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <div className="space-y-1 pt-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading reviews">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex h-64 flex-col justify-between rounded-xl border border-line/80 bg-ink-700/80 p-6">
          <div className="space-y-4">
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-4 rounded-full" />
              ))}
            </div>
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-line/70 pt-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function GallerySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="columns-2 gap-4 lg:columns-3 lg:gap-5 [column-fill:_balance]" aria-busy="true" aria-label="Loading gallery">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mb-4 break-inside-avoid lg:mb-5">
          <Skeleton className={cn('w-full rounded-md', i % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[3/4]')} />
        </div>
      ))}
    </div>
  );
}

export function TeamSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading team">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex h-56 flex-col items-center justify-center rounded-md border border-line bg-ink-700 p-6 text-center">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="mt-4 h-5 w-28" />
          <Skeleton className="mt-2 h-4 w-20" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function QuotesSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2" aria-busy="true" aria-label="Loading quotes">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex h-48 flex-col justify-between rounded-md border border-line bg-ink-700 p-7">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="border-t border-line pt-3">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StyleFinderSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_1fr]" aria-busy="true" aria-label="Loading style finder">
      <div className="space-y-9">
        {[1, 2, 3].map((s) => (
          <div key={s} className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="h-14 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-line bg-ink-700 p-6">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 flex flex-col items-center justify-center gap-3 py-12">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>
  );
}

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex h-[400px] min-h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-md border border-line bg-ink-800', className)} aria-busy="true" aria-label="Loading map">
      <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <MapPin className="h-8 w-8 animate-bounce text-gold/60" />
        <span className="font-sans text-xs uppercase tracking-widest text-muted">Loading Map…</span>
      </div>
    </div>
  );
}

export function ErrorMessage({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-4 rounded-lg border border-red-500/20 bg-red-500/[0.03] p-8 text-center', className)}>
      <AlertCircle className="h-7 w-7 text-red-400" />
      <p className="max-w-md text-sm text-cream/90">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 font-sans text-xs font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-ink"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  className,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 rounded-lg border border-line/60 bg-ink-800/40 py-16 px-6 text-center', className)}>
      <Inbox className="h-8 w-8 text-muted/50" />
      <p className="font-tamil text-xl text-cream/90">{title}</p>
      {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center rounded-full border border-gold/40 px-5 py-2 font-sans text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold/10"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
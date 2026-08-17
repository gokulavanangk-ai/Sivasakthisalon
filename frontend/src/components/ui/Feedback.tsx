import { cn } from '@/lib/utils';

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
        'relative overflow-hidden rounded-md bg-ink-700',
        'after:absolute after:inset-0 after:translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent after:animate-shimmer',
        className,
      )}
    />
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
    <div role="alert" className={cn('flex flex-col items-center gap-4 py-12 text-center', className)}>
      <p className="max-w-md text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold uppercase tracking-widest text-gold underline-offset-4 hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="font-tamil text-lg text-cream/80">{title}</p>
      {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
    </div>
  );
}
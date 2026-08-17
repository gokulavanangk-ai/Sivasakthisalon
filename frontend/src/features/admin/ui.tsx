import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/types';

export function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    confirmed: 'bg-green-500/10 text-green-300 border-green-500/30',
    completed: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    cancelled: 'bg-red-500/10 text-red-300 border-red-500/30',
    rejected: 'bg-red-500/10 text-red-300 border-red-500/30',
  };
  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize', styles[status])}>
      {status}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1">
      <span className="text-sm text-cream/85">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-gold' : 'bg-ink-500',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-cream transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  );
}

export function AdminCard({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-md border border-line bg-ink-800/60 p-6', className)}>
      {title && <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-widest text-muted">{title}</h3>}
      {children}
    </div>
  );
}

export function ConfirmButton({
  onConfirm,
  children,
  busy,
}: {
  onConfirm: () => void;
  children: React.ReactNode;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onConfirm}
      className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
    >
      {busy ? '...' : children}
    </button>
  );
}
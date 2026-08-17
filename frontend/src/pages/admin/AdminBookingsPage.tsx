import { Fragment, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminBookings } from '@/services/api';
import { sendBookingStatusEmail, statusNotificationFor } from '@/services/email';
import { useBookingStatusMutation } from '@/features/admin/mutations';
import { StatusBadge, AdminCard } from '@/features/admin/ui';
import { BOOKING_STATUS } from '@/constants';
import { displayDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, BookingStatus } from '@/types';

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', { page, status, search }],
    queryFn: () => fetchAdminBookings({ page, status: status || undefined, q: search || undefined }),
  });

  const statusMut = useBookingStatusMutation();

  const items = data?.items ?? [];
  const pages = Math.max(1, data?.pages ?? 1);

  // Tracks the last status whose notification we already sent for each booking,
  // so submitting the same status again (even before the list refetches) can
  // never fire a duplicate email.
  const notified = useRef<Map<string, BookingStatus>>(new Map());

  const setStatusFor = (b: Booking, next: BookingStatus) => {
    // Never re-apply the same status (and never re-send its email).
    if (b.status === next) return;
    if (statusMut.isPending) return;
    if (notified.current.get(b.bookingId) === next) return;

    statusMut.mutate(
      { id: b._id, status: next },
      {
        onSuccess: () => {
          if (next === 'confirmed' || next === 'rejected') {
            // Notification is fire-and-forget; a send failure never affects the
            // status update that already succeeded on the backend.
            notified.current.set(b.bookingId, next);
            const { status, status_message } = statusNotificationFor(next);
            void sendBookingStatusEmail({
              customer_name: b.name,
              customer_email: b.email,
              phone: b.phone,
              service: b.service,
              date: b.date,
              time: b.time,
              booking_id: b.bookingId,
              status,
              status_message,
            });
          }
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bookings</h1>
          <p className="mt-1 text-sm text-zinc-500">Appointments from customers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-white/10 bg-[#151515] px-3 py-2 text-sm text-zinc-200 focus:border-gold/60 focus:outline-none"
          >
            <option value="">All statuses</option>
            {BOOKING_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q);
              setPage(1);
            }}
            className="flex gap-2"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name / phone / ID"
              className="w-52 rounded-md border border-white/10 bg-[#151515] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-gold/60 focus:outline-none"
            />
            <button type="submit" className="rounded-md bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/20">
              Search
            </button>
          </form>
        </div>
      </div>

      {isLoading ? (
        <p className="py-10 text-sm text-zinc-500">Loading…</p>
      ) : items.length === 0 ? (
        <AdminCard>
          <p className="py-6 text-center text-sm text-zinc-500">No bookings match this filter.</p>
        </AdminCard>
      ) : (
        <AdminCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((b) => (
                  <Fragment key={b._id}>
                    <tr
                      className={cn('cursor-pointer hover:bg-white/[0.02]', expanded === b._id && 'bg-white/[0.03]')}
                      onClick={() => setExpanded(expanded === b._id ? null : b._id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{b.name}</p>
                        <p className="text-xs text-zinc-500">{b.bookingId}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {b.service}
                        {b.barber && <span className="block text-xs text-zinc-500">with {b.barber}</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{displayDate(b.date, b.time)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{b.email || '—'}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{expanded === b._id ? '−' : '+'}</td>
                    </tr>
                    {expanded === b._id && (
                      <tr>
                        <td colSpan={6} className="bg-white/[0.02] px-4 py-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1 text-sm">
                              <p><span className="text-zinc-500">Phone: </span>{b.phone}</p>
                              <p><span className="text-zinc-500">Email: </span>{b.email || '—'}</p>
                              <p><span className="text-zinc-500">Message: </span>{b.message || '—'}</p>
                              <p><span className="text-zinc-500">Created: </span>{b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}</p>
                              <p>
                                <span className="text-zinc-500">Email status: </span>
                                {b.emailStatus === 'sent' ? 'Sent' : b.emailStatus === 'failed' ? `Failed ${b.emailStatusNote ? `(${b.emailStatusNote})` : ''}` : 'Pending'}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-end gap-2">
                              {BOOKING_STATUS.map((s) => (
                                <button
                                  key={s.value}
                                  type="button"
                                  onClick={() => setStatusFor(b, s.value)}
                                  disabled={statusMut.isPending}
                                  className={cn(
                                    'rounded-md border px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                                    b.status === s.value
                                      ? 'border-gold bg-gold/10 text-gold'
                                      : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white',
                                  )}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
            <p className="text-xs text-zinc-500">
              Page {page} of {pages} · {data?.total ?? 0} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-zinc-400 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-zinc-400 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarCheck, Scissors, Image as ImageIcon, Star, Clock, CheckCircle2 } from 'lucide-react';
import { fetchAdminBookings } from '@/services/api';
import { useServices, useGallery, useReviews } from '@/hooks/useContent';
import { StatusBadge } from '@/features/admin/ui';
import { displayDate } from '@/lib/utils';

export default function AdminOverviewPage() {
  const bookings = useQuery({
    queryKey: ['bookings', 'page1'],
    queryFn: () => fetchAdminBookings({ page: 1, limit: 6 }),
  });
  const services = useServices({ includeInactive: true });
  const gallery = useGallery({ includeInactive: true });
  const reviews = useReviews({ includeInactive: true });

  const items = bookings.data?.items ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = items.filter((b) => b.date === today).length;
  const pendingCount = items.filter((b) => b.status === 'pending').length;
  const confirmedCount = items.filter((b) => b.status === 'confirmed').length;

  const stats = [
    { label: 'Recent bookings', value: items.length, icon: CalendarCheck },
    { label: 'Today’s appointments', value: todayCount, icon: Clock },
    { label: 'Pending', value: pendingCount, icon: CheckCircle2 },
    { label: 'Confirmed', value: confirmedCount, icon: CheckCircle2 },
    { label: 'Services', value: services.data?.total ?? 0, icon: Scissors },
    { label: 'Gallery images', value: gallery.data?.length ?? 0, icon: ImageIcon },
    { label: 'Reviews', value: reviews.data?.length ?? 0, icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">A quick look at the salon.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
            <s.icon className="h-4 w-4 text-gold" />
            <p className="mt-3 text-2xl font-semibold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-md border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent bookings</h2>
            <Link to="/admin/bookings" className="text-xs text-gold hover:underline">
              View all
            </Link>
          </div>
          {bookings.isLoading ? (
            <p className="py-6 text-sm text-zinc-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="py-6 text-sm text-zinc-500">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {items.map((b) => (
                <li key={b._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{b.name}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {b.service} · {displayDate(b.date, b.time)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-4 font-semibold text-white">Quick actions</h2>
          <div className="space-y-2">
            <Link to="/admin/bookings" className="block rounded-md bg-white/5 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-white/10">
              Manage bookings
            </Link>
            <Link to="/admin/services" className="block rounded-md bg-white/5 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-white/10">
              Edit services
            </Link>
            <Link to="/admin/gallery" className="block rounded-md bg-white/5 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-white/10">
              Upload gallery images
            </Link>
            <Link to="/admin/settings" className="block rounded-md bg-white/5 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-white/10">
              Brand & global settings
            </Link>
            <Link to="/admin/content/contact" className="block rounded-md bg-white/5 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-white/10">
              Contact details & business hours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
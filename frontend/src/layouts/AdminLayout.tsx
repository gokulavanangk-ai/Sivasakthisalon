import { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Scissors, Ruler, Image as ImageIcon, Star, HelpCircle, Quote, Settings, KeyRound, LayoutTemplate, Info, Phone, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/Feedback';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/content', label: 'Home', icon: LayoutTemplate },
  { to: '/admin/content/about', label: 'About', icon: Info },
  { to: '/admin/services', label: 'Services', icon: Scissors },
  { to: '/admin/styles', label: 'Styles', icon: Ruler },
  { to: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { to: '/admin/content/contact', label: 'Contact', icon: Phone },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { to: '/admin/quotes', label: 'Quotes', icon: Quote },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/account', label: 'Account', icon: KeyRound },
];

export default function AdminLayout() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b]">
        <LoadingSpinner label="Checking session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
              isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#0b0b0b] text-zinc-200">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/10 p-4 lg:flex">
        <p className="mb-6 px-3 font-tamil text-lg text-white">சிவசக்தி</p>
        <p className="-mt-4 mb-4 px-3 font-sans text-[10px] uppercase tracking-widest text-zinc-500">Admin</p>
        <div className="flex-1">{nav}</div>
        <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
          >
            <ExternalLink className="h-4 w-4" /> View site
          </a>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0b0b0b]/90 px-4 py-3 backdrop-blur lg:hidden">
          <span className="font-tamil text-white">சிவசக்தி Admin</span>
          <button
            type="button"
            className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-300"
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </button>
        </header>

        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-white/10 bg-[#111] p-4">
            <p className="mb-6 px-3 font-sans text-sm font-semibold uppercase tracking-widest text-zinc-400">Menu</p>
            <div className="flex-1">{nav}</div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-zinc-400 hover:text-zinc-100"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
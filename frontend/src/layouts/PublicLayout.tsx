import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MessageCircle, Calendar } from 'lucide-react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { CustomCursor } from '@/components/cursor/CustomCursor';
import { CinematicLoader } from '@/components/cinematic/CinematicLoader';
import { useSalon } from '@/hooks/useContent';
import { whatsappLink } from '@/constants';
import { useLocation } from 'react-router-dom';
import { businessInfoOf } from '@/lib/utils';

export default function PublicLayout() {
  const [loading, setLoading] = useState(() => sessionStorage.getItem('ss-loaded') !== '1');
  const { data: salon } = useSalon();
  const location = useLocation();
  const bi = businessInfoOf(salon);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const showLoader = !isAdminRoute && loading;

  return (
    <div className="relative min-h-screen">
      {showLoader && (
        <CinematicLoader
          onDone={() => {
            sessionStorage.setItem('ss-loaded', '1');
            setLoading(false);
          }}
        />
      )}
      <CustomCursor />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />

      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
        <a
          href={whatsappLink(bi.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] p-3.5 text-white shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
        {salon?.toggles?.bookingEnabled !== false && (
          <a
            href="/booking"
            aria-label="Book appointment"
            className="flex h-13 w-13 items-center justify-center rounded-full bg-gold p-3.5 text-ink shadow-lg transition-transform hover:scale-105"
          >
            <Calendar className="h-6 w-6" />
          </a>
        )}
      </div>
    </div>
  );
}
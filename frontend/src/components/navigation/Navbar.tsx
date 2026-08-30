import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowUpRight, Phone } from 'lucide-react';
import { cn, businessInfoOf } from '@/lib/utils';
import { useSalon } from '@/hooks/useContent';
import { Magnetic } from '@/components/shared/Magnetic';
import { whatsappLink } from '@/constants';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/styles', label: 'Styles' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: salon } = useSalon();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const goBooking = useCallback(() => {
    setOpen(false);
    navigate('/booking');
  }, [navigate]);

  const bi = businessInfoOf(salon);
  const primaryPhone = bi.phone;
  const waLink = whatsappLink(bi.whatsapp);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'border-b border-line bg-ink/80 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="container-x flex h-16 items-center justify-between sm:h-20">
        <Link to="/" className="group flex h-full items-center gap-3" aria-label="Go to homepage">
          {salon?.logo?.url ? (
            <img src={salon.logo.url} alt="Sivasakthi Men's Salon logo" className="h-full w-auto object-cover" />
          ) : (
            <span className="flex h-full aspect-square items-center justify-center border border-gold/60 font-tamil text-lg text-gold">
              சி
            </span>
          )}
          <span className="flex flex-col leading-tight">
            <span className="font-tamil text-sm text-cream">{bi.tamilName?.split(' ')[0]}</span>
            <span className="font-sans text-[9px] font-semibold uppercase tracking-widest3 text-muted">
              {bi.salonName}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'group relative font-sans text-[11px] font-semibold uppercase tracking-widest transition-colors',
                  isActive ? 'text-gold' : 'text-cream/80 hover:text-cream',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    className={cn(
                      'absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-300',
                      isActive ? 'w-full' : 'w-0 group-hover:w-full',
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Magnetic>
            <button
              type="button"
              onClick={goBooking}
              className="hidden items-center gap-2 rounded-full bg-cream px-5 py-2.5 font-sans text-[11px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-gold sm:inline-flex"
            >
              Book Now
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </Magnetic>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-cream lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink/98 backdrop-blur-md lg:hidden"
          >
            <div className="container-x flex h-16 items-center justify-between">
              <span className="font-tamil text-cream">{bi.tamilName}</span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-cream"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="container-x flex flex-1 flex-col justify-center gap-1" aria-label="Mobile">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        '-mx-5 block border-b border-line/60 px-5 py-4 font-tamil text-2xl',
                        isActive ? 'text-gold' : 'text-cream hover:text-gold',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-8 flex flex-col gap-3"
              >
                <button
                  type="button"
                  onClick={goBooking}
                  className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-3.5 font-sans text-[12px] font-bold uppercase tracking-widest text-ink"
                >
                  Book Your Style
                </button>
                {waLink && bi.whatsapp && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-7 py-3.5 font-sans text-[12px] font-semibold uppercase tracking-widest text-cream"
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp {primaryPhone}
                  </a>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
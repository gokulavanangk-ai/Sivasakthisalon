import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLenis, scrollToTop } from '@/hooks/useLenis';
import { LoadingSpinner } from '@/components/ui/Feedback';
import PublicLayout from '@/layouts/PublicLayout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage'));
const StylesPage = lazy(() => import('@/pages/StylesPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const BookingPage = lazy(() => import('@/pages/BookingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const AdminBookingsPage = lazy(() => import('@/pages/admin/AdminBookingsPage'));
const AdminServicesPage = lazy(() => import('@/pages/admin/AdminServicesPage'));
const AdminStylesPage = lazy(() => import('@/pages/admin/AdminStylesPage'));
const AdminGalleryPage = lazy(() => import('@/pages/admin/AdminGalleryPage'));
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage'));
const AdminFaqsPage = lazy(() => import('@/pages/admin/AdminFaqsPage'));
const AdminQuotesPage = lazy(() => import('@/pages/admin/AdminQuotesPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminWebsitePage = lazy(() => import('@/pages/admin/AdminWebsitePage'));
const AdminAboutPage = lazy(() => import('@/pages/admin/AdminAboutPage'));
const AdminContactPage = lazy(() => import('@/pages/admin/AdminContactPage'));
const AdminAccountPage = lazy(() => import('@/pages/admin/AdminAccountPage'));

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  useLenis();
  const location = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            element={
              <Suspense fallback={<LoadingSpinner label="Loading" />}>
                <PublicLayout />
              </Suspense>
            }
          >
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
            <Route path="/services" element={<PageWrapper><ServicesPage /></PageWrapper>} />
            <Route path="/styles" element={<PageWrapper><StylesPage /></PageWrapper>} />
            <Route path="/gallery" element={<PageWrapper><GalleryPage /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
            <Route path="/booking" element={<PageWrapper><BookingPage /></PageWrapper>} />
          </Route>

          <Route path="/admin/login" element={<Suspense fallback={<LoadingSpinner label="Loading" />}><AdminLoginPage /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<LoadingSpinner label="Loading" />}><AdminLayout /></Suspense>}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="styles" element={<AdminStylesPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="faqs" element={<AdminFaqsPage />} />
            <Route path="quotes" element={<AdminQuotesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="content" element={<AdminWebsitePage />} />
            <Route path="content/about" element={<AdminAboutPage />} />
            <Route path="content/contact" element={<AdminContactPage />} />
            <Route path="account" element={<AdminAccountPage />} />
          </Route>

          <Route path="*" element={<Suspense fallback={<LoadingSpinner label="Loading" />}><NotFoundPage /></Suspense>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
import { publicApi, adminApi, adminApiForm, unwrap, ApiClientError } from '@/lib/apiClient';
import type {
  AdminUser,
  Barber,
  Booking,
  BookingStatus,
  BusinessHours,
  Faq,
  GalleryItem,
  Hairstyle,
  LibraryAsset,
  LocalMediaFile,
  MediaType,
  Paginated,
  Quote,
  Review,
  SalonSettings,
  Service,
  SlotInfo,
  UploadedMedia,
} from '@/types';

// ---------- Public content ----------
export const fetchSalon = () => unwrap<SalonSettings>(publicApi.get('/salon'));
export const fetchServices = (opts: { includeInactive?: boolean } = {}) =>
  unwrap<Paginated<Service>>(publicApi.get('/services', { params: opts }));
export const fetchHairstyles = (opts: { includeInactive?: boolean } = {}) =>
  unwrap<Hairstyle[]>(publicApi.get('/hairstyles', { params: opts }));
export const fetchGallery = (opts: { includeInactive?: boolean } = {}) =>
  unwrap<GalleryItem[]>(publicApi.get('/gallery', { params: opts }));
export const fetchReviews = (opts: { includeInactive?: boolean } = {}) =>
  unwrap<Review[]>(publicApi.get('/reviews', { params: opts }));
export const fetchBarbers = () => unwrap<Paginated<Barber>>(publicApi.get('/barbers'));
export const fetchFaqs = () => unwrap<Faq[]>(publicApi.get('/faqs'));
export const fetchBusinessHours = () => unwrap<BusinessHours>(publicApi.get('/hours'));

// ---------- Quotes (public) ----------
export const fetchQuotes = (opts: { source?: string; includeInactive?: boolean } = {}) =>
  unwrap<Quote[]>(publicApi.get('/quotes', { params: opts }));

// ---------- Availability ----------
export const fetchAvailableSlots = (date: string) =>
  unwrap<{ date: string; slots: SlotInfo[] }>(publicApi.get('/bookings/slots/available', { params: { date } }));

export interface CreateBookingInput {
  name: string;
  phone: string;
  email: string;
  service: string;
  serviceId?: string;
  barber?: string;
  date: string;
  time: string;
  message?: string;
}

export const createBooking = (input: CreateBookingInput) =>
  unwrap<{ bookingId: string; status: string }>(publicApi.post('/bookings', input));

export const lookupBooking = (bookingId: string) =>
  unwrap<{ bookingId: string; name: string; service: string; date: string; time: string; status: string }>(
    publicApi.get(`/bookings/lookup/${encodeURIComponent(bookingId)}`),
  );

// ---------- Auth ----------
export const authLogin = async (identifier: string, password: string) => {
  const { data } = await adminApi.post<{ success: boolean; data: AdminUser; token?: string }>(
    '/auth/login',
    { identifier, password },
  );
  return { admin: data.data, token: data.token ?? '' };
};
export const authLogout = () => adminApi.post('/auth/logout');
export const fetchMe = () => unwrap<AdminUser>(adminApi.get('/auth/me'));
export const changePassword = (input: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
  unwrap<null>(adminApi.put('/auth/password', input));
export const updateProfile = (input: { name?: string; email?: string; username?: string }) =>
  unwrap<AdminUser>(adminApi.put('/auth/profile', input));

// ---------- Admin: bookings ----------
export const fetchAdminBookings = (params: { page?: number; limit?: number; status?: string; q?: string } = {}) =>
  unwrap<Paginated<Booking>>(adminApi.get('/bookings', { params }));
export const updateBookingStatus = (id: string, status: BookingStatus) =>
  unwrap<Booking>(adminApi.put(`/bookings/${id}/status`, { status }));

// ---------- Admin: services ----------
export const createService = (data: Partial<Service>) => unwrap<Service>(adminApi.post('/services', data));
export const updateService = (id: string, data: Partial<Service>) => unwrap<Service>(adminApi.put(`/services/${id}`, data));
export const deleteService = (id: string) => unwrap<null>(adminApi.delete(`/services/${id}`));

// ---------- Admin: hairstyles ----------
export const createHairstyle = (data: Partial<Hairstyle>) => unwrap<Hairstyle>(adminApi.post('/hairstyles', data));
export const updateHairstyle = (id: string, data: Partial<Hairstyle>) => unwrap<Hairstyle>(adminApi.put(`/hairstyles/${id}`, data));
export const deleteHairstyle = (id: string) => unwrap<null>(adminApi.delete(`/hairstyles/${id}`));

// ---------- Admin: gallery ----------
export const createGalleryItem = (data: Partial<GalleryItem>) =>
  unwrap<GalleryItem>(adminApi.post('/gallery', data));
export const updateGalleryItem = (id: string, data: Partial<GalleryItem>) =>
  unwrap<GalleryItem>(adminApi.put(`/gallery/${id}`, data));
export const deleteGalleryItem = (id: string) => unwrap<null>(adminApi.delete(`/gallery/${id}`));

// ---------- Admin: media ----------
export const uploadMediaFile = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return unwrap<UploadedMedia>(adminApiForm.post('/admin/media/upload', form));
};
export const fetchLocalMedia = () => unwrap<LocalMediaFile[]>(adminApi.get('/admin/media/local'));
export const fetchMediaLibrary = () => unwrap<LibraryAsset[]>(adminApi.get('/admin/media/library'));
export const deleteMediaFile = (publicId: string, mediaType: MediaType) =>
  unwrap<null>(adminApi.delete(`/admin/media/${encodeURIComponent(publicId)}`, { params: { mediaType } }));

// ---------- Admin: reviews ----------
export const createReview = (data: Partial<Review>) => unwrap<Review>(adminApi.post('/reviews', data));
export const updateReview = (id: string, data: Partial<Review>) => unwrap<Review>(adminApi.put(`/reviews/${id}`, data));
export const deleteReview = (id: string) => unwrap<null>(adminApi.delete(`/reviews/${id}`));

// ---------- Admin: barbers ----------
export const createBarber = (data: Partial<Barber>) => unwrap<Barber>(adminApi.post('/barbers', data));
export const updateBarber = (id: string, data: Partial<Barber>) => unwrap<Barber>(adminApi.put(`/barbers/${id}`, data));
export const deleteBarber = (id: string) => unwrap<null>(adminApi.delete(`/barbers/${id}`));

// ---------- Admin: FAQs ----------
export const createFaq = (data: Partial<Faq>) => unwrap<Faq>(adminApi.post('/faqs', data));
export const updateFaq = (id: string, data: Partial<Faq>) => unwrap<Faq>(adminApi.put(`/faqs/${id}`, data));
export const deleteFaq = (id: string) => unwrap<null>(adminApi.delete(`/faqs/${id}`));

// ---------- Admin: quotes ----------
export const createQuote = (data: Partial<Quote>) => unwrap<Quote>(adminApi.post('/quotes', data));
export const updateQuote = (id: string, data: Partial<Quote>) => unwrap<Quote>(adminApi.put(`/quotes/${id}`, data));
export const deleteQuote = (id: string) => unwrap<null>(adminApi.delete(`/quotes/${id}`));

// ---------- Admin: salon / hours ----------
export const updateSalon = (data: Partial<SalonSettings>) => unwrap<SalonSettings>(adminApi.put('/salon', data));
export const uploadLogo = (form: FormData) => unwrap<{ url: string; publicId: string }>(adminApiForm.post('/salon/logo', form));
export const deleteLogo = () => unwrap<null>(adminApi.delete('/salon/logo'));
export const updateBusinessHours = (data: Partial<BusinessHours>) =>
  unwrap<BusinessHours>(adminApi.put('/hours', data));

export type { ApiClientError };
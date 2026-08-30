import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Barber, BookingStatus, Faq, GalleryItem, Hairstyle, MediaType, Quote, Review, Service } from '@/types';
import {
  createService,
  updateService,
  deleteService,
  createHairstyle,
  updateHairstyle,
  deleteHairstyle,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadMediaFile,
  fetchLocalMedia,
  deleteMediaFile,
  createReview,
  updateReview,
  deleteReview,
  createBarber,
  updateBarber,
  deleteBarber,
  createFaq,
  updateFaq,
  deleteFaq,
  createQuote,
  updateQuote,
  deleteQuote,
  updateSalon,
  uploadLogo,
  deleteLogo,
  updateBusinessHours,
  updateBookingStatus,
  updateProfile,
  changePassword,
} from '@/services/api';
import { useToast } from '@/components/ui/Toast';

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong';
}

function useCrudTyped<T, R>(invalidate: string[], fn: (input: T) => Promise<R>, successMsg?: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      invalidate.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      if (successMsg) toast(successMsg, 'success');
    },
    onError: (e) => toast(errMsg(e), 'error'),
  });
}

export function useServiceMutations() {
  return {
    create: useCrudTyped(['services'], createService, 'Service created'),
    update: useCrudTyped(['services'], ({ id, data }: { id: string; data: Partial<Service> }) => updateService(id, data), 'Service updated'),
    remove: useCrudTyped(['services'], deleteService, 'Service deleted'),
  };
}

export function useHairstyleMutations() {
  return {
    create: useCrudTyped(['hairstyles'], createHairstyle, 'Style created'),
    update: useCrudTyped(['hairstyles'], ({ id, data }: { id: string; data: Partial<Hairstyle> }) => updateHairstyle(id, data), 'Style updated'),
    remove: useCrudTyped(['hairstyles'], deleteHairstyle, 'Style deleted'),
  };
}

export function useReviewMutations() {
  return {
    create: useCrudTyped(['reviews'], createReview, 'Review created'),
    update: useCrudTyped(['reviews'], ({ id, data }: { id: string; data: Partial<Review> }) => updateReview(id, data), 'Review updated'),
    remove: useCrudTyped(['reviews'], deleteReview, 'Review deleted'),
  };
}

export function useBarberMutations() {
  return {
    create: useCrudTyped(['barbers'], createBarber, 'Barber created'),
    update: useCrudTyped(['barbers'], ({ id, data }: { id: string; data: Partial<Barber> }) => updateBarber(id, data), 'Barber updated'),
    remove: useCrudTyped(['barbers'], deleteBarber, 'Barber deleted'),
  };
}

export function useFaqMutations() {
  return {
    create: useCrudTyped(['faqs'], createFaq, 'FAQ created'),
    update: useCrudTyped(['faqs'], ({ id, data }: { id: string; data: Partial<Faq> }) => updateFaq(id, data), 'FAQ updated'),
    remove: useCrudTyped(['faqs'], deleteFaq, 'FAQ deleted'),
  };
}

export function useQuoteMutations() {
  return {
    create: useCrudTyped(['quotes'], createQuote, 'Quote created'),
    update: useCrudTyped(['quotes'], ({ id, data }: { id: string; data: Partial<Quote> }) => updateQuote(id, data), 'Quote updated'),
    remove: useCrudTyped(['quotes'], deleteQuote, 'Quote deleted'),
  };
}

export function useGalleryMutations() {
  return {
    create: useCrudTyped(['gallery'], createGalleryItem, 'Media added'),
    update: useCrudTyped(['gallery'], ({ id, data }: { id: string; data: Partial<GalleryItem> }) => updateGalleryItem(id, data), 'Media updated'),
    remove: useCrudTyped(['gallery'], deleteGalleryItem, 'Media deleted'),
  };
}

export function useMediaMutations() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const upload = useMutation({
    mutationFn: uploadMediaFile,
    onError: (e) => toast(errMsg(e), 'error'),
  });
  const local = useMutation({
    mutationFn: fetchLocalMedia,
  });
  const removeFile = useMutation({
    mutationFn: ({ publicId, mediaType }: { publicId: string; mediaType: MediaType }) =>
      deleteMediaFile(publicId, mediaType),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (e) => toast(errMsg(e), 'error'),
  });
  return { upload, local, removeFile };
}

export function useSettingsMutations() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const save = useMutation({
    mutationFn: updateSalon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon'] });
      toast('Settings saved', 'success');
    },
    onError: (e) => toast(errMsg(e), 'error'),
  });
  const logo = useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salon'] }),
    onError: (e) => toast(errMsg(e), 'error'),
  });
  const removeLogo = useMutation({
    mutationFn: deleteLogo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salon'] }),
  });
  const hours = useMutation({
    mutationFn: updateBusinessHours,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hours'] });
      toast('Hours saved', 'success');
    },
    onError: (e) => toast(errMsg(e), 'error'),
  });
  return { save, logo, removeLogo, hours };
}

export function useBookingStatusMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => updateBookingStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      toast('Status updated', 'success');
    },
    onError: (e) => toast(errMsg(e), 'error'),
  });
}

export function useAccountMutations() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const profile = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast('Profile updated', 'success');
    },
    onError: (e) => toast(errMsg(e), 'error'),
  });
  const password = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast('Password updated', 'success'),
    onError: (e) => toast(errMsg(e), 'error'),
  });
  return { profile, password };
}
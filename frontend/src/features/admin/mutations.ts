import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Barber, BookingStatus, Faq, Hairstyle, Review, Service } from '@/types';
import {
  createService,
  updateService,
  deleteService,
  createHairstyle,
  updateHairstyle,
  deleteHairstyle,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  createReview,
  updateReview,
  deleteReview,
  createBarber,
  updateBarber,
  deleteBarber,
  createFaq,
  updateFaq,
  deleteFaq,
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

export function useGalleryMutations() {
  return {
    create: useCrudTyped(['gallery'], uploadGalleryImage, 'Image uploaded'),
    update: useCrudTyped(['gallery'], ({ id, form }: { id: string; form: FormData }) => updateGalleryImage(id, form), 'Image updated'),
    remove: useCrudTyped(['gallery'], deleteGalleryImage, 'Image deleted'),
  };
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
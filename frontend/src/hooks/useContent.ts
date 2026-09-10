import { useQuery } from '@tanstack/react-query';
import {
  fetchAvailableSlots,
  fetchBarbers,
  fetchBusinessHours,
  fetchFaqs,
  fetchGallery,
  fetchHairstyles,
  fetchQuotes,
  fetchReviews,
  fetchSalon,
  fetchServices,
} from '@/services/api';

const CONTENT_STALE_TIME = 2 * 60 * 1000;
const CONTENT_GC_TIME = 10 * 60 * 1000;

export function useSalon() {
  return useQuery({
    queryKey: ['salon'],
    queryFn: fetchSalon,
    staleTime: CONTENT_STALE_TIME,
    gcTime: CONTENT_GC_TIME,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFaqs,
    staleTime: CONTENT_STALE_TIME,
    gcTime: CONTENT_GC_TIME,
  });
}

export function useQuotes(opts: { source?: string; includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['quotes', opts],
    queryFn: () => fetchQuotes(opts),
    staleTime: CONTENT_STALE_TIME,
    gcTime: CONTENT_GC_TIME,
  });
}

export function useServices(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['services', opts],
    queryFn: () => fetchServices(opts),
    staleTime: CONTENT_STALE_TIME,
    gcTime: CONTENT_GC_TIME,
  });
}

export function useHairstyles(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['hairstyles', opts],
    queryFn: () => fetchHairstyles(opts),
    staleTime: CONTENT_STALE_TIME,
    gcTime: CONTENT_GC_TIME,
  });
}

export function useGallery(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['gallery', opts],
    queryFn: () => fetchGallery(opts),
    staleTime: CONTENT_STALE_TIME,
    gcTime: CONTENT_GC_TIME,
  });
}

export function useReviews(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['reviews', opts],
    queryFn: () => fetchReviews(opts),
    staleTime: CONTENT_STALE_TIME,
    gcTime: CONTENT_GC_TIME,
  });
}

export function useBarbers() {
  return useQuery({
    queryKey: ['barbers'],
    queryFn: fetchBarbers,
    staleTime: CONTENT_STALE_TIME,
    gcTime: CONTENT_GC_TIME,
  });
}

export function useBusinessHours() {
  return useQuery({
    queryKey: ['hours'],
    queryFn: fetchBusinessHours,
    staleTime: CONTENT_STALE_TIME,
    gcTime: CONTENT_GC_TIME,
  });
}

export function useAvailableSlots(date: string | null) {
  return useQuery({
    queryKey: ['slots', date],
    queryFn: () => fetchAvailableSlots(date as string),
    enabled: Boolean(date),
    staleTime: 30 * 1000,
  });
}
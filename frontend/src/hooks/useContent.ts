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

export function useSalon() {
  return useQuery({ queryKey: ['salon'], queryFn: fetchSalon, staleTime: 60 * 1000 });
}

export function useFaqs() {
  return useQuery({ queryKey: ['faqs'], queryFn: fetchFaqs, staleTime: 60 * 1000 });
}

export function useQuotes(opts: { source?: string; includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['quotes', opts],
    queryFn: () => fetchQuotes(opts),
    staleTime: 60 * 1000,
  });
}

export function useServices(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['services', opts],
    queryFn: () => fetchServices(opts),
    staleTime: 60 * 1000,
  });
}

export function useHairstyles(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['hairstyles', opts],
    queryFn: () => fetchHairstyles(opts),
    staleTime: 60 * 1000,
  });
}

export function useGallery(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['gallery', opts],
    queryFn: () => fetchGallery(opts),
    staleTime: 60 * 1000,
  });
}

export function useReviews(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['reviews', opts],
    queryFn: () => fetchReviews(opts),
    staleTime: 60 * 1000,
  });
}

export function useBarbers() {
  return useQuery({ queryKey: ['barbers'], queryFn: fetchBarbers, staleTime: 60 * 1000 });
}

export function useBusinessHours() {
  return useQuery({ queryKey: ['hours'], queryFn: fetchBusinessHours, staleTime: 60 * 1000 });
}

export function useAvailableSlots(date: string | null) {
  return useQuery({
    queryKey: ['slots', date],
    queryFn: () => fetchAvailableSlots(date as string),
    enabled: Boolean(date),
    staleTime: 30 * 1000,
  });
}
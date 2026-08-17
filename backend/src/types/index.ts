export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pages: number;
  total: number;
  limit: number;
};

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type EmailStatus = 'pending' | 'sent' | 'failed';

export type Role = 'admin';
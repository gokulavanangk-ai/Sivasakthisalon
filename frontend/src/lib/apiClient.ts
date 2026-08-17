import axios, { AxiosError } from 'axios';
import { API_URL } from '@/constants';

interface ErrorBody {
  message?: string;
  errorCode?: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly errorCode: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, errorCode = 'ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }

  static fromAxios(error: AxiosError) {
    const body = (error.response?.data ?? {}) as ErrorBody;
    const message = body.message ?? 'Something went wrong. Please try again.';
    const errorCode = body.errorCode ?? 'ERROR';
    const details = body.details;
    const status = error.response?.status ?? 0;
    return new ApiClientError(message, status, errorCode, details);
  }
}

function rejectWithClientError(error: AxiosError) {
  return Promise.reject(ApiClientError.fromAxios(error));
}

/**
 * Public API client — used by the public website only.
 * Never sends credentials, so visitors can never hit auth-protected
 * endpoints and stale admin cookies never leave the browser for public calls.
 */
export const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

publicApi.interceptors.response.use((res) => res, rejectWithClientError);

/**
 * Admin API client — used by authenticated routes and mutations.
 * Sends the HttpOnly session cookie and redirects to the admin login
 * when an authenticated request returns 401 (expired/revoked session).
 */
export const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

adminApi.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const isLoginAttempt = url.includes('/auth/login');
    const isOnLoginPage = window.location.pathname.startsWith('/admin/login');
    if (status === 401 && !isLoginAttempt && !isOnLoginPage) {
      window.location.assign('/admin/login');
    }
    return rejectWithClientError(error);
  },
);

/**
 * Form-data client for public uploads (none currently) and admin uploads.
 */
export const publicApiForm = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 30000,
});

publicApiForm.interceptors.response.use((res) => res, rejectWithClientError);

export const adminApiForm = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

adminApiForm.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const isOnLoginPage = window.location.pathname.startsWith('/admin/login');
    if (status === 401 && !isOnLoginPage) {
      window.location.assign('/admin/login');
    }
    return rejectWithClientError(error);
  },
);

export async function unwrap<T>(res: Promise<{ data: { data: T } }>): Promise<T> {
  const response = await res;
  return response.data.data;
}
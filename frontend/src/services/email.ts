import emailjs from '@emailjs/browser';

export interface BookingEmailParams {
  customer_name: string;
  customer_email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  booking_id: string;
  status: string;
  status_message?: string;
}

export type StatusNotificationKind = 'confirmed' | 'rejected';

export interface StatusNotification {
  status: 'Confirmed' | 'Rejected';
  status_message: string;
}

const STATUS_NOTIFICATIONS: Record<StatusNotificationKind, StatusNotification> = {
  confirmed: {
    status: 'Confirmed',
    status_message: 'Your appointment has been confirmed. We look forward to welcoming you.',
  },
  rejected: {
    status: 'Rejected',
    status_message:
      'Unfortunately, your requested appointment could not be confirmed. Please contact us or choose another available time slot.',
  },
};

/**
 * Maps a booking status to the display status + customer-facing message the
 * status EmailJS template renders. Pure so it can be unit-tested.
 */
export function statusNotificationFor(kind: StatusNotificationKind): StatusNotification {
  return STATUS_NOTIFICATIONS[kind];
}

/**
 * Maps booking details to the dynamic variables the EmailJS template expects.
 * Kept as a pure function so it can be unit-tested without a network call.
 */
export function buildBookingEmailTemplateParams(p: BookingEmailParams): Record<string, unknown> {
  return { ...p };
}

/**
 * Sends a booking/status notification via EmailJS.
 *
 * - Never throws: on any failure it logs a safe warning and returns false.
 * - Returns false (and skips sending) when EmailJS is not configured, so an
 *   empty dev .env can never break the booking flow.
 * - The admin recipient is configured inside the EmailJS template, never here.
 */
export async function sendBookingEmail(params: BookingEmailParams): Promise<boolean> {
  return sendWithTemplate(params, import.meta.env.VITE_EMAILJS_TEMPLATE_ID, 'booking');
}

/**
 * Sends a status-change notification (Booking Confirmed / Booking Rejected)
 * through the dedicated status template.
 */
export async function sendBookingStatusEmail(params: BookingEmailParams): Promise<boolean> {
  return sendWithTemplate(params, import.meta.env.VITE_EMAILJS_STATUS_TEMPLATE_ID, 'status');
}

async function sendWithTemplate(
  params: BookingEmailParams,
  templateId: string | undefined,
  kind: 'booking' | 'status',
): Promise<boolean> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !publicKey || !templateId) {
    console.warn(`[email] EmailJS is not configured for ${kind} emails — skipped`);
    return false;
  }

  try {
    await emailjs.send(serviceId, templateId, buildBookingEmailTemplateParams(params), {
      publicKey,
    });
    return true;
  } catch (err) {
    console.warn(`[email] ${kind} email failed to send:`, err);
    return false;
  }
}
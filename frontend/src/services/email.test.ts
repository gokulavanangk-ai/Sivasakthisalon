import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import emailjs from '@emailjs/browser';
import {
  sendBookingEmail,
  sendBookingStatusEmail,
  buildBookingEmailTemplateParams,
  statusNotificationFor,
} from './email';

vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn(),
  },
}));

const sendMock = emailjs.send as unknown as ReturnType<typeof vi.fn>;

const base = {
  customer_name: 'Arun',
  customer_email: 'arun@example.com',
  phone: '9876543210',
  service: 'Haircut',
  date: '2026-08-18',
  time: '10:00',
  booking_id: 'SS-2026-ABC123',
  status: 'Pending',
};

describe('buildBookingEmailTemplateParams', () => {
  it('returns exactly the dynamic variables the EmailJS template needs', () => {
    expect(buildBookingEmailTemplateParams(base)).toEqual({
      customer_name: 'Arun',
      customer_email: 'arun@example.com',
      phone: '9876543210',
      service: 'Haircut',
      date: '2026-08-18',
      time: '10:00',
      booking_id: 'SS-2026-ABC123',
      status: 'Pending',
    });
  });
});

describe('sendBookingEmail', () => {
  beforeEach(() => {
    sendMock.mockReset();
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'pk_test');
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'svc_test');
    vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', 'tpl_test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sends with the correct service/template/params and resolves true', async () => {
    sendMock.mockResolvedValue(undefined);
    const ok = await sendBookingEmail(base);
    expect(ok).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      'svc_test',
      'tpl_test',
      expect.objectContaining({ customer_name: 'Arun', booking_id: 'SS-2026-ABC123', status: 'Pending' }),
      { publicKey: 'pk_test' },
    );
  });

  it('returns false (never throws) when EmailJS rejects', async () => {
    sendMock.mockRejectedValue(new Error('network down'));
    await expect(sendBookingEmail(base)).resolves.toBe(false);
  });

  it('skips sending and returns false when EmailJS is not configured', async () => {
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', '');
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', '');
    vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', '');
    const ok = await sendBookingEmail(base);
    expect(ok).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe('statusNotificationFor', () => {
  it('returns Confirmed with the confirmation message', () => {
    expect(statusNotificationFor('confirmed')).toEqual({
      status: 'Confirmed',
      status_message: 'Your appointment has been confirmed. We look forward to welcoming you.',
    });
  });

  it('returns Rejected with the rejection message', () => {
    expect(statusNotificationFor('rejected')).toEqual({
      status: 'Rejected',
      status_message:
        'Unfortunately, your requested appointment could not be confirmed. Please contact us or choose another available time slot.',
    });
  });
});

describe('sendBookingStatusEmail', () => {
  beforeEach(() => {
    sendMock.mockReset();
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'pk_test');
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'svc_test');
    vi.stubEnv('VITE_EMAILJS_STATUS_TEMPLATE_ID', 'status_tpl_test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the dedicated status template', async () => {
    sendMock.mockResolvedValue(undefined);
    const ok = await sendBookingStatusEmail({
      ...base,
      status: 'Confirmed',
      status_message: 'Your appointment has been confirmed. We look forward to welcoming you.',
    });
    expect(ok).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      'svc_test',
      'status_tpl_test',
      expect.objectContaining({
        customer_name: 'Arun',
        status: 'Confirmed',
        status_message: 'Your appointment has been confirmed. We look forward to welcoming you.',
      }),
      { publicKey: 'pk_test' },
    );
  });

  it('returns false (never throws) when EmailJS rejects', async () => {
    sendMock.mockRejectedValue(new Error('network down'));
    await expect(sendBookingStatusEmail(base)).resolves.toBe(false);
  });

  it('skips sending and returns false when the status template is not configured', async () => {
    vi.stubEnv('VITE_EMAILJS_STATUS_TEMPLATE_ID', '');
    const ok = await sendBookingStatusEmail(base);
    expect(ok).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
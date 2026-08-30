import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Calendar, Clock, Phone, MessageCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useServices, useBarbers, useAvailableSlots, useBusinessHours } from '@/hooks/useContent';
import { useSalon } from '@/hooks/useContent';
import { createBooking } from '@/services/api';
import { sendBookingEmail } from '@/services/email';
import { whatsappLink } from '@/constants';
import { cn, addDays, todayDateKey, to12Hour, displayDate, businessInfoOf } from '@/lib/utils';
import type { WeekDay } from '@/types';
import { ErrorMessage, LoadingSpinner, EmptyState } from '@/components/ui/Feedback';

type Step = 'details' | 'confirm';

const bookingSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  phone: z.string().regex(/^[+\d][\d\s-]{7,14}$/, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email'),
  serviceId: z.string().min(1, 'Please pick a service'),
  barber: z.string().optional(),
  date: z.string().min(1, 'Please pick a date'),
  time: z.string().min(1, 'Please pick a time slot'),
  message: z.string().max(500).optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const WEEK_LABELS: Record<WeekDay, string> = {
  monday: 'திங்கள்',
  tuesday: 'செவ்வாய்',
  wednesday: 'புதன்',
  thursday: 'வியாழன்',
  friday: 'வெள்ளி',
  saturday: 'சனி',
  sunday: 'ஞாயிறு',
};

const DAYS_TO_SHOW = 14;

export interface ConfirmedBooking {
  bookingId: string;
  service: string;
  date: string;
  time: string;
}

export function BookingForm() {
  const { data: salon } = useSalon();
  const bi = businessInfoOf(salon);
  const bookingEnabled = salon?.toggles?.bookingEnabled !== false;
  const barbersEnabled = salon?.toggles?.barberSelection === true;
  const waLink = whatsappLink(bi.whatsapp);

  const { data: servicesData } = useServices();
  const { data: barbersData } = useBarbers();
  const { data: hours } = useBusinessHours();
  const services = servicesData?.items ?? [];
  const barbers = barbersData?.items ?? [];

  const [step, setStep] = useState<Step>('details');
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { barber: '' },
  });

  const selectedDate = watch('date');

  const dates = useMemo(() => {
    const today = todayDateKey();
    return Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
      const key = addDays(today, i);
      const d = new Date(`${key}T00:00:00`);
      const weekday = WEEK_LABELS[
        (['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as WeekDay[])[d.getDay()]
      ];
      const dayNum = d.getDate();
      const month = new Intl.DateTimeFormat('ta-IN', { month: 'short' }).format(d);
      const isToday = i === 0;
      const isClosed = hours ? !hours.workingHours[((['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as WeekDay[])[d.getDay()])].isOpen : false;
      const isBlocked = hours?.blockedDates?.includes(key) ?? false;
      return { key, weekday, dayNum, month, isToday, isClosed: isClosed || isBlocked };
    });
  }, [hours]);

  const { data: slotsData, isLoading: slotsLoading, isError: slotsError, refetch: refetchSlots } = useAvailableSlots(selectedDate || null);

  useEffect(() => {
    if (selectedDate) refetchSlots();
  }, [selectedDate, refetchSlots]);

  const allSlots = useMemo(() => (slotsData?.slots ?? []), [slotsData]);

  const onSubmit = async (values: BookingFormValues) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const service = services.find((s) => s._id === values.serviceId);
      const result = await createBooking({
        name: values.name,
        phone: values.phone,
        email: values.email,
        service: service?.englishName ?? values.serviceId,
        serviceId: values.serviceId,
        barber: values.barber || undefined,
        date: values.date,
        time: values.time,
        message: values.message || undefined,
      });
      setConfirmed({
        bookingId: result.bookingId,
        service: service?.englishName ?? values.serviceId,
        date: values.date,
        time: values.time,
      });
      setStep('confirm');

      // Refresh availability so the just-booked slot shows as unavailable.
      void refetchSlots();

      // Notification — must never block or fail the booking.
      void sendBookingEmail({
        customer_name: values.name,
        customer_email: values.email,
        phone: values.phone,
        service: service?.englishName ?? values.serviceId,
        date: values.date,
        time: values.time,
        booking_id: result.bookingId,
        status: 'Pending',
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Booking failed. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!bookingEnabled) {
    return (
      <div className="card p-8 text-center">
        <p className="font-tamil text-xl text-cream">Online booking is temporarily unavailable.</p>
        <p className="mt-2 text-sm text-muted">Kindly call or WhatsApp us to reserve your slot.</p>
        <div className="mt-6 flex justify-center gap-3">
          {bi.phone && (
            <a href={`tel:+91${bi.phone}`} className="btn-primary">
              <Phone className="h-4 w-4" /> Call Now
            </a>
          )}
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
          )}
        </div>
      </div>
    );
  }

  if (step === 'confirm' && confirmed) {
    return (
      <MotionConfirm
        confirmed={confirmed}
        phone={bi.phone}
        waLink={waLink}
        onBack={() => setStep('details')}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
      {/* Service */}
      <fieldset>
        <legend className="field-label">1 · Choose your service</legend>
        {services.length === 0 ? (
          <EmptyState title="Services coming soon" body="Kindly call us in the meantime." />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label
                key={s._id}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-md border px-4 py-3 transition-colors',
                  watch('serviceId') === s._id
                    ? 'border-gold bg-gold/10'
                    : 'border-line bg-ink-800 hover:border-gold/40',
                )}
              >
                <span>
                  <span className="block font-sans text-base font-medium text-cream">{s.englishName}</span>
                  <span className="block font-tamil text-sm text-gold/80">{s.tamilName}</span>
                </span>
                <input
                  type="radio"
                  {...register('serviceId')}
                  value={s._id}
                  className="sr-only"
                />
                <CheckCircle2 className={cn('h-5 w-5', watch('serviceId') === s._id ? 'text-gold' : 'text-muted/30')} />
              </label>
            ))}
          </div>
        )}
        {errors.serviceId && <p className="mt-2 text-sm text-red-400">{errors.serviceId.message}</p>}
      </fieldset>

      {/* Barber (optional) */}
      {barbersEnabled && barbers.length > 0 && (
        <fieldset>
          <legend className="field-label">2 · Barber (optional)</legend>
          <div className="flex flex-wrap gap-2">
            {barbers.map((b) => (
              <label
                key={b._id}
                className={cn(
                  'cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors',
                  watch('barber') === b.name
                    ? 'border-gold bg-gold/10 text-cream'
                    : 'border-line text-muted hover:border-gold/40',
                )}
              >
                <input type="radio" {...register('barber')} value={b.name} className="sr-only" />
                {b.name}
              </label>
            ))}
            <label
              className={cn(
                'cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors',
                !watch('barber') ? 'border-gold bg-gold/10 text-cream' : 'border-line text-muted hover:border-gold/40',
              )}
            >
               <input type="radio" {...register('barber')} value="" className="sr-only" />
              Any barber
            </label>
          </div>
        </fieldset>
      )}

      {/* Date */}
      <fieldset>
        <legend className="field-label">3 · Choose a date</legend>
        {!hours ? (
          <LoadingSpinner label="Loading hours" />
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((d) => (
              <button
                key={d.key}
                type="button"
                disabled={d.isClosed}
                onClick={() => setValue('date', d.key, { shouldValidate: true })}
                className={cn(
                  'flex w-[74px] shrink-0 flex-col items-center rounded-md border px-2 py-3 transition-colors',
                  d.isClosed && 'cursor-not-allowed opacity-30',
                  !d.isClosed && selectedDate === d.key && 'border-gold bg-gold/10 text-cream',
                  !d.isClosed && selectedDate !== d.key && 'border-line bg-ink-800 hover:border-gold/40',
                )}
              >
                <span className={cn('text-[10px] uppercase tracking-widest', d.isToday && 'text-gold')}>
                  {d.isToday ? 'Today' : d.weekday}
                </span>
                <span className="mt-1 font-tamil text-xl text-cream">{d.dayNum}</span>
                <span className="text-[10px] text-muted">{d.month}</span>
              </button>
            ))}
          </div>
        )}
        {!selectedDate && !hours ? null : !selectedDate ? (
          <p className="mt-2 text-xs text-muted">Pick a date to see available slots.</p>
        ) : null}
      </fieldset>

      {/* Time */}
      {selectedDate && (
        <fieldset>
          <legend className="field-label flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gold" /> 4 · Choose a time
          </legend>
          {slotsLoading ? (
            <LoadingSpinner label="Checking slots" />
          ) : slotsError ? (
            <ErrorMessage message="Unable to load slots. Please try again." onRetry={() => refetchSlots()} />
          ) : allSlots.length === 0 ? (
            <EmptyState title="No slots available on this day" body="Please pick another date." />
          ) : (
            <>
              <p className="mb-3 flex items-center gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gold" /> Available
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted/40" /> Booked
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {allSlots.map((slot) => {
                  const selected = watch('time') === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setValue('time', slot.time, { shouldValidate: true })}
                      className={cn(
                        'rounded-full border px-4 py-2 font-sans text-sm transition-colors',
                        !slot.available &&
                          'cursor-not-allowed border-line/60 text-muted/40 line-through',
                        slot.available && selected && 'border-gold bg-gold/10 text-gold',
                        slot.available && !selected && 'border-line text-muted hover:border-gold/40 hover:text-cream',
                      )}
                    >
                      {to12Hour(slot.time)}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </fieldset>
      )}

      {/* Details */}
      <fieldset className="space-y-4">
        <legend className="field-label flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-gold" /> 5 · Your details
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="booking-name" className="field-label">Name *</label>
            <input id="booking-name" type="text" className="field" placeholder="Your name" {...register('name')} />
            {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="booking-phone" className="field-label">Phone *</label>
            <input id="booking-phone" type="tel" className="field" placeholder={bi.phone} {...register('phone')} />
            {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone.message}</p>}
          </div>
          <div>
            <label htmlFor="booking-email" className="field-label">Email *</label>
            <input id="booking-email" type="email" className="field" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="booking-message" className="field-label">Message (optional)</label>
            <input id="booking-message" type="text" className="field" placeholder="Anything we should know…" {...register('message')} />
          </div>
        </div>
      </fieldset>

      {submitError && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">{submitError}</div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={submitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Booking…' : 'Book Your Style'}
        </button>
        <p className="text-xs text-muted">No advance payment. We will confirm your slot by phone.</p>
      </div>
    </form>
  );
}

function MotionConfirm({ confirmed, phone, waLink, onBack }: { confirmed: ConfirmedBooking; phone: string; waLink: string; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mx-auto max-w-lg overflow-hidden"
    >
      <div className="bg-gradient-to-br from-gold/20 via-ink-900 to-ink-900 px-8 pt-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/60 bg-gold/10">
          <CheckCircle2 className="h-8 w-8 text-gold" />
        </div>
        <h3 className="mt-6 font-tamil text-3xl text-cream">Appointment Request Received</h3>
        <p className="mt-2 text-sm text-muted">Your request is in — here is your reference.</p>
      </div>
      <div className="px-8 pb-8 pt-6">
        <div className="rounded-md border border-line bg-ink-800/60 p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted">Booking ID</p>
          <p className="mt-1 font-mono text-xl tracking-wide text-gold">{confirmed.bookingId}</p>
        </div>
        <dl className="mt-5 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-md border border-line bg-ink-800/40 px-4 py-3">
            <dt className="text-[10px] uppercase tracking-widest text-muted">Service</dt>
            <dd className="mt-1 text-cream">{confirmed.service}</dd>
          </div>
          <div className="rounded-md border border-line bg-ink-800/40 px-4 py-3">
            <dt className="text-[10px] uppercase tracking-widest text-muted">Date</dt>
            <dd className="mt-1 text-cream">{displayDate(confirmed.date)}</dd>
          </div>
          <div className="rounded-md border border-line bg-ink-800/40 px-4 py-3">
            <dt className="text-[10px] uppercase tracking-widest text-muted">Time</dt>
            <dd className="mt-1 text-cream">{to12Hour(confirmed.time)}</dd>
          </div>
          <div className="rounded-md border border-line bg-ink-800/40 px-4 py-3">
            <dt className="text-[10px] uppercase tracking-widest text-muted">Status</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                Pending
              </span>
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-center text-sm leading-relaxed text-muted">
          Our team will confirm your slot by phone shortly. No advance payment needed — pay after your service.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <a href={`tel:+91${phone}`} className="btn-primary">
            <Phone className="h-4 w-4" /> Call Now
          </a>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
        <button type="button" onClick={onBack} className="mt-6 inline-flex w-full items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-cream">
          <ArrowLeft className="h-3.5 w-3.5" /> Book another
        </button>
      </div>
    </motion.div>
  );
}
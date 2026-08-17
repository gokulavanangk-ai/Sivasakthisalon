# Architecture

## Overview

Two deployable apps in one repo:

- `backend/` — Express REST API (CommonJS output). Serves all content, bookings, and admin CMS APIs. Optionally serves `frontend/dist` as static files in production.
- `frontend/` — Vite + React single-page app (ESM). Talks to the API over `/api` with `withCredentials` cookies for admin auth.

```
Browser (SPA) ──(REST + httpOnly cookie JWT)──▶ Express API ──▶ MongoDB
     │                                              │
     └────────────── static assets ────────────────┴── uploads/ or Cloudinary
```

## Frontend

### Entry & routing

- `src/main.tsx` bootstraps providers (QueryClient, Theme, Auth) and `<App />`.
- `src/app/App.tsx` defines the router. Public pages live under `PublicLayout`; admin pages are lazily loaded inside the protected `AdminLayout`.
- Route transitions use `AnimatePresence` + `framer-motion`; scroll position resets to top on navigation.

### Data layer

- `src/lib/apiClient.ts` — an Axios instance (`api`, `apiForm`) with `withCredentials`, plus the `unwrap()` helper and `ApiClientError` (message + status + errorCode + details). All API errors are normalized to `ApiClientError`.
- `src/services/api.ts` — one typed function per endpoint (fetch/create/update/delete).
- `src/hooks/useContent.ts` — TanStack Query wrappers for salon/services/hairstyles/gallery/reviews/barbers/hours/slots with reasonable `staleTime`.
- `src/contexts/AuthContext.tsx` — session state from `GET /api/auth/me`, login/logout, drives admin route protection.
- `src/features/admin/mutations.ts` — typed mutation hooks per entity with query invalidation + toasts.

### Feature modules

- `features/home/` — Hero (video + poster/mobile fallback + scroll progress), Marquee, Story, Signature, Services, StylesShowcase (horizontal scroll), StyleFinder, ComboBuilder, BeforeAfter, Gallery, Reviews, FAQ, CTA.
- `features/styleFinder/engine.ts` — pure, rule-based recommendation engine (face shape + style type + hair type scoring). Unit tested.
- `features/booking/BookingForm.tsx` — multi-step form: service → optional barber → date → slot (from `/api/bookings/slots/available`) → details → confirmation.
- `features/beforeAfter/` — draggable slider; pairs gallery images whose titles end in `before` / `after`.

### Design system

`src/styles/index.css` declares Tailwind tokens and reusable components:

- Ink/charcoal background (`#080808` … `#171717`), cream text (`#F5F1E8`), muted (`#A8A29A`), gold accent (`#C8A96B`). Gold is **accent-only**.
- Utilities/classes: `container-x`, `eyebrow`, `h-display`, `btn-primary`, `btn-ghost`, `.card`, `.field`, `.input-dark`, `.grain`.

## Backend

### Request pipeline

`src/app.ts`:

1. `helmet` (CSP off — SPA served separately)
2. CORS restricted to `CLIENT_URL` (comma-separated allowed)
3. `pino-http` request logs
4. JSON body (1 MB limit)
5. `/uploads` static serving
6. `GET /api/health`
7. Rate limiting on `/api` (health exempt)
8. Route mounters: `/api/auth`, `/api/salon`, `/api/services`, `/api/hairstyles`, `/api/gallery`, `/api/reviews`, `/api/bookings`, `/api/hours`, `/api/barbers`
9. 404 + global error handler (normalized JSON errors)

### Validation & middleware

- Zod schemas in `src/validators/` are reused by `validate` middleware for body/query/params.
- `auth` middleware verifies the JWT from the httpOnly cookie (`req.cookies.token`).
- `rateLimiter` — global API limiter plus a stricter login limiter.
- `upload` — multer with 8 MB limit, jpg/png/webp only, random filenames.

### Booking + slots

- `services/slotService.ts` — generates time slots from `BusinessHours` (open/close, break, slot duration, timezone), hides past slots, blocks closed days and `blockedDates`.
- `services/bookingService.ts` — creates the booking with an atomic duplicate-slot guard; sends email notifications in a try/catch so a mail failure never fails the booking. Persists `emailStatus` + `emailStatusNote`.
- Statuses: `pending → confirmed | rejected → completed | cancelled`. Confirmation/status changes trigger emails.

### Singleton documents

- `SalonSettings` — brand, hero/about copy, socials, maps, toggles. One document, auto-created (`salonService.getOrCreate`).
- `BusinessHours` — weekly schedule + slot duration + blocked dates. One document, auto-created.

### Storage

`services/fileStorage.ts` abstracts two providers behind one interface:

- `local` — stores in `backend/uploads`, serves via `/uploads`
- `cloudinary` — stores via the Cloudinary SDK, returns `{ url, publicId }`

### Email

`services/emailService.ts` + `emailTemplate.ts`:

- SMTP is the only delivery channel (`EMAIL_*` envs via Nodemailer).
- If SMTP is not configured, falls back to a dev logger (no real emails sent).
- The salon notification email goes to `settings.notificationEmail` (falling back to `ADMIN_EMAIL`). The customer confirmation email is only sent when `settings.toggles.customerConfirmationEmail` is enabled (default OFF).
- Email failures never fail a booking — the outcome is recorded in the booking's `emailStatus`.

### Seed

`scripts/seed.ts` reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` (dev-only) to upsert the admin, then seeds services, hairstyles, reviews, and FAQs from `scripts/seedData.ts`. Idempotent.

## Data model

MongoDB collections (`src/models/`):

| Model            | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `Admin`          | username, email, name, Argon2 password hash |
| `SalonSettings`  | brand, copy, socials, maps, toggles (singleton) |
| `BusinessHours`  | weekly hours, break, slot duration, blocked dates (singleton) |
| `Service`        | booking-able services (price optional/hideable) |
| `Hairstyle`      | lookbook styles with face/style/hair tags |
| `GalleryItem`    | photos with category + title (before/after convention) |
| `Review`         | testimonials with rating |
| `Barber`         | optional team members for booking selection |
| `Booking`        | appointments with status + email status |

## Common workflows

- **Vite dev + API dev**: run `backend: npm run dev` and `frontend: npm run dev`; frontend proxies to `VITE_API_URL`.
- **Production**: `backend: npm run build && npm start`; `frontend: npm run build`. Serve `frontend/dist` behind a reverse proxy (e.g. Nginx) or via the API static middleware; enable the cookie `secure` flag and set `trust proxy` accordingly.
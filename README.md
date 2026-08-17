# சிவசக்தி சிகை அலங்காரம் — Sivasakthi Men's Salon

Production full-stack website for **Sivasakthi Men's Salon**, Pandian Nagar, Rosalpatti, Virudhunagar 626001 — a 23+ year establishment. English-first with a Tamil brand voice, cinematic dark-luxury design, an online booking system, admin CMS, MongoDB backend, and SMTP email notifications.

- Phone / WhatsApp: `+91 97904 46470`
- Instagram: [@sivasakthisalon](https://instagram.com/sivasakthisalon)
- Language: English-primary UI with Tamil accent text.

---

## Stack

| Layer     | Tech |
| --------- | ---- |
| Frontend  | React 18, Vite, TypeScript (strict), Tailwind CSS, Framer Motion, React Router v7, TanStack Query, react-hook-form + Zod |
| Backend   | Node.js, Express, TypeScript (compiled to CommonJS) |
| Database  | MongoDB + Mongoose |
| Auth      | JWT (httpOnly cookie) + Argon2 password hashing |
| Email     | Nodemailer (SMTP only) |
| Storage   | Local disk or Cloudinary (`STORAGE_PROVIDER=local\|cloudinary`) |
| Testing   | Vitest (backend + frontend), Supertest |

## Project layout

```
sivasakthisalon/
├── backend/            # Express REST API + admin CMS
│   └── src/
│       ├── config/     # env, db, logger
│       ├── controllers/
│       ├── middleware/ # auth, rate limiter, error handler, validate, upload
│       ├── models/     # Mongoose models
│       ├── routes/     # /api/* route files
│       ├── scripts/    # seed script + seed data
│       ├── services/   # booking, slots, email, storage, etc.
│       └── tests/      # Vitest + Supertest suites
├── frontend/           # Vite + React SPA
│   └── src/
│       ├── app/        # router + providers
│       ├── components/ # shared / navigation / cinematic UI
│       ├── constants/  # brand + copy constants
│       ├── contexts/   # auth, theme
│       ├── features/   # home, booking, style finder, before/after, faq…
│       ├── hooks/
│       ├── layouts/
│       ├── lib/        # api client, utils
│       ├── pages/      # public + admin pages
│       └── styles/     # design-system tokens (ink/cream/gold)
└── .env.example        # all environment variables, documented
```

## Getting started

Prerequisites: Node 20+, MongoDB (local or Atlas), and a `.env` per app.

### 1. Environment

```bash
cp .env.example backend/.env
cp .env.example frontend/.env
```

Edit the values as described in `.env.example`. Minimum required on the backend: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.

### 2. Backend

```bash
cd backend
npm install
npm run seed      # seed services, hairstyles, reviews, FAQs + admin from ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev       # starts on PORT (default 5000)
```

Verified scripts:

```bash
npm run typecheck
npm run build
npm test
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev       # starts Vite dev server (default 5173)
```

Verified scripts:

```bash
npm run typecheck
npm run test
npm run build
```

Visit `http://localhost:5173`. Admin dashboard: `http://localhost:5173/admin`.

## Booking flow

1. Customer picks a service → date (14 days ahead) → available time slot → details.
2. Slot collision is re-checked at creation time; duplicate slots are rejected.
3. Booking is created with status `pending`. Booking endpoints are **public** — no login is required to book.
4. The salon owner is emailed via SMTP (recipient = "Notification email" in Admin → Settings, falling back to `ADMIN_EMAIL`). The customer confirmation email is **off by default** and can be enabled in Admin → Settings.
5. **Email failure never blocks a booking** — failures are recorded in `emailStatus` (`pending | sent | failed`) and surfaced in the admin dashboard.
6. Admin confirms, and refetches slots so the schedule stays accurate.

## Feature toggles

Managed in the admin dashboard, stored on the salon settings document:

- `pricingVisible` — prices shown on the site (off by default)
- `beforeAfterEnabled` — Before/After slider section (off by default; pairs gallery images whose titles end in `before` / `after`)
- `reviewsEnabled` — customer reviews section (on by default)
- `faqEnabled` — FAQ section (on by default)
- `heroVideoEnabled` — cinematic hero video (graceful poster/mobile fallback)
- `bookingEnabled` — online booking
- `barberSelection` — optional barber choice in booking form
- `customerConfirmationEmail` — email the customer when a booking is received (off by default)

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design and data model
- [API.md](./API.md) — REST endpoint reference
- [SECURITY.md](./SECURITY.md) — security model and deployment hardening
# Security

This document describes the security model of the Sivasakthi Salon app and the hardening steps for production.

## Authentication & sessions

- **Passwords**: hashed with **Argon2id** (via `argon2`). Plain-text passwords are never stored or logged.
- **JWT**: signed with `JWT_SECRET` (must be long and random), delivered in an **httpOnly cookie** (`token`) — not accessible from JavaScript, reducing XSS risk.
- **Logout**: `POST /api/auth/login` sets the cookie, `POST /api/auth/logout` clears it server-side.
- Admin endpoints guard with both `authenticate` (cookie JWT valid) and `isAdmin`.
- The seed-created admin comes from the `ADMIN_EMAIL` / `ADMIN_PASSWORD` environment variables **only**; the password must be changed after first login (admin → Account).

## Rate limiting

- Global `/api` limiter protects every endpoint, with `/api/health` exempt.
- Stricter limiters on `POST /api/auth/login`, `POST /api/bookings`, and `GET /api/bookings/slots/available` to dampen brute force and spam.

## Input validation

- Every write endpoint is validated by a **Zod** schema before hitting the controller (body, and query where relevant). Invalid input returns normalized `400` responses.
- File uploads (`multer`): only `image/jpeg`, `image/png`, `image/webp`, max **8 MB**, randomized filenames to prevent path traversal / overwrite.

## Booking integrity

- Booking creation re-checks the requested slot atomically; a slot already taken in that window is rejected so two customers cannot claim the same time.
- A failed notification email never fails the booking write — `emailStatus` is persisted instead.

## HTTP hardening (Express)

- `helmet` sets common security headers (CSP deliberately disabled for the SPA; enable it if serving the frontend from this server).
- `express.json()` body limit capped at 1 MB.
- `pino-http` access logging; ensure logs omit secrets (do not log request bodies in production).

## Secrets hygiene

- `.env` files are git-ignored. Committed only `.env.example` with placeholder values.
- Never log `JWT_SECRET`, SMTP credentials, or database URIs.
- Rotate `JWT_SECRET` if it leaks; it invalidates existing sessions.

## Deployment hardening checklist

1. HTTPS everywhere (reverse proxy: Nginx / Caddy / Cloudflare).
2. Set `NODE_ENV=production`; point cookies to `secure: true` and set `trust proxy` so the app trusts the proxy's `X-Forwarded-Proto` (the app already sets `app.set('trust proxy', 1)` — keep this aligned with your proxy count).
3. Point `CLIENT_URL` at your real domain (comma-separated if multiple).
4. Use a dedicated low-privilege database user; restrict Mongo to the server's IP (or Atlas IP allowlist).
5. Back up `uploads/` (or use Cloudinary for storage) and the database on a schedule.
6. Keep dependencies patched: `npm audit` should report **0 vulnerabilities** on both `backend` and `frontend`.
7. Change the default admin password immediately after seeding.
8. Monitor `/api` logs for failed-login spikes; rely on the login rate limiter.

## Environment variables (secrets)

See `.env.example` for the full list. Secret-type values: `JWT_SECRET`, `ADMIN_PASSWORD`, `EMAIL_PASSWORD`, `CLOUDINARY_API_SECRET`, `MONGO_URI`.
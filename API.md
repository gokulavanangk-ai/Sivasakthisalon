# API Reference

Base URL: `http://localhost:5000/api` in development (see `VITE_API_URL`). All routes are prefixed with `/api`.

## Conventions

- JSON in, JSON out. Responses follow `{ success, message?, data }`.
- Public listing endpoints accept `?includeInactive=true` (admin only; still requires auth for the flag to take effect server-side).
- Admin endpoints require an **httpOnly `token` cookie** set by `POST /auth/login`. Non-admin requests return `401`.
- Errors are normalized: `{ success: false, errorCode, message, details? }`.
- `POST /auth/login`, `POST /bookings`, and `GET /bookings/slots/available` are rate limited.

## Health

| Method | Path          | Auth  | Description                |
| ------ | ------------- | ----- | -------------------------- |
| GET    | `/api/health` | none  | `{ status: 'up', time }` |

## Auth

| Method | Path                  | Auth  | Description                          |
| ------ | --------------------- | ----- | ------------------------------------ |
| POST   | `/api/auth/login`     | none  | `{ identifier, password }` → sets cookie, returns admin |
| POST   | `/api/auth/logout`    | none  | Clears the session cookie            |
| GET    | `/api/auth/me`        | admin | Returns the current admin             |
| PUT    | `/api/auth/profile`   | admin | `{ name?, email?, username? }`         |
| PUT    | `/api/auth/password`  | admin | `{ currentPassword, newPassword, confirmPassword }` |

## Salon & content

| Method | Path                 | Auth  | Description                              |
| ------ | -------------------- | ----- | ---------------------------------------- |
| GET    | `/api/salon`         | none  | Salon settings (brand, copy, toggles)      |
| PUT    | `/api/salon`         | admin | Update salon settings                      |
| POST   | `/api/salon/logo`    | admin | multipart `logo` field → `{ url, publicId }` |
| DELETE | `/api/salon/logo`    | admin | Remove logo, fall back to text logo         |
| GET    | `/api/hours`         | none  | Business hours + slot duration              |
| PUT    | `/api/hours`         | admin | Update hours / blocked dates              |
| GET    | `/api/barbers`       | none  | Paginated list of barbers                   |
| POST   | `/api/barbers`       | admin | Create barber                               |
| PUT    | `/api/barbers/:id`   | admin | Update barber                               |
| DELETE | `/api/barbers/:id`   | admin | Delete barber                               |

## Services

| Method | Path                  | Auth  | Description                  |
| ------ | --------------------- | ----- | ---------------------------- |
| GET    | `/api/services`       | none  | Paginated services (`?page=`, `?limit=`, `?includeInactive=`) |
| GET    | `/api/services/:id`   | none  | Single service               |
| POST   | `/api/services`       | admin | Create service               |
| PUT    | `/api/services/:id`   | admin | Update service               |
| DELETE | `/api/services/:id`   | admin | Delete service               |

Prices are optional and hidden on the site unless `toggles.pricingVisible` is on.

## Hairstyles

| Method | Path                   | Auth  | Description        |
| ------ | ---------------------- | ----- | ------------------ |
| GET    | `/api/hairstyles`      | none  | List (optional `?includeInactive=`) |
| POST   | `/api/hairstyles`      | admin | Create             |
| PUT    | `/api/hairstyles/:id`  | admin | Update             |
| DELETE | `/api/hairstyles/:id`  | admin | Delete             |

A hairstyle carries `faceShapes`, `styleTypes`, and `hairTypes` used by the on-site Style Finder.

## Gallery

| Method | Path                | Auth  | Description                          |
| ------ | ------------------- | ----- | ------------------------------------ |
| GET    | `/api/gallery`      | none  | List photos (optional `?includeInactive=`) |
| POST   | `/api/gallery`      | admin | multipart `image` + `title`, `description`, `category` |
| PUT    | `/api/gallery/:id`  | admin | multipart update (image optional)     |
| DELETE | `/api/gallery/:id`  | admin | Delete                               |

Images whose titles end in `before` / `after` and share similar titles are joined as pairs for the Before/After section.

## Reviews

| Method | Path                 | Auth  | Description             |
| ------ | -------------------- | ----- | ----------------------- |
| GET    | `/api/reviews`       | none  | List (optional `?includeInactive=`) |
| POST   | `/api/reviews`       | admin | Create testmonial       |
| PUT    | `/api/reviews/:id`   | admin | Update                  |
| DELETE | `/api/reviews/:id`   | admin | Delete                  |

## FAQs

| Method | Path             | Auth  | Description              |
| ------ | ---------------- | ----- | ------------------------ |
| GET    | `/api/faqs`      | none  | List (optional `?includeInactive=`) |
| POST   | `/api/faqs`      | admin | `{ question, answer, sortOrder?, isActive? }` |
| PUT    | `/api/faqs/:id`  | admin | Update                   |
| DELETE | `/api/faqs/:id`  | admin | Delete                   |

## Bookings

| Method | Path                            | Auth  | Description |
| ------ | ------------------------------- | ----- | ----------- |
| GET    | `/api/bookings/slots/available` | none  | `?date=YYYY-MM-DD` → `{ date, slots: [{ time, available }] }` |
| POST   | `/api/bookings`                 | none  | Create booking (see payload below) |
| GET    | `/api/bookings/lookup/:bookingId` | none | Find a booking by its public booking ID |
| GET    | `/api/bookings`                 | admin | Paginated (`?page=&status=&q=&limit=`) |
| GET    | `/api/bookings/:id`             | admin | Single booking            |
| PUT    | `/api/bookings/:id/status`      | admin | `{ status }` → `pending\|confirmed\|completed\|cancelled\|rejected` |

### Booking payload

```json
{
  "name": "Kumar",
  "phone": "9790446470",
  "email": "kumar@example.com",
  "service": "Premium Fade",
  "serviceId": "<service id>",
  "barber": "Murugan",
  "date": "2026-08-20",
  "time": "18:30",
  "message": "Prefer a low fade"
}
```

On success: `{ bookingId, status: "pending" }`. The booking is persisted even if notification emails fail — `emailStatus` (`pending | sent | failed`) records the outcome. The salon receives a notification email at the address configured in `settings.notificationEmail` (falling back to `ADMIN_EMAIL`); the customer confirmation email is only sent when `settings.toggles.customerConfirmationEmail` is enabled.

## Slot generation

Slots are generated from `BusinessHours`: open/close times, break window, and `slotDurationMinutes`, taking `timezone` and the server's local time into account. Past slots, closed days, and dates in `blockedDates` are excluded.
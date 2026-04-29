# Internship Application Tracker

A production-oriented internship application tracker for students managing high-volume recruiting pipelines.  
Built with Next.js App Router, TypeScript, Prisma, PostgreSQL, and NextAuth.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling/UI:** Tailwind CSS v4, shadcn/ui, lucide-react
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth (credentials + Prisma adapter)
- **Charts:** Recharts
- **Forms/Validation:** React Hook Form + Zod
- **Testing:** Vitest

## Features

- Dashboard with pipeline metrics, deadlines, interviews, and insights
- Applications management:
  - Table + compact list views
  - Filters/search
  - Detailed application page with timeline/activity
- Kanban pipeline for status movement
- Calendar agenda for deadlines/interviews/tasks/reminders
- Global Tasks, Contacts, and Documents pages
- Analytics charts and conversion funnel
- Email template generator (copy-ready)
- Import/Export:
  - CSV import with duplicate checks
  - CSV/JSON export routes
- Deterministic smart helpers:
  - Deadline urgency
  - Next action suggestion
  - JD keyword extraction
  - Duplicate detection

## Project Structure

```text
src/
  app/
    (app)/dashboard
    (app)/applications
    (app)/kanban
    (app)/calendar
    (app)/tasks
    (app)/contacts
    (app)/documents
    (app)/analytics
    (app)/settings
    (app)/email-templates
    api/
  components/
  constants/
  hooks/
  lib/
    analytics/
    csv/
    email-templates/
    reminders/
    services/
    utils/
    validations/
  actions/
prisma/
  schema.prisma
  seed.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/intern_tracker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-long-random-secret"
```

3. Generate client + migrate:

```bash
npm run db:generate
npm run db:migrate
```

4. Seed demo data:

```bash
npm run db:seed
```

5. Start dev server:

```bash
npm run dev
```

## Demo Account

After seeding:

- **Email:** `demo@interntracker.dev`
- **Password:** `password123`

## Scripts

- `npm run dev` – run development server
- `npm run typecheck` – TypeScript check
- `npm run lint` – ESLint
- `npm run test` – Vitest
- `npm run build` – production build
- `npm run db:generate` – Prisma client generation
- `npm run db:migrate` – Prisma migration
- `npm run db:seed` – seed sample dataset
- `npm run vercel-build` – Vercel-safe build (`prisma generate && prisma db push && next build`)

## Vercel Deployment (Neon-friendly)

Use this when you only have Neon pooled connection access.

1. In Vercel project env vars, set:
   - `DATABASE_URL` (Neon pooled URL)
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
2. Build command in Vercel:
   - `npm run vercel-build`
3. Redeploy with **Clear build cache** if previous builds failed.

This project intentionally uses `prisma db push` in Vercel build to ensure tables are created even when direct migration connection is unavailable.

## API Surface (MVP)

- Applications:
  - `GET/POST /api/applications`
  - `GET/PATCH/DELETE /api/applications/[id]`
  - `PATCH /api/applications/[id]/status`
- Entities:
  - `GET/POST /api/interviews`
  - `GET/POST /api/tasks`
  - `GET/POST /api/contacts`
  - `GET/POST /api/documents`
- Analytics/Dashboard:
  - `GET /api/dashboard/stats`
  - `GET /api/analytics/summary`
  - `GET /api/upcoming-events`
- Import/Export:
  - `GET /api/export/json`
  - `GET /api/export/csv`
  - `POST /api/import/csv`

## Security Notes

- Auth-protected app routes and API routes
- User ownership checks in service layer
- Zod validation on create/update flows
- Sanitization for user-generated text fields

## Testing Coverage

Current unit/integration tests include:

- Deadline urgency logic
- Status health
- Duplicate detection
- Keyword extraction
- Next action suggestion
- Analytics conversion metrics
- CSV parsing
- Mocked integration for application creation/status updates

## Future Improvements

- Full drag-and-drop Kanban UX
- Rich CSV mapping UI with merge workflows
- File uploads/storage integration
- Notification delivery channels (email/push/calendar APIs)
- Deeper analytics slices and trend forecasting
- E2E coverage with Playwright

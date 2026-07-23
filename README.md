# Excel Test — Digital Service Report

Full app: login, dashboard, service report editor with signatures and PDF
export, backed by Supabase (Postgres + Auth), containerized with Docker,
ready to deploy to a staging environment.

---

## 1. Set up Supabase (do this first)

1. Create a project at [supabase.com](https://supabase.com) (region: **Singapore**).
2. In **SQL Editor**, run `service_report_schema.sql`, then run
   `supabase_auth_setup.sql` (in that order).
3. In **Authentication → Users**, add a user for yourself (real email +
   password) — this replaces the old hardcoded Superadmin login.
4. In **Project Settings → API**, copy your **Project URL**, **anon public
   key**, and **service_role key**.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the three Supabase
values from above:

```bash
cp .env.local.example .env.local
```

## 3. Run locally (without Docker, for day-to-day development)

```bash
npm install
npm run dev
```

Open **http://localhost:3000** and log in with the Supabase user you created.

## 4. Run locally with Docker

Docker Compose reads a plain `.env` file (not `.env.local`) for variable
substitution, so create one with the same three values:

```bash
cp .env.local.example .env
docker compose up --build
```

Open **http://localhost:3000** — same app, now running in a container.

> Note: I wasn't able to test-build this Docker image myself (no Docker
> available in the environment I built this in). The Dockerfile follows
> Next.js's standard "standalone output" pattern, but please run the
> build yourself and let me know if anything needs adjusting.

## 5. Deploy to staging (Railway — recommended)

1. Push this project to a GitHub repository.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy
   from GitHub repo**. Railway detects the `Dockerfile` automatically.
3. In the service's **Variables** tab, add the same three Supabase values
   from `.env.local`.
4. Railway gives you a public `*.up.railway.app` URL — share that with
   your client for testing.

Because all data now lives in Supabase (not in the container), you do
**not** need a persistent volume for staging — redeploys are safe and
data is never lost.

## 6. What's inside

```
src/
  app/
    login/               — real Supabase email/password login
    dashboard/            — protected dashboard (Supabase session check)
    reports/               — list, new-report redirect, report editor
    api/reports/            — CRUD routes (Supabase-backed)
  components/
    ReportForm.tsx          — the main report editor
    SignaturePad.tsx         — signature capture
    PartsTable.tsx            — dynamic parts-replaced table
    Sidebar.tsx                — nav + logout
  lib/
    supabase/client.ts          — browser Supabase client
    supabase/server.ts           — server Supabase client (cookie-based session)
    store.ts                      — all data access (Postgres via Supabase)
    types.ts                       — shared TypeScript types
  middleware.ts                     — protects /dashboard and /reports

service_report_schema.sql   — core tables + job number sequence
supabase_auth_setup.sql      — links Supabase Auth users to reports + RLS
Dockerfile / docker-compose.yml / .dockerignore  — containerization
```

## 7. Known gaps to be aware of before client testing

- Row Level Security currently allows **any logged-in user** to see/edit
  all reports (see `supabase_auth_setup.sql`). Fine for early testing;
  tighten to per-technician access before wider rollout.
- PDF generation runs client-side (html2canvas + jsPDF). Works well, but
  moving it server-side later (e.g. Puppeteer) would let you also
  auto-email PDFs to clients rather than just downloading them.
- No client-facing portal yet — this is technician-facing only for now.

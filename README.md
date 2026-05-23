# Decision Debt

Decision Debt is a persistent decision management app for unresolved choices. It captures deadlines, stakes, blockers, options, pros and cons, next actions, outcomes, and a Decision Debt Score so users can commit, defer, delegate, or delete with less mental clutter.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres with row level security
- Server actions for writes
- Vercel-ready deployment

## Features

- Email/password sign up, login, and logout
- Protected app routes
- User-scoped data through Supabase RLS
- Decision inbox with search, filters, sorting, CRUD
- Decision Debt Score from age, deadline proximity, stakes, impact, confidence, and blockers
- Decision detail pages with options, pros, cons, missing information, next action, and history
- Guided resolution flow for commit, defer, delegate, and delete
- Weekly review mode with one decision at a time
- Dashboard metrics, category breakdown, recent resolutions, and top 3 decisions
- History and analytics for resolution time, repeated blockers, categories, and outcomes
- Demo data button for judges

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project.

3. In the Supabase SQL editor, run:

```sql
-- paste supabase/migrations/001_initial_schema.sql
```

4. Copy the environment file:

```bash
cp .env.example .env.local
```

5. Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

6. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Without those environment variables, the app shows `/setup` with the required
configuration values instead of crashing.

## Supabase Auth

In Supabase, enable Email auth. For fastest judging, disable email confirmation in the Auth provider settings. If confirmation is enabled, Supabase will send a confirmation link that returns to `/auth/callback`.

## Demo Story

1. Sign up or log in.
2. Click `Load demo data`.
3. Open the dashboard and note the critical decisions.
4. Enter review mode.
5. Compare options for a critical decision.
6. Commit to an option.
7. Return to the dashboard and see the critical count improve.

The demo seed replaces prior demo records for the signed-in user and leaves manually created decisions intact.

## Database

The migration creates:

- `profiles`
- `decisions`
- `decision_options`
- `decision_option_pros_cons`
- `decision_events`

Every table has RLS enabled. Policies restrict reads and writes to the authenticated owner. Demo data is marked with `is_demo` so the seed action can refresh only sample records.

## Deployment on Vercel

1. Import the repository into Vercel.
2. Add the same Supabase environment variables in Vercel project settings.
3. Deploy.
4. In Supabase Auth URL settings, add the Vercel production URL and callback URL:

```text
https://your-app.vercel.app
https://your-app.vercel.app/auth/callback
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

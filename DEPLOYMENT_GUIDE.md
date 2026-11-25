# Deployment Guide

Production topology:

```
Browser ──► Vercel (React SPA)
               │  HTTPS /api/v1
               ▼
         Render / Railway (Express API + Socket.IO)
               │  Prisma (service role)
               ▼
         Supabase Postgres (RLS) + Auth + Storage
               │
               └── Redis (BullMQ jobs, optional but recommended)
```

## 1. Provision infrastructure

1. **Supabase** production project (Pro plan recommended for backups and no auto-pause).
2. **Vercel** project pointing at the repository with root directory `client`.
3. **Render/Railway** web service pointing at the repository with root directory `server`.
4. **Redis** instance (Upstash, Render Redis, or ElastiCache) if background jobs are enabled.

## 2. Database

Use direct connections for migrations and pooled connections at runtime.

```bash
export DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres"
export DIRECT_URL="$DATABASE_URL"

pnpm --filter server exec prisma migrate deploy
psql "$DIRECT_URL" -f server/prisma/rls.sql
```

`prisma migrate deploy` is idempotent and safe to run on every release. Never run `prisma db push` against production.

Verify RLS:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public';
```

Every public table should show `rowsecurity = true` and tenant tables should have a `tenant_isolation` policy.

## 3. Server deployment (Render example)

Build command:

```bash
pnpm install --frozen-lockfile && pnpm --filter shared build && pnpm --filter server db:generate && pnpm --filter server build
```

Start command:

```bash
node server/dist/index.js
```

Environment variables:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | Provided by the platform |
| `FRONTEND_URL` | `https://app.example.ac.ke` |
| `SUPABASE_URL` | Production project URL |
| `SUPABASE_ANON_KEY` | Production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production service-role key (secret) |
| `DATABASE_URL` | Pooled Supabase connection string |
| `DIRECT_URL` | Direct Supabase connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | 32+ random characters each |
| `REDIS_URL` | Managed Redis URL |
| `MPESA_*` | Production Daraja credentials |
| `SMTP_*`, `EMAIL_FROM` | Transactional email provider |

Health check path: `/health`. Enable auto-deploy from `main` after CI passes. For Socket.IO, disable request buffering and allow WebSockets on the platform.

## 4. Client deployment (Vercel)

- Framework preset: **Vite**
- Build command: `pnpm --filter client build`
- Output directory: `client/dist`
- Install command: `pnpm install --frozen-lockfile`

Environment variables:

```dotenv
VITE_API_URL=https://api.example.ac.ke/api/v1
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SOCKET_URL=https://api.example.ac.ke
```

Add the production domain to Supabase Auth → URL Configuration (Site URL and `/reset-password` redirect). Configure the SPA rewrite so unknown paths serve `index.html`.

## 5. CI/CD

`.github/workflows/ci.yml` runs on every push and pull request: install, Prisma generate, shared build, typecheck, tests with coverage, server build and client build.

`.github/workflows/cd.yml` runs on `v*` tags or manual dispatch. Configure these repository secrets and a `production` environment:

| Secret | Purpose |
| --- | --- |
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | Client deployment |
| `RENDER_DEPLOY_HOOK` | Server deployment |
| `DATABASE_URL`, `DIRECT_URL` | Production migration step |

Deployments are skipped gracefully when a secret is absent, so the workflow can be adopted incrementally.

## 6. Post-deployment checks

```bash
curl https://api.example.ac.ke/health
curl -I https://app.example.ac.ke
```

- Sign in with each role and confirm navigation matches permissions.
- Confirm a parent cannot request another school's data with a forged `x-school-id`.
- Create a test invoice and payment; verify decimals and balance.
- Trigger a password reset and confirm the email link returns to the production domain.
- Check Supabase logs for RLS denials and Postgres connection saturation.

## 7. Backups and monitoring

- Enable Supabase daily backups and point-in-time recovery on the paid plan.
- Export a logical backup weekly: `pg_dump "$DIRECT_URL" --format=custom --file=sms-$(date +%F).dump`.
- Monitor: API 5xx rate, p95 latency, Prisma pool exhaustion, Redis queue depth, failed M-Pesa callbacks.
- Ship server logs (Winston JSON) to the platform log drain; alert on `level=error`.
- Keep audit logs for at least one academic year; they are append-only from the API.

## 8. Rollback

1. Re-deploy the previous Vercel deployment and Render release.
2. Apply forward-only database fixes; do not edit applied migrations.
3. If a migration must be reverted, write a new compensating migration and test it on a staging copy first.
4. Restore from a Supabase backup only as a last resort; announce data loss explicitly.

## 9. Scaling notes

- The API is stateless; scale horizontally behind the platform load balancer. Socket.IO needs sticky sessions or a Redis adapter when running more than one instance.
- Use the pooled Supabase connection string (pgbouncer, port 6543) and keep `connection_limit` modest per instance.
- Dashboard aggregates are indexed for the common filters; move to materialised views if a school exceeds tens of thousands of marks.
- Offload report-card PDFs and bulk SMS to BullMQ workers.

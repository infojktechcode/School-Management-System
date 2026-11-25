# Environment Setup

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 22.x | `node --version` |
| pnpm | 12.x | `corepack enable && corepack prepare pnpm@12.23.0 --activate` |
| Git | any recent | |
| Supabase project | free tier or higher | Postgres 15, Auth, Storage |
| Redis | 7.x | optional in development; required for BullMQ jobs |

## 1. Install dependencies

```bash
git clone <repository-url> school-management-system
cd school-management-system
pnpm install
```

`pnpm-workspace.yaml` approves the `esbuild` and Prisma build scripts. If your pnpm version prompts for build approvals, run `pnpm approve-builds --all`.

## 2. Configure environment variables

Copy the template and fill in real values. The root `.env` is the single source of truth; `server/.env` is a symlink to it.

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `SUPABASE_URL` | yes | `https://<project-ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | yes | Public anon key; safe for the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server only — never expose to the client |
| `DATABASE_URL` | yes | Pooled connection string (port 6543, `pgbouncer=true`) for the API |
| `DIRECT_URL` | yes | Direct connection (port 5432) for migrations |
| `JWT_SECRET` | yes | ≥32 characters |
| `JWT_REFRESH_SECRET` | yes | ≥32 characters, different from `JWT_SECRET` |
| `JWT_EXPIRES_IN` | no | Default `7d` |
| `JWT_REFRESH_EXPIRES_IN` | no | Default `30d` |
| `PORT` | no | Default `4000` |
| `FRONTEND_URL` | yes | Used in password-reset links, CORS |
| `REDIS_URL` | no | `redis://localhost:6379` for queues and cache |
| `SMTP_*`, `EMAIL_FROM` | no | Transactional email |
| `MPESA_*` | no | Daraja credentials for fee payments |
| `MAX_FILE_SIZE`, `ALLOWED_FILE_TYPES` | no | Upload limits |
| `DEFAULT_CURRENCY`, `DEFAULT_TIMEZONE`, `DEFAULT_DATE_FORMAT`, `DEFAULT_LOCALE` | no | Kenya defaults are preset |

Client variables live in `client/.env` (or the root `.env` for Vite):

```dotenv
VITE_API_URL=http://localhost:4000/api/v1
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SOCKET_URL=http://localhost:4000
```

> The service-role key must never appear in any `VITE_*` variable.

## 3. Prepare Supabase

1. Create a project at [supabase.com](https://supabase.com) and note the project ref.
2. Project Settings → Database → copy the pooled and direct connection strings into `DATABASE_URL` and `DIRECT_URL`.
3. Project Settings → API → copy the URL, anon key and service-role key.
4. Authentication → URL Configuration → set Site URL to `http://localhost:5173` and add `http://localhost:5173/reset-password` as a redirect URL.
5. Authentication → Providers → keep Email enabled; disable public sign-ups if staff accounts are provisioned centrally.

## 4. Create the schema

```bash
pnpm --filter server db:generate
pnpm --filter server db:push
```

Apply RLS policies and performance indexes:

```bash
psql "$DIRECT_URL" -f server/prisma/rls.sql
# or paste the file into the Supabase SQL editor
```

For production, use migrations instead of `db push`:

```bash
pnpm --filter server exec prisma migrate dev --name init
pnpm --filter server db:migrate:prod
```

## 5. Seed demo data

```bash
pnpm --filter server db:seed
```

The seed is idempotent and creates:

- 14 roles and the full permission catalogue, with the RBAC matrix applied.
- A demo school (`DEMO001`) with Kenyan locale settings.
- Academic year 2026, three terms, Grades 1–12, streams for Grades 7–9.
- Eight subjects, five departments, KCSE and CBC grading systems.
- 12 students with guardians, invoices, payments, attendance and enrollments.
- One demo account per role (see below).

To also create matching Supabase Auth users, set `SEED_PROVISION_AUTH=true` and optionally `SEED_DEFAULT_PASSWORD`.

### Demo accounts

| Role | Email |
| --- | --- |
| Super Admin | `superadmin@demo.school.ac.ke` |
| School Admin | `admin@demo.school.ac.ke` |
| Principal | `principal@demo.school.ac.ke` |
| Deputy Principal | `deputy@demo.school.ac.ke` |
| Director of Studies | `studies@demo.school.ac.ke` |
| Bursar | `bursar@demo.school.ac.ke` |
| Teacher | `teacher@demo.school.ac.ke` |
| Class Teacher | `classteacher@demo.school.ac.ke` |
| Librarian | `librarian@demo.school.ac.ke` |
| School Nurse | `nurse@demo.school.ac.ke` |
| Transport Manager | `transport@demo.school.ac.ke` |
| Receptionist | `reception@demo.school.ac.ke` |
| Parent | `parent@demo.school.ac.ke` |
| Student | `student@demo.school.ac.ke` |

Default password: `Demo@Passw0rd!` (override with `SEED_DEFAULT_PASSWORD`). Change it before sharing any environment.

## 6. Run the application

```bash
pnpm dev
```

| Service | URL |
| --- | --- |
| Client | http://localhost:5173 |
| API | http://localhost:4000 |
| Health | http://localhost:4000/health |
| Prisma Studio | `pnpm db:studio` |

The Vite dev server proxies `/api` to port 4000, so the default `VITE_API_URL=/api/v1` works without CORS configuration.

## 7. Verify

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Invalid environment configuration` | A required variable is missing or a JWT secret is shorter than 32 characters |
| `P1001: Can't reach database server` | Supabase project paused, wrong host, or network blocks port 5432/6543 |
| `@prisma/client did not initialize` | Run `pnpm --filter server db:generate` |
| Shared package types missing | Run `pnpm --filter shared build` before typechecking server or client |
| `ERR_PACKAGE_PATH_NOT_EXPORTED` from date-fns | Ensure `date-fns-tz` is v3 with `date-fns` v3 |
| 401 after login | The local `users` row must link to the Supabase user (`supabaseUserId`) |
| 403 with `x-school-id` | A regular user tried to access another school; super admins must choose a school |

# School Management System

A multi-tenant school management platform for Kenyan primary and secondary schools. It covers admissions, staff, academics, CBC and 8-4-4 grading, attendance, examinations, fees with M-Pesa, library, transport and communication.

Built with React 18, TypeScript, Vite and Tailwind on the client; Express, Prisma and Supabase on the server. Shared types, Zod schemas and the RBAC matrix live in a workspace package so the API and UI cannot drift apart.

## Highlights

- **14 roles, 50+ permissions.** Super Admin, School Admin, Principal, Deputy, Director of Studies, Bursar, Teacher, Class Teacher, Librarian, Nurse, Transport Manager, Receptionist, Parent and Student.
- **Strict tenant isolation.** Every school-owned query is scoped by `school_id`; RLS protects the Supabase Data API; the `tenant` middleware rejects forged school headers.
- **Kenya-first defaults.** KES, `Africa/Nairobi`, `DD/MM/YYYY`, `en-KE`, KCSE and CBC grading systems, M-Pesa payment fields.
- **Financial integrity.** `decimal(12,2)` money, server-side payment validation, unique payment references, transactional balance updates.
- **Configurable grading.** Schools own their grading systems and scales; nothing is hardcoded.
- **Soft deletes.** Academic and financial history is preserved.

## Repository layout

```
.
├── client/                 React + Vite SPA
│   ├── src/components/     UI primitives and dashboard widgets
│   ├── src/hooks/          Auth, permissions, school and dashboard hooks
│   ├── src/layouts/        Sidebar, header, breadcrumbs, main shell
│   ├── src/pages/          Auth pages, dashboard, profile
│   └── tests/              Vitest + Testing Library tests
├── server/                 Express API
│   ├── prisma/             Schema, seeds, RLS SQL
│   ├── src/config/         Env, Prisma, Supabase, Redis
│   ├── src/middleware/     Auth, RBAC, tenant, validation, errors, rate limits
│   ├── src/modules/        Auth, dashboard, schools
│   └── tests/              Vitest + Supertest tests
├── shared/                 Types, constants, RBAC, utilities, Zod schemas
└── docs/                   Implementation plans
```

## Quick start

```bash
pnpm install
cp .env.example .env            # fill in Supabase and JWT values
pnpm --filter shared build
pnpm --filter server db:generate
pnpm --filter server db:push
psql "$DIRECT_URL" -f server/prisma/rls.sql
pnpm --filter server db:seed
pnpm dev
```

| Service | URL |
| --- | --- |
| Client | http://localhost:5173 |
| API | http://localhost:4000 |
| Health | http://localhost:4000/health |

Demo login: `admin@demo.school.ac.ke` / `Demo@Passw0rd!`. See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for every seeded role and the full configuration reference.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run API and client together |
| `pnpm build` | Build shared, server and client |
| `pnpm test` | Run all Vitest suites |
| `pnpm typecheck` | Typecheck every package |
| `pnpm db:generate` | Regenerate the Prisma client |
| `pnpm db:push` | Sync a development database |
| `pnpm db:migrate` | Create a migration |
| `pnpm db:seed` | Load demo data (idempotent) |
| `pnpm db:studio` | Open Prisma Studio |

## API surface (Phase 1)

- `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`
- `POST /api/v1/auth/forgot-password`, `/reset-password`
- `GET|PATCH /api/v1/auth/me`, `POST /api/v1/auth/change-password`
- `GET /api/v1/schools/public`, `/schools/current`
- `GET /api/v1/dashboard`
- `GET /health`

Full request and response examples are in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Documentation

| Document | Contents |
| --- | --- |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Entity groups, conventions, RLS and indexes |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Endpoints, envelopes, auth and authorization |
| [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) | Prerequisites, env vars, Supabase, seeds, troubleshooting |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Vercel + Render + Supabase, CI/CD, backups, rollback |
| [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) | Pre-release security and Kenya DPA checklist |
| [PROJECT_PROGRESS.md](PROJECT_PROGRESS.md) | Phase-by-phase status |

## Testing

```bash
pnpm test
```

- Shared: utilities, RBAC, grading and schema tests.
- Server: auth middleware and service, tenant isolation, validation, response envelope, health and 404 handling. Supabase and Prisma are mocked, so no live database is needed.
- Client: UI primitives, stat cards, permission hooks, route guards and formatting.

CI runs typecheck, tests with coverage and both builds on every push and pull request (`.github/workflows/ci.yml`).

## License

Proprietary. All rights reserved.

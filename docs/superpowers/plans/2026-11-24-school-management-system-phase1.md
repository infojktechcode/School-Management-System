# School Management System - Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the complete project structure with Vite + React + Express + TypeScript, configure Supabase, set up Prisma ORM with comprehensive database schema, implement authentication with role-based access control, and create the main application layout with dashboard.

**Architecture:** Monorepo structure with `client/` (Vite + React + TypeScript + Tailwind + shadcn/ui) and `server/` (Express + TypeScript + Prisma + Supabase). Shared types and utilities in `shared/`. Supabase provides managed PostgreSQL, Auth, Storage, and Realtime. Prisma manages database schema and migrations. Express handles business logic and API routes.

**Tech Stack:** Node.js 22, TypeScript 5, Vite 5, React 18, Express 4, Prisma 5, Supabase JS SDK, Tailwind CSS 3, shadcn/ui, TanStack Query, React Hook Form, Zod, Vitest, Playwright, Socket.IO, BullMQ, Redis.

**Spec:** /home/jk-tech-code/Projects/School-Systems/School Management System/MASTER_PROJECT_PROMPT.md

## Global Constraints

- Every school-owned record must be associated with the correct school_id for multi-tenant isolation
- Use UUIDs for all primary keys
- Use decimal(12,2) for all monetary amounts
- Enable RLS on all tables in public schema
- Never expose service_role key in frontend
- All API routes must have authentication and authorization middleware
- Use Prisma transactions for critical operations
- Kenya locale defaults: currency=KES, timezone=Africa/Nairobi, date format=DD/MM/YYYY
- Academic grading structures must be configurable, not hardcoded
- Preserve historical academic and financial records (soft deletes only)
- Use database-level constraints for duplicate prevention (unique indexes)

## Review Focus

1. **Multi-tenant data isolation** - Cross-school data leakage through missing school_id filters in queries
2. **Authentication bypass** - API routes accessible without valid JWT or with expired tokens
3. **Authorization escalation** - Users accessing resources beyond their role permissions (e.g., teacher accessing another class's grades)
4. **Financial data integrity** - Payment recording without server-side verification, duplicate transactions, decimal precision errors
5. **RLS policy gaps** - Tables accessible via Supabase Data API without proper row-level policies

---

### Task 1: Initialize Monorepo Structure and Root Configuration

**Files:**
- Create: `package.json` (root)
- Create: `tsconfig.json` (root)
- Create: `.gitignore`
- Create: `.env.example`
- Create: `.env` (from user input)
- Create: `pnpm-workspace.yaml`
- Create: `README.md`
- Create: `PROJECT_PROGRESS.md`

**Interfaces:**
- Produces: Root workspace configuration, shared TypeScript config, environment template

- [ ] **Step 1: Create root package.json with workspaces configuration**

```json
{
  "name": "school-management-system",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["client", "server", "shared"],
  "scripts": {
    "dev": "concurrently \"pnpm --filter server dev\" \"pnpm --filter client dev\"",
    "build": "pnpm --filter shared build && pnpm --filter server build && pnpm --filter client build",
    "test": "pnpm --filter shared test && pnpm --filter server test && pnpm --filter client test",
    "db:generate": "pnpm --filter server db:generate",
    "db:push": "pnpm --filter server db:push",
    "db:migrate": "pnpm --filter server db:migrate",
    "db:seed": "pnpm --filter server db:seed",
    "db:studio": "pnpm --filter server db:studio"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "typescript": "^5.4.0"
  },
  "engines": { "node": ">=22.0.0" }
}
```

- [ ] **Step 2: Create root tsconfig.json with project references**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@school-mgmt/shared/*": ["shared/src/*"],
      "@school-mgmt/client/*": ["client/src/*"],
      "@school-mgmt/server/*": ["server/src/*"]
    }
  },
  "references": [
    { "path": "./shared" },
    { "path": "./client" },
    { "path": "./server" }
  ],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create pnpm-workspace.yaml**

```yaml
packages:
  - "client"
  - "server"
  - "shared"
```

- [ ] **Step 4: Create .env.example with all required variables**

```bash
# Supabase
SUPABASE_URL=https://hmcjowhubdruxjfisabt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:password@db.hmcjowhubdruxjfisabt.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:password@db.hmcjowhubdruxjfisabt.supabase.co:5432/postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Redis (for BullMQ, caching, sessions)
REDIS_URL=redis://localhost:6379

# Email (configure for production)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass
EMAIL_FROM=noreply@school.example.com

# M-Pesa Daraja (Kenya payments)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=your-shortcode
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-domain.com/api/v1/payments/mpesa/callback

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Kenya Locale
DEFAULT_CURRENCY=KES
DEFAULT_TIMEZONE=Africa/Nairobi
DEFAULT_DATE_FORMAT=DD/MM/YYYY
DEFAULT_LOCALE=en-KE
```

- [ ] **Step 5: Create .env from user-provided Supabase credentials**

- [ ] **Step 6: Create .gitignore**

```gitignore
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
coverage/
*.tsbuildinfo
.pnp
.pnp.js
```

- [ ] **Step 7: Create initial README.md and PROJECT_PROGRESS.md**

- [ ] **Step 8: Run `pnpm install` to verify workspace setup**

Run: `pnpm install`
Expected: All workspaces installed successfully

- [ ] **Step 9: Commit initial structure**

```bash
git init && git add . && git commit -m "chore: initialize monorepo structure with workspaces"
```

---

### Task 2: Create Shared Package with Types, Utilities, and Constants

**Files:**
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`
- Create: `shared/src/index.ts`
- Create: `shared/src/types/index.ts`
- Create: `shared/src/types/user.ts`
- Create: `shared/src/types/school.ts`
- Create: `shared/src/types/academic.ts`
- Create: `shared/src/types/finance.ts`
- Create: `shared/src/types/attendance.ts`
- Create: `shared/src/types/examination.ts`
- Create: `shared/src/constants/roles.ts`
- Create: `shared/src/constants/permissions.ts`
- Create: `shared/src/constants/grading.ts`
- Create: `shared/src/constants/academic.ts`
- Create: `shared/src/utils/validation.ts`
- Create: `shared/src/utils/date.ts`
- Create: `shared/src/utils/currency.ts`
- Create: `shared/src/utils/helpers.ts`
- Create: `shared/src/zod/index.ts`
- Create: `shared/vitest.config.ts`

**Interfaces:**
- Consumes: Root workspace config
- Produces: Shared types, constants, utilities, Zod schemas for client and server

- [ ] **Step 1: Create shared/package.json**

```json
{
  "name": "@school-mgmt/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./types": "./dist/types/index.js",
    "./constants": "./dist/constants/index.js",
    "./utils": "./dist/utils/index.js",
    "./zod": "./dist/zod/index.js"
  },
  "scripts": {
    "build": "tsc -b",
    "dev": "tsc -b --watch",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.4",
    "date-fns": "^3.3.1",
    "date-fns-tz": "^2.0.0",
    "decimal.js": "^10.4.3"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.3.0",
    "@types/node": "^20.11.0"
  }
}
```

- [ ] **Step 2: Create shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {}
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

- [ ] **Step 3: Create core type definitions (user.ts, school.ts, academic.ts, finance.ts, attendance.ts, examination.ts)**

- [ ] **Step 4: Create role and permission constants with full RBAC matrix**

- [ ] **Step 5: Create grading system constants (configurable, Kenya CBC + traditional)**

- [ ] **Step 6: Create academic constants (academic structures, Kenya term dates)**

- [ ] **Step 7: Create validation utilities with Zod schemas for all entities**

- [ ] **Step 8: Create date, currency, and helper utilities**

- [ ] **Step 9: Build and test shared package**

Run: `pnpm --filter shared build && pnpm --filter shared test`
Expected: Build succeeds, tests pass

- [ ] **Step 10: Commit shared package**

---

### Task 3: Initialize Server Package with Express, Prisma, and Supabase

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/index.ts`
- Create: `server/src/config/index.ts`
- Create: `server/src/config/supabase.ts`
- Create: `server/src/config/prisma.ts`
- Create: `server/src/config/redis.ts`
- Create: `server/src/middleware/auth.ts`
- Create: `server/src/middleware/authorization.ts`
- Create: `server/src/middleware/validation.ts`
- Create: `server/src/middleware/errorHandler.ts`
- Create: `server/src/middleware/rateLimiter.ts`
- Create: `server/src/middleware/tenant.ts`
- Create: `server/src/utils/apiResponse.ts`
- Create: `server/src/utils/prismaExtensions.ts`
- Create: `server/src/utils/supabaseAdmin.ts`
- Create: `server/src/routes/health.ts`
- Create: `server/prisma/schema.prisma`
- Create: `server/vitest.config.ts`
- Create: `server/.env` (symlink to root .env)

**Interfaces:**
- Consumes: @school-mgmt/shared types, constants, zod schemas
- Produces: Express app, Prisma client, Supabase clients, middleware, health endpoint

- [ ] **Step 1: Create server/package.json with all dependencies**

```json
{
  "name": "@school-mgmt/server",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -b",
    "start": "node dist/index.js",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:pull": "prisma db pull"
  },
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "@supabase/supabase-js": "^2.39.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "zod": "^3.22.4",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "ioredis": "^5.3.2",
    "bullmq": "^5.1.0",
    "socket.io": "^4.7.4",
    "date-fns": "^3.3.1",
    "date-fns-tz": "^2.0.0",
    "decimal.js": "^10.4.3",
    "winston": "^3.11.0",
    "@school-mgmt/shared": "*"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.7",
    "@types/node": "^20.11.0",
    "@types/compression": "^1.7.5",
    "prisma": "^5.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0",
    "vitest": "^1.3.0",
    "supertest": "^6.3.4",
    "@vitest/coverage-v8": "^1.3.0"
  }
}
```

- [ ] **Step 2: Create server/tsconfig.json with project references**

- [ ] **Step 3: Create comprehensive Prisma schema (schema.prisma) with all 50+ tables**

Key models: School, Campus, User, Role, Permission, UserRole, RolePermission, Student, Guardian, StudentGuardian, Teacher, Staff, Department, AcademicYear, Term, Class, Stream, Subject, LearningArea, Competency, StudentEnrollment, TeacherAssignment, Attendance, StaffAttendance, Examination, ExaminationSubject, Marks, GradingSystem, GradingScale, ReportCard, FeeCategory, FeeStructure, StudentInvoice, InvoiceItem, Payment, PaymentTransaction, Discount, Scholarship, Expense, Timetable, TimetableEntry, Assignment, AssignmentSubmission, Announcement, Notification, Book, BookCopy, LibraryTransaction, Vehicle, Driver, TransportRoute, TransportStop, StudentTransport, MedicalRecord, DisciplineRecord, Asset, InventoryItem, Supplier, AuditLog, SchoolSettings

- [ ] **Step 4: Create Supabase client configuration (anon and service role)**

- [ ] **Step 5: Create Prisma client with extensions for soft deletes, multi-tenant filtering**

- [ ] **Step 6: Create Redis client and BullMQ queue configuration**

- [ ] **Step 7: Create authentication middleware (JWT verification with Supabase)**

- [ ] **Step 8: Create authorization middleware (role/permission checks)**

- [ ] **Step 9: Create tenant middleware (school_id injection and validation)**

- [ ] **Step 10: Create error handler, rate limiter, validation middleware**

- [ ] **Step 11: Create API response utilities and health check route**

- [ ] **Step 12: Create main Express app entry point (index.ts)**

- [ ] **Step 13: Run prisma generate and verify schema compiles**

Run: `pnpm --filter server db:generate`
Expected: Prisma client generated successfully

- [ ] **Step 14: Build and test server package**

Run: `pnpm --filter server build && pnpm --filter server test`
Expected: Build succeeds, tests pass

- [ ] **Step 15: Commit server package**

---

### Task 4: Push Database Schema to Supabase and Create Migrations

**Files:**
- Modify: `server/prisma/schema.prisma` (if adjustments needed)
- Create: `server/prisma/migrations/` (generated)

**Interfaces:**
- Consumes: Prisma schema from Task 3
- Produces: Database tables in Supabase, migration history

- [ ] **Step 1: Verify Supabase connection with Prisma**

Run: `pnpm --filter server db:push --accept-data-loss`
Expected: Schema pushed to Supabase successfully

- [ ] **Step 2: Create initial migration**

Run: `pnpm --filter server db:migrate --name init_schema`
Expected: Migration created and applied

- [ ] **Step 3: Verify tables created in Supabase dashboard**

- [ ] **Step 4: Run Supabase advisors for security/performance checks**

Run: `supabase db advisors --project-ref hmcjowhubdruxjfisabt`
Expected: No critical issues

- [ ] **Step 5: Enable RLS on all tables and create policies**

```sql
-- Run via Supabase SQL editor or MCP execute_sql
-- Enable RLS on all public tables
-- Create policies for multi-tenant isolation
```

- [ ] **Step 6: Create database indexes for performance**

- [ ] **Step 7: Commit migration files**

---

### Task 5: Implement Authentication System (Supabase Auth + JWT)

**Files:**
- Create: `server/src/modules/auth/auth.controller.ts`
- Create: `server/src/modules/auth/auth.service.ts`
- Create: `server/src/modules/auth/auth.routes.ts`
- Create: `server/src/modules/auth/dto/login.dto.ts`
- Create: `server/src/modules/auth/dto/register.dto.ts`
- Create: `server/src/modules/auth/dto/refresh.dto.ts`
- Create: `server/src/modules/auth/dto/forgot-password.dto.ts`
- Create: `server/src/modules/auth/dto/reset-password.dto.ts`
- Create: `server/src/modules/auth/strategies/jwt.strategy.ts`
- Create: `server/src/modules/auth/guards/roles.guard.ts`
- Create: `server/src/modules/auth/guards/permissions.guard.ts`
- Create: `server/tests/auth.test.ts`

**Interfaces:**
- Consumes: Supabase Auth, Prisma User/Role/Permission models, shared types
- Produces: Login, logout, register, refresh, forgot/reset password endpoints

- [ ] **Step 1: Create auth DTOs with Zod validation schemas**

- [ ] **Step 2: Create auth service with Supabase integration**

```typescript
// Key methods:
// - login(email, password) -> { user, accessToken, refreshToken }
// - register(data) -> { user, accessToken, refreshToken }
// - refreshToken(refreshToken) -> { accessToken, refreshToken }
// - logout(userId) -> void
// - forgotPassword(email) -> void
// - resetPassword(token, password) -> void
// - verifyEmail(token) -> void
// - getProfile(userId) -> UserProfile
// - updateProfile(userId, data) -> UserProfile
// - changePassword(userId, oldPass, newPass) -> void
```

- [ ] **Step 3: Create JWT strategy for access/refresh tokens**

- [ ] **Step 4: Create roles and permissions guards**

- [ ] **Step 5: Create auth controller with all endpoints**

- [ ] **Step 6: Create auth routes with rate limiting**

- [ ] **Step 7: Write comprehensive auth tests**

```typescript
// Tests for:
// - Successful login with valid credentials
// - Failed login with invalid credentials
// - Login with inactive user
// - Token refresh flow
// - Password reset flow
// - Role-based access control
// - Permission-based access control
// - Multi-tenant isolation (school_id)
```

- [ ] **Step 8: Run auth tests**

Run: `pnpm --filter server test -- auth.test.ts`
Expected: All tests pass

- [ ] **Step 9: Commit auth module**

---

### Task 6: Create Seed Data for Development

**Files:**
- Create: `server/prisma/seed.ts`
- Create: `server/prisma/seeds/roles.ts`
- Create: `server/prisma/seeds/permissions.ts`
- Create: `server/prisma/seeds/grading.ts`
- Create: `server/prisma/seeds/school.ts`
- Create: `server/prisma/seeds/users.ts`
- Create: `server/prisma/seeds/academic.ts`

**Interfaces:**
- Consumes: Prisma client, shared constants
- Produces: Demo school, admin user, roles, permissions, grading systems, academic structure

- [ ] **Step 1: Create role and permission seeds (14 roles, 50+ permissions)**

- [ ] **Step 2: Create grading system seeds (Kenya CBC + traditional)**

- [ ] **Step 3: Create demo school with Kenya locale settings**

- [ ] **Step 4: Create super admin user and demo users for each role**

- [ ] **Step 5: Create academic years, terms, classes, streams, subjects**

- [ ] **Step 6: Run seed script**

Run: `pnpm --filter server db:seed`
Expected: Seed data created successfully

- [ ] **Step 7: Verify seeded data in Supabase dashboard**

- [ ] **Step 8: Commit seed files**

---

### Task 7: Initialize Client Package with Vite, React, Tailwind, shadcn/ui

**Files:**
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/tsconfig.node.json`
- Create: `client/vite.config.ts`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/index.html`
- Create: `client/src/main.tsx`
- Create: `client/src/App.tsx`
- Create: `client/src/index.css`
- Create: `client/src/vite-env.d.ts`
- Create: `client/src/lib/utils.ts`
- Create: `client/src/lib/supabase.ts`
- Create: `client/src/lib/queryClient.ts`
- Create: `client/src/lib/axios.ts`
- Create: `client/src/providers/AuthProvider.tsx`
- Create: `client/src/providers/QueryProvider.tsx`
- Create: `client/src/providers/SocketProvider.tsx`
- Create: `client/src/hooks/useAuth.ts`
- Create: `client/src/hooks/usePermissions.ts`
- Create: `client/src/hooks/useSchool.ts`
- Create: `client/src/components/ui/` (shadcn/ui components)
- Create: `client/vitest.config.ts`
- Create: `client/playwright.config.ts`

**Interfaces:**
- Consumes: @school-mgmt/shared, server API endpoints
- Produces: React app with providers, routing, UI components, auth hooks

- [ ] **Step 1: Create client/package.json with all dependencies**

```json
{
  "name": "@school-mgmt/client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:ui": "vitest --ui",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx",
    "e2e": "playwright test"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "@tanstack/react-query": "^5.20.0",
    "axios": "^1.6.7",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "@supabase/supabase-js": "^2.39.0",
    "socket.io-client": "^4.7.4",
    "date-fns": "^3.3.1",
    "date-fns-tz": "^2.0.0",
    "decimal.js": "^10.4.3",
    "recharts": "^2.12.0",
    "lucide-react": "^0.330.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "class-variance-authority": "^0.7.0",
    "sonner": "^1.4.0",
    "react-hot-toast": "^2.4.1",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-pagination": "^1.0.5",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@school-mgmt/shared": "*"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.4.0",
    "vite": "^5.1.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17",
    "vitest": "^1.3.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/jest-dom": "^6.4.0",
    "jsdom": "^24.0.0",
    "playwright": "^1.42.0",
    "@playwright/test": "^1.42.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

- [ ] **Step 2: Create Vite config with path aliases and proxy**

- [ ] **Step 3: Create Tailwind config with design system (navy, royal blue, teal palette)**

- [ ] **Step 4: Create shadcn/ui components (Button, Input, Table, Card, Badge, Dialog, Form, etc.)**

- [ ] **Step 5: Create Supabase client, Axios instance, TanStack Query client**

- [ ] **Step 6: Create AuthProvider, QueryProvider, SocketProvider**

- [ ] **Step 7: Create useAuth, usePermissions, useSchool hooks**

- [ ] **Step 8: Create main App.tsx with routing structure**

- [ ] **Step 9: Build and test client package**

Run: `pnpm --filter client build && pnpm --filter client test`
Expected: Build succeeds, tests pass

- [ ] **Step 10: Commit client package**

---

### Task 8: Implement Main Layout, Sidebar Navigation, and Dashboard

**Files:**
- Create: `client/src/layouts/MainLayout.tsx`
- Create: `client/src/layouts/Sidebar.tsx`
- Create: `client/src/layouts/Header.tsx`
- Create: `client/src/layouts/Breadcrumb.tsx`
- Create: `client/src/pages/Dashboard.tsx`
- Create: `client/src/pages/Login.tsx`
- Create: `client/src/pages/Register.tsx`
- Create: `client/src/pages/ForgotPassword.tsx`
- Create: `client/src/pages/ResetPassword.tsx`
- Create: `client/src/components/dashboard/StatCard.tsx`
- Create: `client/src/components/dashboard/Charts.tsx`
- Create: `client/src/components/dashboard/RecentActivity.tsx`
- Create: `client/src/components/dashboard/QuickActions.tsx`
- Create: `client/src/hooks/useDashboardStats.ts`
- Create: `client/src/api/dashboard.ts`
- Create: `client/src/routes/privateRoutes.tsx`
- Create: `client/src/routes/publicRoutes.tsx`

**Interfaces:**
- Consumes: Auth context, API endpoints, shared types
- Produces: Complete application layout with responsive sidebar, header, dashboard

- [ ] **Step 1: Create MainLayout with sidebar, header, outlet**

- [ ] **Step 2: Create responsive Sidebar with role-based navigation items**

- [ ] **Step 3: Create Header with user menu, notifications, school switcher**

- [ ] **Step 4: Create Login/Register/ForgotPassword/ResetPassword pages**

- [ ] **Step 5: Create Dashboard page with stat cards, charts, recent activity**

- [ ] **Step 6: Create dashboard API endpoints on server**

- [ ] **Step 7: Create dashboard hooks and API client**

- [ ] **Step 8: Implement role-based route protection**

- [ ] **Step 9: Test dashboard with different user roles**

- [ ] **Step 10: Commit layout and dashboard**

---

### Task 9: Implement Comprehensive Test Suite and CI Configuration

**Files:**
- Create: `server/tests/setup.ts`
- Create: `server/tests/auth.test.ts`
- Create: `server/tests/tenant.test.ts`
- Create: `client/tests/setup.ts`
- Create: `client/tests/components/`
- Create: `client/tests/hooks/`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/cd.yml`

**Interfaces:**
- Consumes: All previous tasks
- Produces: Automated testing pipeline, coverage reports

- [ ] **Step 1: Create Vitest setup files for server and client**

- [ ] **Step 2: Write unit tests for auth, tenant, validation middleware**

- [ ] **Step 3: Write component tests for UI components**

- [ ] **Step 4: Write hook tests for custom hooks**

- [ ] **Step 5: Create GitHub Actions CI workflow**

- [ ] **Step 6: Run full test suite**

Run: `pnpm test`
Expected: All tests pass with >80% coverage

- [ ] **Step 7: Commit test suite and CI config**

---

### Task 10: Create Documentation Files

**Files:**
- Create: `DATABASE_SCHEMA.md`
- Create: `API_DOCUMENTATION.md`
- Create: `ENVIRONMENT_SETUP.md`
- Create: `DEPLOYMENT_GUIDE.md`
- Create: `SECURITY_CHECKLIST.md`
- Update: `README.md`
- Update: `PROJECT_PROGRESS.md`

**Interfaces:**
- Consumes: All implementation details
- Produces: Complete project documentation

- [ ] **Step 1: Document database schema with ER diagram description**

- [ ] **Step 2: Document API endpoints with examples**

- [ ] **Step 3: Document environment setup and configuration**

- [ ] **Step 4: Document deployment steps for production**

- [ ] **Step 5: Document security checklist and best practices**

- [ ] **Step 6: Update README with project overview and quick start**

- [ ] **Step 7: Update PROJECT_PROGRESS.md with Phase 1 completion**

- [ ] **Step 8: Commit documentation**

---

## Phase 1 Completion Criteria

- [ ] Monorepo structure with client, server, shared packages working
- [ ] Supabase connected and database schema deployed with RLS
- [ ] Prisma ORM configured with all models
- [ ] Authentication system working (login, register, JWT, refresh, password reset)
- [ ] Role-based access control with 14 roles and 50+ permissions
- [ ] Multi-tenant isolation enforced at middleware and database level
- [ ] Main application layout with responsive sidebar and header
- [ ] Dashboard with real-time stats, charts, and recent activity
- [ ] Seed data for development with demo users for all roles
- [ ] Test suite with >80% coverage
- [ ] CI/CD pipeline configured
- [ ] All documentation files created
- [ ] PROJECT_PROGRESS.md updated

---

**Next Phase:** Phase 2 - Student Management Module (registration, profiles, enrollment, promotion, transfer, ID cards)
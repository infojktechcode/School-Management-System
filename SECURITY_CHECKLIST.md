# Security Checklist

Use this list before every production release and when reviewing a pull request that touches authentication, tenancy, finance or data access.

## Secrets and configuration

- [ ] `SUPABASE_SERVICE_ROLE_KEY` exists only in server-side environment variables; no `VITE_*` variable contains it.
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are at least 32 random characters and differ from each other.
- [ ] `.env` is git-ignored; `.env.example` contains placeholders, not live credentials.
- [ ] Production secrets are stored in the platform secret manager, not in the repository or build logs.
- [ ] The seed default password is changed or the seeded accounts are removed in production.
- [ ] `NODE_ENV=production` disables verbose errors and stack traces in API responses.

## Authentication

- [ ] Every non-public route has `authenticate` before its handler.
- [ ] Tokens are verified with Supabase; local JWT helpers are used only for explicitly local flows.
- [ ] Expired, malformed and wrong-audience tokens return `401` without leaking details.
- [ ] Refresh tokens are rotated and revoked on logout.
- [ ] Password reset responses do not reveal whether an email exists.
- [ ] Auth endpoints are rate limited (`authLimiter`).
- [ ] Account status (`isActive`) is checked on every login and privileged request.
- [ ] Supabase email confirmation is enabled for public sign-ups.

## Authorization and tenancy

- [ ] Each protected route declares `requirePermissions` or `requireRoles` (or documents why it is open to any authenticated user).
- [ ] Every Prisma query for school-owned data filters by `schoolId` from `req.schoolId`, never from the request body.
- [ ] `tenant` middleware rejects a mismatched `x-school-id` and route `schoolId` for regular users.
- [ ] `SUPER_ADMIN` requests must name a school; there is no implicit cross-school read.
- [ ] Parent and student endpoints resolve the linked student/guardian and scope to it; they never accept an arbitrary student id.
- [ ] Teacher endpoints verify the teacher is assigned to the class/subject before reading or writing marks.
- [ ] Role and permission changes are restricted to school administrators and audited.
- [ ] Public registration cannot self-assign a staff role.

## Database and RLS

- [ ] RLS is enabled on every table in the `public` schema.
- [ ] Every table with `school_id` has a tenant policy for `authenticated`.
- [ ] Child tables without `school_id` inherit tenancy through a parent `exists` check.
- [ ] `audit_logs` is not writable or readable through the Data API.
- [ ] Unique indexes prevent duplicate admissions, invoices, payments and enrollments.
- [ ] Soft deletes are used for academic and financial records; no `DELETE` cascades erase history.
- [ ] The API uses the service role; direct anon-key access is limited to what RLS allows.
- [ ] A staging copy is used to test migrations before production.

## Financial integrity

- [ ] Money is stored as `decimal(12,2)` and handled with `decimal.js`, never floating-point arithmetic.
- [ ] Payment amounts are validated server-side against the invoice balance.
- [ ] M-Pesa callbacks are authenticated (signature/allow-list) and idempotent by receipt number.
- [ ] Duplicate payment references are rejected by a unique constraint, not only by application logic.
- [ ] Invoice totals, paid amounts and balances are recomputed inside a transaction.
- [ ] Refunds, waivers and discounts require an authorised role and leave an audit trail.
- [ ] Financial records are never hard-deleted.

## Input, output and transport

- [ ] Every request body and query is validated with Zod before use.
- [ ] Prisma parameterises queries; raw SQL uses tagged templates with parameters.
- [ ] HTML output is escaped by React; any rich text is sanitised server-side.
- [ ] Uploads enforce MIME type and size limits and are stored outside the web root (Supabase Storage).
- [ ] CORS allows only the configured frontend origin with credentials as needed.
- [ ] Helmet sets security headers; HTTPS is enforced in production.
- [ ] Rate limits cover auth, uploads, search and payment endpoints.
- [ ] Error responses do not include SQL, stack traces or internal identifiers.

## Auditing and monitoring

- [ ] Login, logout, role changes, fee changes and deletions write an `AuditLog` row.
- [ ] Audit entries include actor, school, action, entity, IP and timestamp.
- [ ] Logs redact passwords, tokens, full phone numbers and M-Pesa secrets.
- [ ] Alerts exist for repeated 401/403 spikes, failed payments and unusual export volume.
- [ ] Access to production data is limited to named administrators with MFA.

## Kenya data protection

- [ ] The school has a lawful basis for processing learner and guardian data under the Data Protection Act, 2019.
- [ ] Privacy notices explain what is collected, why, and for how long.
- [ ] Guardians can request access or correction of their learner's records.
- [ ] Data is retained only as long as academic and financial obligations require.
- [ ] Cross-border processing (Vercel, Supabase, email/SMS providers) is documented in the privacy notice.
- [ ] Breach response contacts and timelines are documented.

## Release gate

- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes with no skipped security tests.
- [ ] `pnpm build` succeeds for shared, server and client.
- [ ] CI is green and the release has been reviewed by a second person.
- [ ] Rollback steps in `DEPLOYMENT_GUIDE.md` are understood by the on-call engineer.

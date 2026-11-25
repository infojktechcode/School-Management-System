# Database Schema

The Prisma schema lives in [`server/prisma/schema.prisma`](server/prisma/schema.prisma) and targets PostgreSQL 15 on Supabase. It contains 61 models and 24 enums covering school administration from admissions through finance, library and transport.

## Conventions

| Rule | Implementation |
| --- | --- |
| Primary keys | `String @id @default(uuid()) @db.Uuid` on every model |
| Money | `Decimal @db.Decimal(12, 2)` — never `Float` |
| Tenant key | `schoolId` on every school-owned record, indexed with the query columns |
| Historical records | `deletedAt DateTime?` soft deletes; hard deletes are not used for academic or financial data |
| Duplicate prevention | Composite unique indexes such as `@@unique([schoolId, admissionNumber])` |
| Timestamps | `createdAt` / `updatedAt` on mutable records |
| Locale defaults | `currency = KES`, `timezone = Africa/Nairobi`, `dateFormat = DD/MM/YYYY`, `locale = en-KE` |

## Entity groups

### Tenancy and identity

```
School 1─* Campus
School 1─1 SchoolSettings
School 1─* User *─* Role *─* Permission
User 1─* UserRole
Role 1─* RolePermission
```

`School` is the tenant root. `User` carries `schoolId` (nullable only for `SUPER_ADMIN`), an optional `supabaseUserId` linking to Supabase Auth, and soft-delete state. `Role` and `Permission` are global catalogues; `UserRole` and `RolePermission` are the join tables that back the RBAC matrix in `shared/src/constants`.

### Students and guardians

```
Student *─1 School
Student *─1 ClassLevel
Student *─1 Stream
Student *─* Guardian (StudentGuardian)
Student 1─* StudentEnrollment
Student 1─* Attendance
Student 1─* MedicalRecord
Student 1─* DisciplineRecord
```

`StudentEnrollment` records the class, stream, academic year and term for each year, preserving promotion history. `StudentGuardian` carries `isPrimary` and relationship metadata. Students optionally link to a portal `User`.

### Staff and academics

```
Staff 1─1 User
Teacher 1─1 Staff
Department 1─* Staff
AcademicYear 1─* Term
ClassLevel 1─* Stream
ClassLevel 1─* LearningArea
LearningArea 1─* Subject
Subject 1─* Competency
Teacher 1─* TeacherAssignment
```

`TeacherAssignment` joins a teacher to a subject, class, stream, term and academic year. CBC learning areas and competencies sit alongside traditional subjects so both curricula can be graded.

### Assessment and grading

```
Examination 1─* ExaminationSubject 1─* Mark
GradingSystem 1─* GradingScale
Student 1─* ReportCard
```

Grading systems are per-school rows, not code constants: a school can hold the 8-4-4 KCSE scale and the CBC performance-level scale at the same time and mark one as default. `Mark` stores raw and moderated scores with a unique `(examinationSubjectId, studentId)` constraint.

### Finance

```
FeeCategory 1─* FeeStructure
Student 1─* StudentInvoice 1─* InvoiceItem
StudentInvoice 1─* Payment 1─* PaymentTransaction
Discount / Scholarship *─* Student (StudentScholarship)
Expense *─1 School
```

Invoices store `totalAmount`, `paidAmount` and `balance` as decimals; `Payment` is the source of truth and `PaymentTransaction` records M-Pesa request/callback states. A unique `(schoolId, referenceNumber)` index prevents duplicate payment capture.

### Operations

| Area | Models |
| --- | --- |
| Timetable | `Timetable`, `TimetableEntry` |
| Homework | `Assignment`, `AssignmentSubmission` |
| Communication | `Announcement`, `Notification` |
| Library | `Book`, `BookCopy`, `LibraryTransaction` |
| Transport | `Driver`, `Vehicle`, `TransportRoute`, `TransportStop`, `StudentTransport` |
| Inventory | `Asset`, `Supplier`, `InventoryItem` |
| Audit | `AuditLog` |

## Row Level Security

RLS is enabled by [`server/prisma/rls.sql`](server/prisma/rls.sql) after `prisma db push` or `prisma migrate deploy`:

- `public.current_school_id()` reads the `school_id` claim from the Supabase JWT.
- Every table with a `school_id` column gets a `tenant_isolation` policy for `authenticated`.
- Child tables without `school_id` (`terms`, `streams`) inherit tenancy through an `exists` check against their parent.
- `users` allows self-read plus same-school reads; updates are limited to the owner.
- `roles`, `permissions` and `role_permissions` are read-only catalogues.
- `audit_logs` is denied to the Data API; only the service role (the Express server) writes it.

The Express API connects through Prisma with the service role, which bypasses RLS. Tenant isolation for API traffic is enforced in `tenant` middleware and in every query's `where` clause; RLS is the second line of defence for direct Supabase Data API access.

## Indexes

Frequently used paths are indexed in `rls.sql` in addition to Prisma's unique constraints:

- `students (school_id, status)`
- `attendances (school_id, date)`
- `student_invoices (student_id, status)`
- `payments (school_id, paid_at)`
- `marks (student_id)`
- `notifications (user_id, status)`
- `audit_logs (school_id, created_at)`

## Working with the schema

```bash
pnpm --filter server db:generate   # regenerate the Prisma client
pnpm --filter server db:push       # sync a development database
pnpm --filter server db:migrate    # create a migration
pnpm --filter server db:studio     # browse data
pnpm --filter server db:seed       # load demo data
```

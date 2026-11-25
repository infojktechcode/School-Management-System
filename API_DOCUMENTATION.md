# API Documentation

Base URL: `http://localhost:4000/api/v1` in development. All responses are JSON.

## Response envelope

Success:

```json
{
  "success": true,
  "message": "Students fetched",
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Validation failed",
  "errors": { "email": ["Enter a valid email address"] }
}
```

| Status | Meaning |
| --- | --- |
| 400 | Validation or malformed request |
| 401 | Missing, invalid or expired token |
| 403 | Authenticated but not permitted, or wrong school |
| 404 | Resource not found |
| 409 | Duplicate or conflicting record |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

## Authentication

Send the Supabase access token on every protected request:

```
Authorization: Bearer <access_token>
```

School-scoped requests also send the active school. Regular users are pinned to their own school; a `SUPER_ADMIN` must supply one.

```
x-school-id: 8f1c2a3e-4b5d-4e6f-8a9b-0c1d2e3f4a5b
```

### `POST /auth/register`

Public registration is limited to `PARENT` and `STUDENT`; staff accounts are provisioned by an administrator.

```json
{
  "firstName": "Jane",
  "lastName": "Wanjiku",
  "email": "jane@example.com",
  "password": "Str0ng!pass",
  "role": "PARENT",
  "schoolId": "8f1c2a3e-4b5d-4e6f-8a9b-0c1d2e3f4a5b",
  "phone": "+254712345678"
}
```

`201 Created` returns `{ user, tokens: { accessToken, refreshToken, expiresAt, tokenType } }`.

### `POST /auth/login`

```json
{ "email": "admin@demo.school.ac.ke", "password": "Demo@Passw0rd!" }
```

`200 OK` returns the profile and Supabase session tokens. Disabled or unprovisioned accounts return `403`.

### `POST /auth/refresh`

```json
{ "refreshToken": "<refresh_token>" }
```

Returns a fresh token pair. Expired or revoked refresh tokens return `401`.

### `POST /auth/logout`

Requires `Authorization`. Revokes the Supabase session; the client clears local tokens regardless.

### `POST /auth/forgot-password`

```json
{ "email": "jane@example.com" }
```

Always returns `200` to prevent account enumeration. Supabase emails a link to
`${FRONTEND_URL}/reset-password`.

### `POST /auth/reset-password`

```json
{ "token": "<supabase_access_token>", "password": "N3w!password" }
```

### `GET /auth/me`

Returns the authenticated `UserProfile` including roles and the flattened permission list.

### `PATCH /auth/me`

```json
{ "firstName": "Jane", "lastName": "Wanjiku", "phone": "+254712345678" }
```

### `POST /auth/change-password`

```json
{
  "currentPassword": "Str0ng!pass",
  "newPassword": "N3w!password",
  "confirmPassword": "N3w!password"
}
```

The current password is verified with Supabase before the new one is set.

## Schools

### `GET /schools/public`

Unauthenticated list used by registration and the super-admin switcher.

```json
{ "success": true, "data": [{ "id": "…", "name": "Moi Avenue Demo School", "code": "DEMO001" }] }
```

### `GET /schools/current`

Requires authentication and a resolved tenant. Returns the active school.

## Dashboard

### `GET /dashboard`

Requires `student:read` and a tenant context. Returns aggregated statistics for the active school:

```json
{
  "stats": {
    "totalStudents": 12,
    "totalStaff": 12,
    "totalTeachers": 2,
    "feeCollection": { "invoiced": 402000, "collected": 160000, "outstanding": 242000, "collectionRate": 39.8 },
    "attendance": { "present": 54, "absent": 6, "total": 60, "rate": 90 },
    "pendingInvoices": 9
  },
  "enrollmentByClass": [{ "classLevel": "Grade 7", "students": 4 }],
  "feeTrend": [{ "month": "Sep", "invoiced": 0, "collected": 20000 }],
  "recentActivity": [
    {
      "id": "payment-…",
      "type": "payment",
      "title": "Fee payment received",
      "description": "Brian Otieno · MPESA",
      "at": "2026-01-20T09:30:00.000Z",
      "amount": 20000
    }
  ]
}
```

Queries are scoped by `schoolId` and run in parallel with `Promise.all`; decimals are converted with `toNumber()` at the boundary.

## Health

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Liveness plus database latency |
| `GET /api/v1/health` | Same handler under the versioned prefix |

## Rate limiting

`authLimiter` applies to register, login, refresh, forgot-password and reset-password. The default is 10 requests per 15 minutes per IP in production, relaxed in development and tests.

## Authorization model

| Layer | Responsibility |
| --- | --- |
| `authenticate` | Verifies the bearer token with Supabase, loads the local user and attaches `req.user` |
| `tenant` / `requireTenant` | Resolves and pins `req.schoolId`; rejects cross-school headers and route params |
| `requireRoles` | Allows only listed roles |
| `requirePermissions` | Requires every listed permission from the RBAC matrix |

Permissions are strings such as `student:read`, `student:create`, `finance:manage`, `marks:entry`. The authoritative matrix is `shared/src/constants/roles.ts` and is mirrored into the database by the seed.

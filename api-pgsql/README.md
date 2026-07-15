# Feature Flags API (PostgreSQL / TypeORM)

A PostgreSQL variant of the NestJS feature-flag API. It is functionally identical
to the MongoDB version in `../api` — same routes, roles, request/response shapes
and tenant-isolation rules — but the data layer uses TypeORM against PostgreSQL
instead of Mongoose against MongoDB. The Next.js frontend in `../web` works with
either; just point it at whichever API is running.

## Prerequisites

- Node.js v18+ (developed against v22). npm.
- A PostgreSQL database. Either a local server or a hosted one (Neon, Supabase,
  RDS, etc.). Set the connection string as `DATABASE_URL` in `.env`.

## How to run

```
cd api-pgsql
cp .env.example .env        # (Windows PowerShell) copy .env.example .env
# then edit .env: set DATABASE_URL, and DATABASE_SSL=true for hosted providers
npm install
npm run build
npm run start:prod          # or: npm run start:dev for watch mode
```

Tables (`organizations`, `users`, `feature_flags`) are created on first run by
TypeORM's `synchronize`. To use it with the frontend, run this on port 4000 (the
default) or set `NEXT_PUBLIC_API_URL` in `../web/.env.local` to match.

### Super-admin credentials

Set in `.env` (`SUPER_ADMIN_USERNAME` / `SUPER_ADMIN_PASSWORD`). The super admin
is config-based, not a database row.

## How it differs from the MongoDB version

- **TypeORM + `pg`** instead of Mongoose. Entities live in `*.entity.ts`.
- **UUID primary keys** are generated in the application (a `@BeforeInsert` hook
  using `crypto.randomUUID()`), so no Postgres uuid extension needs to be
  installed or enabled on the database.
- **Cascade delete is enforced by the database.** The `users` and `feature_flags`
  foreign keys are declared `ON DELETE CASCADE`, so deleting an organization row
  automatically removes its admins, end users and flags (after which those
  accounts can no longer log in). The MongoDB version does the equivalent
  cascade explicitly in application code, since MongoDB has no foreign keys.
- **`DATABASE_SSL`** toggles TLS for hosted providers that require it.

## API reference

Identical to `../api`. See that project's `../README.md` and the Postman
collection at `../feature-flags.postman_collection.json` (point `baseUrl` at this
server). In short:

| Method & Path | Role |
| --- | --- |
| POST `/api/auth/super-admin/login` | public |
| POST `/api/auth/signup` | public |
| POST `/api/auth/login` | public |
| GET `/api/public/organizations` | public |
| POST `/api/organizations` | super_admin |
| GET `/api/organizations` | super_admin |
| DELETE `/api/organizations/:id` | super_admin (cascade) |
| POST `/api/feature-flags` | org_admin |
| GET `/api/feature-flags` | org_admin |
| PATCH `/api/feature-flags/:id` | org_admin |
| DELETE `/api/feature-flags/:id` | org_admin |
| POST `/api/features/check` | end_user |

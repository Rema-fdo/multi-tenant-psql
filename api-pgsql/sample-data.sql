-- Feature Flags (api-pgsql) — schema reference + sample data
-- Column names are quoted camelCase to match what TypeORM creates.
--
-- If you have already started the API once, the three tables already exist
-- (TypeORM `synchronize` creates them), so you can skip the CREATE TABLE
-- section and just run the INSERTs.
--
-- All sample users have the password: password123

-- ============================================================
-- Schema (matches the TypeORM entities)
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  "id"        uuid PRIMARY KEY,
  "name"      character varying NOT NULL,
  "slug"      character varying NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_organizations_slug" UNIQUE ("slug")
);

CREATE TABLE IF NOT EXISTS users (
  "id"             uuid PRIMARY KEY,
  "email"          character varying NOT NULL,
  "passwordHash"   character varying NOT NULL,
  "role"           character varying NOT NULL,   -- 'org_admin' | 'end_user'
  "organizationId" uuid NOT NULL,
  "createdAt"      TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_users_email" UNIQUE ("email"),
  CONSTRAINT "FK_users_org" FOREIGN KEY ("organizationId")
    REFERENCES organizations ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feature_flags (
  "id"             uuid PRIMARY KEY,
  "organizationId" uuid NOT NULL,
  "key"            character varying NOT NULL,
  "description"    character varying NOT NULL DEFAULT '',
  "enabled"        boolean NOT NULL DEFAULT false,
  "createdAt"      TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt"      TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_flag_org_key" UNIQUE ("organizationId", "key"),
  CONSTRAINT "FK_flags_org" FOREIGN KEY ("organizationId")
    REFERENCES organizations ("id") ON DELETE CASCADE
);

-- ============================================================
-- Sample data
-- ============================================================
-- Note: the super admin is NOT stored here — it is config-based
-- (SUPER_ADMIN_USERNAME / SUPER_ADMIN_PASSWORD in .env).

INSERT INTO organizations ("id", "name", "slug") VALUES
  ('11111111-1111-1111-1111-111111111111', 'Acme Corp', 'acme-corp'),
  ('22222222-2222-2222-2222-222222222222', 'Globex',    'globex');

-- Password for every user below is: password123
INSERT INTO users ("id", "email", "passwordHash", "role", "organizationId") VALUES
  ('a1111111-1111-1111-1111-111111111111', 'admin@acme.com',   '$2a$10$iqnhrKHMHzNDfofRDUCqj.y0KdQD17G2cAETmu4ahGxXqt4jFhLiG', 'org_admin', '11111111-1111-1111-1111-111111111111'),
  ('a2222222-2222-2222-2222-222222222222', 'user@acme.com',    '$2a$10$iqnhrKHMHzNDfofRDUCqj.y0KdQD17G2cAETmu4ahGxXqt4jFhLiG', 'end_user',  '11111111-1111-1111-1111-111111111111'),
  ('b1111111-1111-1111-1111-111111111111', 'admin@globex.com', '$2a$10$iqnhrKHMHzNDfofRDUCqj.y0KdQD17G2cAETmu4ahGxXqt4jFhLiG', 'org_admin', '22222222-2222-2222-2222-222222222222');

INSERT INTO feature_flags ("id", "organizationId", "key", "description", "enabled") VALUES
  ('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'new_dashboard', 'Beta dashboard', TRUE),
  ('f2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'beta_search',   'Experimental search', FALSE),
  ('f3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'dark_mode',     'Dark theme', TRUE);

-- ============================================================
-- Handy queries
-- ============================================================
-- All organizations
SELECT * FROM organizations ORDER BY "createdAt" DESC;

-- Users with their organization name
SELECT u."email", u."role", o."name" AS organization
FROM users u
JOIN organizations o ON o."id" = u."organizationId"
ORDER BY o."name", u."email";

-- Flags for one organization (by slug)
SELECT f."key", f."enabled", f."description"
FROM feature_flags f
JOIN organizations o ON o."id" = f."organizationId"
WHERE o."slug" = 'acme-corp'
ORDER BY f."key";

-- Is a specific feature enabled for an organization?
SELECT COALESCE(
  (SELECT f."enabled"
     FROM feature_flags f
     JOIN organizations o ON o."id" = f."organizationId"
    WHERE o."slug" = 'acme-corp' AND f."key" = 'new_dashboard'),
  FALSE) AS enabled;

-- Cascade demo: deleting an org removes its users and flags automatically
-- DELETE FROM organizations WHERE "slug" = 'globex';

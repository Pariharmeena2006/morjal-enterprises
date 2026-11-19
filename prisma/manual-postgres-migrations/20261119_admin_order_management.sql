-- MORJAL Enterprises additive PostgreSQL migration.
-- Review and back up the target database before applying. This does not drop,
-- rename, or rewrite existing tables or records. Do not run via the SQLite
-- migration history in prisma/migrations.

BEGIN;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Product_isPublished_featured_createdAt_idx"
  ON "Product" ("isPublished", "featured", "createdAt");

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "shiprocketOrderId" TEXT,
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT,
  ADD COLUMN IF NOT EXISTS "trackingTokenHash" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Order_idempotencyKey_key"
  ON "Order" ("idempotencyKey");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_trackingTokenHash_key"
  ON "Order" ("trackingTokenHash");
CREATE INDEX IF NOT EXISTS "Order_orderStatus_createdAt_idx"
  ON "Order" ("orderStatus", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_createdAt_idx"
  ON "Order" ("paymentStatus", "createdAt");

CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "note" TEXT,
  "changedByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderStatusHistory_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderStatusHistory_changedByAdminId_fkey"
    FOREIGN KEY ("changedByAdminId") REFERENCES "Admin" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "OrderStatusHistory_orderId_createdAt_idx"
  ON "OrderStatusHistory" ("orderId", "createdAt");

INSERT INTO "OrderStatusHistory" ("id", "orderId", "status", "note", "createdAt")
SELECT md5("Order"."id" || ':initial-status'), "Order"."id", "Order"."orderStatus",
       'Initial status captured during admin history setup.', "Order"."createdAt"
FROM "Order"
WHERE NOT EXISTS (
  SELECT 1 FROM "OrderStatusHistory" history WHERE history."orderId" = "Order"."id"
);

ALTER TABLE "WebsiteSettings"
  ADD COLUMN IF NOT EXISTS "homeHeroFirstLine" TEXT,
  ADD COLUMN IF NOT EXISTS "homeHeroSecondLine" TEXT,
  ADD COLUMN IF NOT EXISTS "homeHeroDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "homeFeaturedTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "homeFeaturedDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "homeFeaturedVisible" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "homeVideosVisible" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "emailVerifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_email_key" ON "Customer" ("email");
CREATE INDEX IF NOT EXISTS "Customer_phone_idx" ON "Customer" ("phone");

CREATE TABLE IF NOT EXISTS "CustomerAddress" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'Home',
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "pinCode" TEXT NOT NULL,
  "landmark" TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerAddress_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "CustomerAddress_customerId_isDefault_idx"
  ON "CustomerAddress" ("customerId", "isDefault");

CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailVerificationToken_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_tokenHash_key"
  ON "EmailVerificationToken" ("tokenHash");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_customerId_expiresAt_idx"
  ON "EmailVerificationToken" ("customerId", "expiresAt");

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key"
  ON "PasswordResetToken" ("tokenHash");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_customerId_expiresAt_idx"
  ON "PasswordResetToken" ("customerId", "expiresAt");

CREATE TABLE IF NOT EXISTS "AuthRateLimit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "keyHash" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "AuthRateLimit_keyHash_action_key"
  ON "AuthRateLimit" ("keyHash", "action");
CREATE INDEX IF NOT EXISTS "AuthRateLimit_windowStartedAt_idx"
  ON "AuthRateLimit" ("windowStartedAt");

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerId" TEXT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Order_customerId_fkey') THEN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "Order_customerId_createdAt_idx" ON "Order" ("customerId", "createdAt");

COMMIT;
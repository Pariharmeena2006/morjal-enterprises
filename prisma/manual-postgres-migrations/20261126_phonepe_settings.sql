-- Additive PhonePe payment gateway settings. Safe to re-run.
ALTER TABLE "WebsiteSettings" ADD COLUMN IF NOT EXISTS "phonepeEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WebsiteSettings" ADD COLUMN IF NOT EXISTS "phonepeEnv" TEXT NOT NULL DEFAULT 'sandbox';
ALTER TABLE "WebsiteSettings" ADD COLUMN IF NOT EXISTS "phonepeMerchantId" TEXT;
ALTER TABLE "WebsiteSettings" ADD COLUMN IF NOT EXISTS "phonepeSaltKey" TEXT;
ALTER TABLE "WebsiteSettings" ADD COLUMN IF NOT EXISTS "phonepeSaltIndex" TEXT;
ALTER TABLE "WebsiteSettings" ADD COLUMN IF NOT EXISTS "phonepeClientId" TEXT;
ALTER TABLE "WebsiteSettings" ADD COLUMN IF NOT EXISTS "phonepeClientSecret" TEXT;

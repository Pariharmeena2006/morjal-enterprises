-- Make Customer.password optional for OTP-based authentication
ALTER TABLE "Customer" ALTER COLUMN "password" DROP NOT NULL;

-- Make Customer.phone optional (will be collected during checkout)
ALTER TABLE "Customer" ALTER COLUMN "phone" DROP NOT NULL;

-- Create CustomerLoginOTP table for passwordless OTP authentication
CREATE TABLE IF NOT EXISTS "CustomerLoginOTP" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerLoginOTP_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint for customerId
ALTER TABLE "CustomerLoginOTP" DROP CONSTRAINT IF EXISTS "CustomerLoginOTP_customerId_fkey";
ALTER TABLE "CustomerLoginOTP" ADD CONSTRAINT "CustomerLoginOTP_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "CustomerLoginOTP_email_expiresAt_idx" ON "CustomerLoginOTP"("email", "expiresAt");
CREATE INDEX IF NOT EXISTS "CustomerLoginOTP_customerId_idx" ON "CustomerLoginOTP"("customerId");




-- Dedicated PhonePe transaction fields on Order (additive, preserves Razorpay history).
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "phonepeMerchantOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "phonepeTransactionId" TEXT;
CREATE INDEX IF NOT EXISTS "Order_phonepeMerchantOrderId_idx" ON "Order"("phonepeMerchantOrderId");
-- Migrate PhonePe refs stored in legacy razorpay fields (paymentMethod='phonepe' only).
UPDATE "Order" SET "phonepeMerchantOrderId" = "razorpayOrderId"
WHERE "paymentMethod" = 'phonepe' AND "phonepeMerchantOrderId" IS NULL AND "razorpayOrderId" IS NOT NULL;
UPDATE "Order" SET "phonepeTransactionId" = "razorpayPaymentId"
WHERE "paymentMethod" = 'phonepe' AND "phonepeTransactionId" IS NULL AND "razorpayPaymentId" IS NOT NULL;

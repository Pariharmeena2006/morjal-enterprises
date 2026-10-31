-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WebsiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessName" TEXT NOT NULL DEFAULT 'MORJAL Enterprises',
    "logoUrl" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "contactAddress" TEXT,
    "whatsappNumber" TEXT,
    "socialFacebook" TEXT,
    "socialInstagram" TEXT,
    "socialTwitter" TEXT,
    "socialLinkedIn" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "freeShippingThreshold" REAL,
    "codEnabled" BOOLEAN NOT NULL DEFAULT true,
    "shippingPolicy" TEXT,
    "returnPolicy" TEXT,
    "cancellationPolicy" TEXT,
    "privacyPolicy" TEXT,
    "termsAndConditions" TEXT,
    "refundPolicy" TEXT,
    "announcementMessage" TEXT,
    "ownerName" TEXT,
    "ownerTitle" TEXT,
    "ownerBio" TEXT,
    "ownerImageUrl" TEXT,
    "ownerStory" TEXT,
    "shiprocketEnabled" BOOLEAN NOT NULL DEFAULT false,
    "shiprocketEmail" TEXT,
    "shiprocketApiKey" TEXT,
    "shiprocketChannelId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_WebsiteSettings" ("announcementMessage", "businessName", "cancellationPolicy", "codEnabled", "contactAddress", "contactEmail", "contactPhone", "createdAt", "currency", "freeShippingThreshold", "id", "logoUrl", "ownerBio", "ownerImageUrl", "ownerName", "ownerStory", "ownerTitle", "privacyPolicy", "refundPolicy", "returnPolicy", "shippingPolicy", "socialFacebook", "socialInstagram", "socialLinkedIn", "socialTwitter", "termsAndConditions", "updatedAt", "whatsappNumber") SELECT "announcementMessage", "businessName", "cancellationPolicy", "codEnabled", "contactAddress", "contactEmail", "contactPhone", "createdAt", "currency", "freeShippingThreshold", "id", "logoUrl", "ownerBio", "ownerImageUrl", "ownerName", "ownerStory", "ownerTitle", "privacyPolicy", "refundPolicy", "returnPolicy", "shippingPolicy", "socialFacebook", "socialInstagram", "socialLinkedIn", "socialTwitter", "termsAndConditions", "updatedAt", "whatsappNumber" FROM "WebsiteSettings";
DROP TABLE "WebsiteSettings";
ALTER TABLE "new_WebsiteSettings" RENAME TO "WebsiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

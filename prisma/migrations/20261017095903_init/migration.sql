-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "brand" TEXT,
    "sellingPrice" REAL NOT NULL,
    "mrp" REAL,
    "discountPercent" REAL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "features" TEXT,
    "specifications" TEXT,
    "applications" TEXT,
    "material" TEXT,
    "dimensions" TEXT,
    "weight" TEXT,
    "packageDimensions" TEXT,
    "manufacturer" TEXT,
    "countryOfOrigin" TEXT,
    "certifications" TEXT,
    "safetyInstructions" TEXT,
    "warranty" TEXT,
    "shippingInfo" TEXT,
    "faq" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isOutOfStock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "buttonText" TEXT,
    "buttonUrl" TEXT,
    "desktopImageUrl" TEXT,
    "mobileImageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "landmark" TEXT,
    "orderNotes" TEXT,
    "subtotal" REAL NOT NULL,
    "shippingCharge" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "orderStatus" TEXT NOT NULL DEFAULT 'pending',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "shipmentId" TEXT,
    "trackingNumber" TEXT,
    "courierName" TEXT,
    "estimatedDelivery" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebsiteSettings" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

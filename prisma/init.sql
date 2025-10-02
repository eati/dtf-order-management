-- Create Customer table
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "billingName" TEXT NOT NULL,
    "billingZip" TEXT NOT NULL,
    "billingCity" TEXT NOT NULL,
    "billingAddress" TEXT NOT NULL,
    "companyName" TEXT,
    "taxNumber" TEXT,
    "shippingName" TEXT,
    "shippingZip" TEXT,
    "shippingCity" TEXT,
    "shippingAddress" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Order table
CREATE TABLE IF NOT EXISTS "Order" (
    "id" SERIAL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL UNIQUE,
    "customerId" INTEGER NOT NULL,
    "widthMm" INTEGER NOT NULL DEFAULT 300,
    "lengthMm" INTEGER NOT NULL,
    "squareMeters" DOUBLE PRECISION NOT NULL,
    "productNetPrice" DOUBLE PRECISION NOT NULL,
    "productVat" DOUBLE PRECISION NOT NULL,
    "shippingNetPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingVat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "codNetPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "codVat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalNet" DOUBLE PRECISION NOT NULL,
    "totalVat" DOUBLE PRECISION NOT NULL,
    "totalGross" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "shippingMethod" TEXT NOT NULL,
    "shippingAddress" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "glsParcelNumber" TEXT,
    "glsLabelUrl" TEXT,
    "glsStatus" TEXT,
    "glsTrackingUrl" TEXT,
    "orderStatus" TEXT NOT NULL DEFAULT 'új',
    "paymentStatus" TEXT NOT NULL DEFAULT 'nem_fizetve',
    "invoiceStatus" TEXT NOT NULL DEFAULT 'nincs_számla',
    "invoiceNumber" TEXT,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Pricing table
CREATE TABLE IF NOT EXISTS "Pricing" (
    "id" SERIAL PRIMARY KEY,
    "pricePerSqm" DOUBLE PRECISION NOT NULL DEFAULT 6800,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 27,
    "glsPrice" DOUBLE PRECISION NOT NULL DEFAULT 1490,
    "codPrice" DOUBLE PRECISION NOT NULL DEFAULT 600,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default pricing if empty
INSERT INTO "Pricing" ("pricePerSqm", "vatRate", "glsPrice", "codPrice")
SELECT 6800, 27, 1490, 600
WHERE NOT EXISTS (SELECT 1 FROM "Pricing" LIMIT 1);

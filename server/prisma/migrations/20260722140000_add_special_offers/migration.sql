CREATE TABLE "SpecialOffer" (
  "id" SERIAL NOT NULL,
  "productId" INTEGER NOT NULL,
  "discount" INTEGER NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'پیشنهاد ویژه',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "salesLimit" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SpecialOffer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SpecialOffer_productId_key" ON "SpecialOffer"("productId");
CREATE INDEX "SpecialOffer_active_sortOrder_idx" ON "SpecialOffer"("active", "sortOrder");
ALTER TABLE "SpecialOffer" ADD CONSTRAINT "SpecialOffer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "SpecialOffer" ("productId", "discount", "sortOrder")
SELECT "id", "discount", "id" FROM "Product";

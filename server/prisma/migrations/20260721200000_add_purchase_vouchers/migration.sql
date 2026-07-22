ALTER TABLE "Product" ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "PurchaseVoucher" (
    "id" SERIAL NOT NULL,
    "supplierName" TEXT NOT NULL,
    "invoiceNo" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalCost" INTEGER NOT NULL,
    "voucherDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PurchaseVoucher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseVoucherItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "voucherId" INTEGER NOT NULL,
    CONSTRAINT "PurchaseVoucherItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PurchaseVoucher_status_voucherDate_idx" ON "PurchaseVoucher"("status", "voucherDate");
CREATE INDEX "PurchaseVoucher_supplierName_idx" ON "PurchaseVoucher"("supplierName");
CREATE INDEX "PurchaseVoucherItem_voucherId_idx" ON "PurchaseVoucherItem"("voucherId");
CREATE INDEX "PurchaseVoucherItem_productId_idx" ON "PurchaseVoucherItem"("productId");
ALTER TABLE "PurchaseVoucherItem" ADD CONSTRAINT "PurchaseVoucherItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseVoucherItem" ADD CONSTRAINT "PurchaseVoucherItem_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "PurchaseVoucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

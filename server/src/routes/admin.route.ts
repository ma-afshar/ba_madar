import Elysia, { t } from "elysia";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { prisma } from "../db/prisma";

const invoiceUploadDir = resolve(process.cwd(), "uploads", "invoices");

const productBody = t.Object({
  title: t.String({ minLength: 2 }),
  image: t.String({ minLength: 1 }),
  price: t.Number({ minimum: 0 }),
  discount: t.Number({ minimum: 0, maximum: 100 }),
  categoryId: t.Number({ minimum: 1 }),
});

const categoryBody = t.Object({
  title: t.String({ minLength: 2 }),
  image: t.String({ minLength: 1 }),
});

const mediaBody = t.Object({
  image: t.String({ minLength: 1 }),
  link: t.String(),
});

const purchaseVoucherBody = t.Object({
  supplierName: t.String({ minLength: 2 }),
  invoiceNo: t.Optional(t.String()),
  invoiceFile: t.Optional(t.String()),
  notes: t.Optional(t.String()),
  voucherDate: t.String(),
  items: t.Array(t.Object({ productId: t.Number({ minimum: 1 }), quantity: t.Number({ minimum: 1 }), unitCost: t.Number({ minimum: 0 }) }), { minItems: 1 }),
});

const expenseBody = t.Object({
  title: t.String({ minLength: 2 }), category: t.String({ minLength: 2 }),
  amount: t.Number({ minimum: 0 }), description: t.Optional(t.String()), expenseDate: t.String(),
});

const specialOfferBody = t.Object({
  productId: t.Number({ minimum: 1 }),
  discount: t.Number({ minimum: 0, maximum: 100 }),
  label: t.String({ minLength: 1 }),
  active: t.Boolean(),
  sortOrder: t.Number({ minimum: 0 }),
  startsAt: t.Optional(t.String()),
  endsAt: t.Optional(t.String()),
  salesLimit: t.Optional(t.Nullable(t.Number({ minimum: 1 }))),
});

const voucherInclude = { items: { include: { product: { select: { id: true, title: true, image: true, stock: true } } } } } as const;

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .post("/invoice-files", async ({ body, set }) => {
    const file = body.file;
    const extensions: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    const extension = extensions[file.type];
    if (!extension || file.size > 8 * 1024 * 1024) { set.status = 400; return { error: "INVALID_INVOICE_FILE" }; }
    await mkdir(invoiceUploadDir, { recursive: true });
    const name = `${randomUUID()}.${extension}`;
    await Bun.write(resolve(invoiceUploadDir, name), file);
    return { path: `/admin/invoice-files/${name}`, name: file.name, type: file.type };
  }, { body: t.Object({ file: t.File() }) })
  .get("/invoice-files/:name", async ({ params, set }) => {
    if (!/^[a-f0-9-]+\.(pdf|jpg|png|webp)$/.test(params.name)) { set.status = 404; return "NOT_FOUND"; }
    const file = Bun.file(resolve(invoiceUploadDir, params.name));
    if (!await file.exists()) { set.status = 404; return "NOT_FOUND"; }
    return new Response(file, { headers: { "Content-Type": file.type || "application/octet-stream", "Content-Disposition": `inline; filename="${params.name}"` } });
  })
  .get("/overview", async () => {
    const [products, categories, users, banners, sliders, orders, purchaseVouchers, expenses, specialOffers] = await Promise.all([
      prisma.product.findMany({ orderBy: { id: "asc" }, include: { category: true } }),
      prisma.category.findMany({ orderBy: { id: "desc" }, include: { _count: { select: { products: true } } } }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, phone: true, firstName: true, lastName: true, createdAt: true, sessions: { where: { expiresAt: { gt: new Date() } }, select: { id: true } } } }).then(users => users.map(({ sessions, ...user }) => ({ ...user, isActive: sessions.length > 0 }))),
      prisma.banner.findMany({ orderBy: { id: "desc" } }),
      prisma.slider.findMany({ orderBy: { id: "desc" } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, phone: true, firstName: true, lastName: true } }, items: true } }),
      prisma.purchaseVoucher.findMany({ orderBy: [{ voucherDate: "desc" }, { id: "desc" }], include: voucherInclude }),
      prisma.expense.findMany({ orderBy: [{ expenseDate: "desc" }, { id: "desc" }] }),
      prisma.specialOffer.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], include: { product: true } }),
    ]);
    return { products, categories, users, banners, sliders, orders, purchaseVouchers, expenses, specialOffers };
  })
  .post("/special-offers", ({ body }) => prisma.specialOffer.create({ data: { productId: body.productId, discount: body.discount, label: body.label, active: body.active, sortOrder: body.sortOrder, startsAt: body.startsAt ? new Date(body.startsAt) : null, endsAt: body.endsAt ? new Date(body.endsAt) : null, salesLimit: body.salesLimit ?? null }, include: { product: true } }), { body: specialOfferBody })
  .patch("/special-offers/reorder", ({ body }) => prisma.$transaction(body.ids.map((id, index) => prisma.specialOffer.update({ where: { id }, data: { sortOrder: index + 1 } }))), { body: t.Object({ ids: t.Array(t.Number({ minimum: 1 })) }) })
  .put("/special-offers/:id", ({ params, body }) => prisma.specialOffer.update({ where: { id: Number(params.id) }, data: { productId: body.productId, discount: body.discount, label: body.label, active: body.active, sortOrder: body.sortOrder, startsAt: body.startsAt ? new Date(body.startsAt) : null, endsAt: body.endsAt ? new Date(body.endsAt) : null, salesLimit: body.salesLimit ?? null }, include: { product: true } }), { body: specialOfferBody })
  .delete("/special-offers/:id", ({ params }) => prisma.specialOffer.delete({ where: { id: Number(params.id) } }))
  .post("/expenses", ({ body }) => prisma.expense.create({ data: { title: body.title, category: body.category, amount: body.amount, description: body.description || null, expenseDate: new Date(body.expenseDate) } }), { body: expenseBody })
  .put("/expenses/:id", ({ params, body }) => prisma.expense.update({ where: { id: Number(params.id) }, data: { title: body.title, category: body.category, amount: body.amount, description: body.description || null, expenseDate: new Date(body.expenseDate) } }), { body: expenseBody })
  .delete("/expenses/:id", ({ params }) => prisma.expense.delete({ where: { id: Number(params.id) } }))
  .post("/purchase-vouchers", ({ body }) => prisma.purchaseVoucher.create({ data: { supplierName: body.supplierName, invoiceNo: body.invoiceNo || null, invoiceFile: body.invoiceFile || null, notes: body.notes || null, voucherDate: new Date(body.voucherDate), totalCost: body.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0), items: { create: body.items } }, include: voucherInclude }), { body: purchaseVoucherBody })
  .put("/purchase-vouchers/:id", async ({ params, body, set }) => {
    const id = Number(params.id);
    const current = await prisma.purchaseVoucher.findUnique({ where: { id }, include: { items: true } });
    if (!current) { set.status = 404; return { error: "NOT_FOUND" }; }
    return prisma.$transaction(async tx => {
      if (current.status === "received") for (const item of current.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      await tx.purchaseVoucherItem.deleteMany({ where: { voucherId: id } });
      const updated = await tx.purchaseVoucher.update({ where: { id }, data: { supplierName: body.supplierName, invoiceNo: body.invoiceNo || null, invoiceFile: body.invoiceFile || null, notes: body.notes || null, voucherDate: new Date(body.voucherDate), totalCost: body.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0), items: { create: body.items } }, include: voucherInclude });
      if (current.status === "received") for (const item of body.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      return updated;
    });
  }, { body: purchaseVoucherBody })
  .patch("/purchase-vouchers/:id/status", async ({ params, body, set }) => {
    const id = Number(params.id);
    const voucher = await prisma.purchaseVoucher.findUnique({ where: { id }, include: { items: true } });
    if (!voucher) { set.status = 404; return { error: "NOT_FOUND" }; }
    return prisma.$transaction(async tx => {
      if (voucher.status !== "received" && body.status === "received") for (const item of voucher.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      if (voucher.status === "received" && body.status !== "received") for (const item of voucher.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      return tx.purchaseVoucher.update({ where: { id }, data: { status: body.status }, include: voucherInclude });
    });
  }, { body: t.Object({ status: t.Union([t.Literal("draft"), t.Literal("approved"), t.Literal("received"), t.Literal("cancelled")]) }) })
  .delete("/purchase-vouchers/:id", async ({ params, set }) => {
    const id = Number(params.id);
    const voucher = await prisma.purchaseVoucher.findUnique({ where: { id }, include: { items: true } });
    if (!voucher) { set.status = 404; return { error: "NOT_FOUND" }; }
    return prisma.$transaction(async tx => {
      if (voucher.status === "received") for (const item of voucher.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      return tx.purchaseVoucher.delete({ where: { id } });
    });
  })
  .patch("/orders/:id/status", async ({ params, body, set }) => {
    const id = Number(params.id);
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) { set.status = 404; return { error: "NOT_FOUND" }; }
    try {
      return await prisma.$transaction(async tx => {
        if (order.inventoryReserved && order.status !== "cancelled" && body.status === "cancelled") {
          for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
        if (!order.inventoryReserved && order.status === "cancelled" && body.status !== "cancelled") {
          for (const item of order.items) {
            const reserved = await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
            if (reserved.count !== 1) throw new Error(`INSUFFICIENT_STOCK:${item.productId}`);
          }
        }
        const inventoryReserved = body.status === "cancelled" ? false : order.status === "cancelled" ? true : order.inventoryReserved;
        return tx.order.update({ where: { id }, data: { status: body.status, inventoryReserved }, include: { user: { select: { id: true, phone: true, firstName: true, lastName: true } }, items: true } });
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
        set.status = 409;
        return { error: "INSUFFICIENT_STOCK", productId: Number(error.message.split(":")[1]) };
      }
      throw error;
    }
  }, { body: t.Object({ status: t.Union([t.Literal("active"), t.Literal("delivered"), t.Literal("cancelled")]) }) })
  .delete("/orders/:id", async ({ params, set }) => {
    const id = Number(params.id);
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) { set.status = 404; return { error: "NOT_FOUND" }; }
    return prisma.$transaction(async tx => {
      if (order.inventoryReserved) {
        for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
      return tx.order.delete({ where: { id } });
    });
  })
  .patch("/products/:id/inventory", ({ params, body }) => prisma.product.update({ where: { id: Number(params.id) }, data: { minStock: body.minStock } }), { body: t.Object({ minStock: t.Number({ minimum: 0 }) }) })
  .post("/products", ({ body }) => prisma.product.create({ data: body, include: { category: true } }), { body: productBody })
  .put("/products/:id", ({ params, body }) => prisma.product.update({ where: { id: Number(params.id) }, data: body, include: { category: true } }), { body: productBody })
  .delete("/products/:id", async ({ params, set }) => {
    const id = Number(params.id);
    const voucherItems = await prisma.purchaseVoucherItem.findMany({
      where: { productId: id },
      select: { voucherId: true },
      distinct: ["voucherId"],
    });
    if (voucherItems.length) {
      set.status = 409;
      return { error: "PRODUCT_IN_PURCHASE_VOUCHER", voucherIds: voucherItems.map(item => item.voucherId) };
    }
    return prisma.product.delete({ where: { id } });
  })
  .post("/categories", ({ body }) => prisma.category.create({ data: body, include: { _count: { select: { products: true } } } }), { body: categoryBody })
  .put("/categories/:id", ({ params, body }) => prisma.category.update({ where: { id: Number(params.id) }, data: body, include: { _count: { select: { products: true } } } }), { body: categoryBody })
  .delete("/categories/:id", ({ params }) => prisma.category.delete({ where: { id: Number(params.id) } }))
  .post("/banners", ({ body }) => prisma.banner.create({ data: body }), { body: mediaBody })
  .put("/banners/:id", ({ params, body }) => prisma.banner.update({ where: { id: Number(params.id) }, data: body }), { body: mediaBody })
  .delete("/banners/:id", ({ params }) => prisma.banner.delete({ where: { id: Number(params.id) } }))
  .post("/sliders", ({ body }) => prisma.slider.create({ data: body }), { body: mediaBody })
  .put("/sliders/:id", ({ params, body }) => prisma.slider.update({ where: { id: Number(params.id) }, data: body }), { body: mediaBody })
  .delete("/sliders/:id", ({ params }) => prisma.slider.delete({ where: { id: Number(params.id) } }));

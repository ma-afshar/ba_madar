import Elysia, { t } from "elysia";
import { prisma } from "../db/prisma";
import { getSessionUser } from "../services/auth.service";

function token(header?: string) {
  return header?.startsWith("Bearer ") ? header.slice(7) : "";
}

const orderBody = t.Object({
  deliveryFee: t.Number({ minimum: 0 }),
  paymentMethod: t.String({ minLength: 2 }),
  address: t.String({ minLength: 3 }),
  items: t.Array(t.Object({
    id: t.Number(), title: t.String(), image: t.String(), price: t.Number(),
    discount: t.Number(), quantity: t.Number({ minimum: 1 }),
  }), { minItems: 1 }),
});

class StockError extends Error {
  constructor(public productId: number, public available: number) { super("INSUFFICIENT_STOCK"); }
}

export const orderRoutes = new Elysia({ prefix: "/orders" })
  .get("/", async ({ headers, set }) => {
    const user = await getSessionUser(token(headers.authorization));
    if (!user) { set.status = 401; return { error: "UNAUTHORIZED" } as const; }
    return prisma.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: "desc" } });
  })
  .post("/", async ({ headers, body, set }) => {
    const user = await getSessionUser(token(headers.authorization));
    if (!user) { set.status = 401; return { error: "UNAUTHORIZED" } as const; }
    const quantities = new Map<number, number>();
    for (const item of body.items) quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity);

    try {
      return await prisma.$transaction(async tx => {
        const products = await tx.product.findMany({ where: { id: { in: [...quantities.keys()] } } });
        if (products.length !== quantities.size) {
          const found = new Set(products.map(product => product.id));
          const missingId = [...quantities.keys()].find(id => !found.has(id))!;
          throw new StockError(missingId, 0);
        }

        for (const product of products) {
          const quantity = quantities.get(product.id)!;
          const reserved = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
          });
          if (reserved.count !== 1) {
            const latest = await tx.product.findUnique({ where: { id: product.id }, select: { stock: true } });
            throw new StockError(product.id, latest?.stock ?? 0);
          }
        }

        const now = new Date();
        const activeOffers = await tx.specialOffer.findMany({
          where: {
            productId: { in: products.map(product => product.id) }, active: true,
            AND: [
              { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
              { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
            ],
          },
        });
        const offerDiscounts = new Map(activeOffers.map(offer => [offer.productId, offer.discount]));

        const productsTotal = products.reduce((sum, product) => {
          const discount = offerDiscounts.get(product.id) ?? product.discount;
          const price = Math.floor((product.price * (1 - discount / 100)) / 500) * 500;
          return sum + price * quantities.get(product.id)!;
        }, 0);

        return tx.order.create({
          data: {
            userId: user.id, address: body.address, paymentMethod: body.paymentMethod,
            deliveryFee: body.deliveryFee, totalPrice: productsTotal + body.deliveryFee, inventoryReserved: true,
            items: { create: products.map(product => ({ productId: product.id, title: product.title, image: product.image, price: product.price, discount: offerDiscounts.get(product.id) ?? product.discount, quantity: quantities.get(product.id)! })) },
          },
          include: { items: true },
        });
      });
    } catch (error) {
      if (error instanceof StockError) {
        set.status = 409;
        return { error: "INSUFFICIENT_STOCK", productId: error.productId, available: error.available } as const;
      }
      throw error;
    }
  }, { body: orderBody });

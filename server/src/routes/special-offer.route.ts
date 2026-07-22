import Elysia from "elysia";
import { prisma } from "../db/prisma";

export const specialOfferRoutes = new Elysia().get("/special-offers", async () => {
  const now = new Date();
  const offers = await prisma.specialOffer.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
      product: { stock: { gt: 0 } },
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { product: true },
  });

  const sales = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { productId: { in: offers.map(offer => offer.productId) }, order: { status: { not: "cancelled" } } },
    _sum: { quantity: true },
  });
  const soldByProduct = new Map(sales.map(row => [row.productId, row._sum.quantity ?? 0]));

  return offers
    .filter(offer => offer.salesLimit === null || (soldByProduct.get(offer.productId) ?? 0) < offer.salesLimit)
    .map(offer => ({ ...offer.product, discount: offer.discount, offerLabel: offer.label }));
});

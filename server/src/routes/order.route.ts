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

export const orderRoutes = new Elysia({ prefix: "/orders" })
  .get("/", async ({ headers, set }) => {
    const user = await getSessionUser(token(headers.authorization));
    if (!user) { set.status = 401; return { error: "UNAUTHORIZED" } as const; }
    return prisma.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: "desc" } });
  })
  .post("/", async ({ headers, body, set }) => {
    const user = await getSessionUser(token(headers.authorization));
    if (!user) { set.status = 401; return { error: "UNAUTHORIZED" } as const; }
    const productsTotal = body.items.reduce((sum, item) => {
      const price = Math.round((item.price * (1 - item.discount / 100)) / 10000) * 10000;
      return sum + price * item.quantity;
    }, 0);
    return prisma.order.create({
      data: {
        userId: user.id, address: body.address, paymentMethod: body.paymentMethod,
        deliveryFee: body.deliveryFee, totalPrice: productsTotal + body.deliveryFee,
        items: { create: body.items.map(item => ({ productId: item.id, title: item.title, image: item.image, price: item.price, discount: item.discount, quantity: item.quantity })) },
      },
      include: { items: true },
    });
  }, { body: orderBody });

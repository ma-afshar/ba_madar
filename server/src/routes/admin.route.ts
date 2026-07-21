import Elysia, { t } from "elysia";
import { prisma } from "../db/prisma";

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

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .get("/overview", async () => {
    const [products, categories, users, banners, sliders, orders] = await Promise.all([
      prisma.product.findMany({ orderBy: { id: "desc" }, include: { category: true } }),
      prisma.category.findMany({ orderBy: { id: "desc" }, include: { _count: { select: { products: true } } } }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, phone: true, firstName: true, lastName: true, createdAt: true, sessions: { where: { expiresAt: { gt: new Date() } }, select: { id: true } } } }).then(users => users.map(({ sessions, ...user }) => ({ ...user, isActive: sessions.length > 0 }))),
      prisma.banner.findMany({ orderBy: { id: "desc" } }),
      prisma.slider.findMany({ orderBy: { id: "desc" } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, phone: true, firstName: true, lastName: true } }, items: true } }),
    ]);
    return { products, categories, users, banners, sliders, orders };
  })
  .patch("/orders/:id/status", ({ params, body }) => prisma.order.update({ where: { id: Number(params.id) }, data: { status: body.status }, include: { user: { select: { id: true, phone: true, firstName: true, lastName: true } }, items: true } }), { body: t.Object({ status: t.Union([t.Literal("active"), t.Literal("delivered"), t.Literal("cancelled")]) }) })
  .delete("/orders/:id", ({ params }) => prisma.order.delete({ where: { id: Number(params.id) } }))
  .post("/products", ({ body }) => prisma.product.create({ data: body, include: { category: true } }), { body: productBody })
  .put("/products/:id", ({ params, body }) => prisma.product.update({ where: { id: Number(params.id) }, data: body, include: { category: true } }), { body: productBody })
  .delete("/products/:id", ({ params }) => prisma.product.delete({ where: { id: Number(params.id) } }))
  .post("/categories", ({ body }) => prisma.category.create({ data: body, include: { _count: { select: { products: true } } } }), { body: categoryBody })
  .put("/categories/:id", ({ params, body }) => prisma.category.update({ where: { id: Number(params.id) }, data: body, include: { _count: { select: { products: true } } } }), { body: categoryBody })
  .delete("/categories/:id", ({ params }) => prisma.category.delete({ where: { id: Number(params.id) } }))
  .post("/banners", ({ body }) => prisma.banner.create({ data: body }), { body: mediaBody })
  .put("/banners/:id", ({ params, body }) => prisma.banner.update({ where: { id: Number(params.id) }, data: body }), { body: mediaBody })
  .delete("/banners/:id", ({ params }) => prisma.banner.delete({ where: { id: Number(params.id) } }))
  .post("/sliders", ({ body }) => prisma.slider.create({ data: body }), { body: mediaBody })
  .put("/sliders/:id", ({ params, body }) => prisma.slider.update({ where: { id: Number(params.id) }, data: body }), { body: mediaBody })
  .delete("/sliders/:id", ({ params }) => prisma.slider.delete({ where: { id: Number(params.id) } }));

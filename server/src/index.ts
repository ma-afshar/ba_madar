import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

import { sliderRoutes } from "./routes/slider.route";
import { categoryRoutes } from "./routes/category.route";
import { productRoutes } from "./routes/product.route";
import { bannerRoutes } from "./routes/banner.route";
import { authRoutes } from "./routes/auth.route";
import { adminRoutes } from "./routes/admin.route";
import { orderRoutes } from "./routes/order.route";

const app = new Elysia()
  .get("/", () => "Hello from Elysia")
  .use(
    cors({
      origin: [
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
        /^http:\/\/172\.20\.17\.127:\d+$/,
      ],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(sliderRoutes)
  .use(categoryRoutes)
  .use(productRoutes)
  .use(bannerRoutes)
  .use(authRoutes)
  .use(orderRoutes)
  .use(adminRoutes)
  .listen({ port: 3000, hostname: "0.0.0.0" });

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

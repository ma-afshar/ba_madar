import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

import { sliderRoutes } from "./routes/slider.route";
import { categoryRoutes } from "./routes/category.route";
import { productRoutes } from "./routes/product.route";
import { bannerRoutes } from "./routes/banner.route";

const app = new Elysia()
  .get("/", () => "Hello from Elysia")
  .use(
    cors({
      origin: "http://localhost:5173",
    }),
  )
  .use(sliderRoutes)
  .use(categoryRoutes)
  .use(productRoutes)
  .use(bannerRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

import Elysia from "elysia";
import { getProducts } from "../services/product.service";

export const productRoutes = new Elysia().get("/products", async () => {
  return await getProducts();
});

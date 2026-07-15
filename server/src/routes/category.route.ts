import Elysia from "elysia";
import { getCategories } from "../services/category.service";

export const categoryRoutes = new Elysia().get("/categories", async () => {
  return await getCategories();
});

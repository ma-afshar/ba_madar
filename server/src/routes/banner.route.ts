import Elysia from "elysia";
import { getBanners } from "../services/banner.service";

export const bannerRoutes = new Elysia().get("/banners", async () => {
  return await getBanners();
});

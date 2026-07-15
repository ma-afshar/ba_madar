import Elysia from "elysia";
import { getSliders } from "../services/slider.service";

export const sliderRoutes = new Elysia().get("/sliders", async () => {
  return await getSliders();
});

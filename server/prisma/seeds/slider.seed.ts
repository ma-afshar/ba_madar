import { prisma } from "../../src/db/prisma";

export async function seedSliders() {
  await prisma.slider.createMany({
    data: [
      {
        image: "/images/sliders/slider1.png",
        link: "/",
      },
      {
        image: "/images/sliders/slider2.png",
        link: "/",
      },
      {
        image: "/images/sliders/slider3.png",
        link: "/",
      },
      {
        image: "/images/sliders/slider4.png",
        link: "/",
      },
    ],
  });
}

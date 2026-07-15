import { prisma } from "../../src/db/prisma";

export async function seedBanners(){

  await prisma.banner.createMany({
    data:[
      {
        image:"/images/banners/banner.png",
        link:"/"
      }
    ]
  });

}

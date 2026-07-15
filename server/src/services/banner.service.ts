import { prisma } from "../db/prisma";

export async function getBanners() {
  return prisma.banner.findMany({
    orderBy: {
      id: "asc",
    },
  });
}

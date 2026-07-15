import { prisma } from "../db/prisma";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      id: "asc",
    },
    include: {
      products: true,
    },
  });
}

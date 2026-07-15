import { prisma } from "../db/prisma";

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: {
      id: "asc",
    },
    include: {
      category: true,
    },
  });
}

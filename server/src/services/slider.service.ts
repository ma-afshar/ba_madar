import { prisma } from "../db/prisma";

export async function getSliders() {
  return prisma.slider.findMany();
}

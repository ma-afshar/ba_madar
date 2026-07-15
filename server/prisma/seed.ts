import { prisma } from "../src/db/prisma";

import { seedCategories } from "./seeds/category.seed";
import { seedProducts } from "./seeds/product.seed";
import { seedSliders } from "./seeds/slider.seed";
import { seedBanners } from "./seeds/banner.seed";


async function main(){

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.slider.deleteMany();
  await prisma.banner.deleteMany();


  await seedSliders();

  const categories = await seedCategories();

  await seedProducts(categories);

  await seedBanners();


  console.log("✅ Database Seeded Successfully");

}


main()
.catch(console.error)
.finally(async()=>{
  await prisma.$disconnect();
});
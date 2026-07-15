import { prisma } from "../../src/db/prisma";

export async function seedCategories() {
  const accessories = await prisma.category.create({
    data: {
      title: "لوازم جانبی",
      image: "/images/categories/accessories.png",
    },
  });
  const disposable = await prisma.category.create({
    data: {
      title: "یکبار مصرف",
      image: "/images/categories/disposable.png",
    },
  });
  const health = await prisma.category.create({
    data: {
      title: "سلامت",
      image: "/images/categories/health.png",
    },
  });
  const stationery = await prisma.category.create({
    data: {
      title: "لوازم التحریر",
      image: "/images/categories/stationery.png",
    },
  });
  const additives = await prisma.category.create({
    data: {
      title: "افزودنی ها",
      image: "/images/categories/additives.png",
    },
  });
  const nutssweets = await prisma.category.create({
    data: {
      title: "خشکبار، شیرینی",
      image: "/images/categories/nutssweets.png",
    },
  });
  const canned = await prisma.category.create({
    data: {
      title: "کنسروی و آماده",
      image: "/images/categories/canned.png",
    },
  });
  const snacks = await prisma.category.create({
    data: {
      title: "تنقلات",
      image: "/images/categories/snacks.png",
    },
  });
  const frozen = await prisma.category.create({
    data: {
      title: "منجمد، یخچالی",
      image: "/images/categories/frozen.png",
    },
  });
  const cosmetic = await prisma.category.create({
    data: {
      title: "آرایشی، بهداشتی",
      image: "/images/categories/cosmetic.png",
    },
  });
  const motherbaby = await prisma.category.create({
    data: {
      title: "مادر و کودک",
      image: "/images/categories/motherbaby.png",
    },
  });
  const homecare = await prisma.category.create({
    data: {
      title: "بهداشت خانگی",
      image: "/images/categories/homecare.png",
    },
  });

  const pickles = await prisma.category.create({
    data: {
      title: "شور و ترشیجات",
      image: "/images/categories/pickles.png",
    },
  });
  const drinks = await prisma.category.create({
    data: {
      title: "نوشیدنی",
      image: "/images/categories/drinks.png",
    },
  });
  const dairy = await prisma.category.create({
    data: {
      title: "لبنیات",
      image: "/images/categories/dairy.png",
    },
  });
  const protein = await prisma.category.create({
    data: {
      title: "پروتئینی",
      image: "/images/categories/protein.png",
    },
  });
  const grocery = await prisma.category.create({
    data: {
      title: "اساسی و خواربار",
      image: "/images/categories/grocery.png",
    },
  });
  const breakfast = await prisma.category.create({
    data: {
      title: "صبحانه",
      image: "/images/categories/breakfast.png",
    },
  });
  const breadpastry = await prisma.category.create({
    data: {
      title: "نان و شیرینی",
      image: "/images/categories/breadpastry.png",
    },
  });
  const fruitvegetables = await prisma.category.create({
    data: {
      title: "میوه، سبزیجات",
      image: "/images/categories/fruitvegetables.png",
    },
  });

  return {
    accessories,
    disposable,
    health,
    stationery,
    additives,
    nutssweets,
    canned,
    snacks,
    frozen,
    cosmetic,
    motherbaby,
    homecare,
    pickles,
    drinks,
    dairy,
    protein,
    grocery,
    breakfast,
    breadpastry,
    fruitvegetables,
  };
}

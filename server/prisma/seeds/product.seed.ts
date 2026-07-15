import { prisma } from "../../src/db/prisma";

type SeedCategories = {
  dairy: { id: number };
  grocery: { id: number };
};

export async function seedProducts(categories: SeedCategories) {
  await prisma.product.createMany({
    data: [
      {
        title: "روغن زیتون بکر کریستال - ۵ لیتر",
        image: "/images/products/oliveoil.png",
        price: 4350000,
        discount: 15,
        categoryId: categories.grocery.id,
      },
      {
        title: "کشک کم چرب ممتاز حس خوب - ۵۰۰ گرم",
        image: "/images/products/kashk.png",
        price: 4350000,
        discount: 15,
        categoryId: categories.dairy.id,
      },
      {
        title: "روغن زیتون بکر کریستال - ۵ لیتر",
        image: "/images/products/trolley.png",
        price: 4350000,
        discount: 15,
        categoryId: categories.grocery.id,
      },
      {
        title: "کشک کم چرب ممتاز حس خوب - ۵۰۰ گرم",
        image: "/images/products/kashk.png",
        price: 4350000,
        discount: 15,
        categoryId: categories.dairy.id,
      },
      {
        title: "روغن زیتون بکر کریستال - ۵ لیتر",
        image: "/images/products/trolley.png",
        price: 4350000,
        discount: 15,
        categoryId: categories.grocery.id,
      },
      {
        title: "کشک کم چرب ممتاز حس خوب - ۵۰۰ گرم",
        image: "/images/products/kashk.png",
        price: 4350000,
        discount: 15,
        categoryId: categories.dairy.id,
      },
    ],
  });
}

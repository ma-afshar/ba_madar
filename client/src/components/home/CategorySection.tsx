import { useEffect, useState } from "react";

type Category = {
  id: number;
  title: string;
  image: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/categories`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("دریافت دسته‌بندی‌ها با خطا مواجه شد");
        }

        const data: Category[] = await response.json();
        setCategories(data);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error.message);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  return (
    <div className="w-full">
      <section
        className="mx-auto w-93.75 bg-white pb-4 pt-2"
        aria-labelledby="category-title"
      >
        <div className="mx-auto w-82" dir="rtl">
          <div className="flex h-6 items-center justify-between">
            <h2
              id="category-title"
              className="text-base font-bold text-[#E94B24]"
            >
              دسته‌بندی‌ها
            </h2>

            <p className="text-[10px] font-normal text-[#E96B4B]">
              انتخاب سریع محصولات
            </p>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-x-3 gap-y-3">
            {categories.map((category) => (
              <a
                href={`#category-${category.id}`}
                key={category.id}
                className="flex w-18.5 flex-col items-center text-center no-underline"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-19 w-18.5 rounded-xl bg-[#FFF5F2] object-contain"
                  loading="lazy"
                />

                <span className="mt-1.5 flex min-h-8 items-start justify-center px-0.5 text-xs font-normal leading-4 text-[#777]">
                  {category.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
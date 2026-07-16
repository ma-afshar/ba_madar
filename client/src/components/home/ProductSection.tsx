import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";

type Product = {
  id: number;
  title: string;
  image: string;
  price: number;
  discount: number;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function formatPrice(value: number) {
  return value.toLocaleString("fa-IR");
}

function getDiscountedPrice(price: number, discount: number) {
  return Math.round((price * (1 - discount / 100)) / 10000) * 10000;
}

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem, quantityOf } = useCart();

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/products`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("دریافت محصولات با خطا مواجه شد");
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error.message);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  return (
    <div className="w-full">
      <section
        className="mx-auto w-93.75 bg-white pb-4 pt-3"
        aria-labelledby="products-title"
        dir="rtl"
      >
        <div className="mx-auto flex h-7 w-82 items-center justify-between">
          <h2
            id="products-title"
            className="text-base font-bold text-[#E94B24]"
          >
            محصولات ویژه
          </h2>

          <p className="text-[10px] font-normal text-[#E96B4B]">
            بهترین پیشنهادات امروز
          </p>
        </div>

        <div className="mx-auto mt-2 w-82 max-w-full overflow-x-auto overscroll-x-contain scrollbar-none [&::-webkit-scrollbar]:hidden">
          <div className="grid w-max grid-flow-col grid-rows-2 gap-x-2.5 gap-y-3.5">
            {products.map((product) => {
              const finalPrice = getDiscountedPrice(
                product.price,
                product.discount
              );

              return (
                <article
                  key={product.id}
                  className="flex h-77.5 w-39.5 flex-col overflow-hidden rounded-[14px] border border-[#ECE8E6] bg-white"
                >
                  <a
                    href={`#product-${product.id}`}
                    className="block px-1.5 pt-1.5"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-36 w-full rounded-lg bg-[#FDFBFA] object-contain"
                      loading="lazy"
                    />
                  </a>

                  <h3 className="h-12 px-2.5 pt-1 text-right text-xs font-normal leading-5 text-[#555]">
                    {product.title}
                  </h3>

                  <div className="flex h-15 flex-col justify-center px-2.5">
                    <div className="flex items-center justify-between">
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D71932] px-1 text-[8px] font-bold text-white">
                        ٪{product.discount.toLocaleString("fa-IR")}
                      </span>

                      <span className="text-[9px] font-normal text-[#999] line-through decoration-[#999]">
                        {formatPrice(product.price)} تومان
                      </span>
                    </div>

                    <div className="mt-1 flex items-baseline justify-end gap-1 text-[#E94B24]">
                      <span className="text-[10px] font-normal">
                        تومان
                      </span>

                      <strong className="text-[13px] font-bold">
                        {formatPrice(finalPrice)}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addItem(product)}
                    className="-mb-px mt-auto h-10 w-full shrink-0 rounded-[13px] border border-[#ECECEC] bg-[#F7F7F7] text-sm font-normal text-[#777]"
                  >
                    {quantityOf(product.id) > 0 ? `افزودن مجدد (${quantityOf(product.id).toLocaleString("fa-IR")})` : "افزودن به سبد"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

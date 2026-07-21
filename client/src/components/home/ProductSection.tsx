import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../lib/api";

type Product = {
  id: number;
  title: string;
  image: string;
  price: number;
  discount: number;
};


function formatPrice(value: number) {
  return value.toLocaleString("fa-IR");
}

function getDiscountedPrice(price: number, discount: number) {
  return Math.round((price * (1 - discount / 100)) / 10000) * 10000;
}

function ProductDetails({ product, quantity, onClose }: { product: Product; quantity: number; onClose: () => void }) {
  const { addItem, increment, decrement } = useCart();
  return <div className="product-modal" role="dialog" aria-modal="true" aria-label="جزئیات محصول" onClick={onClose}>
    <section className="product-sheet" dir="rtl" onClick={event => event.stopPropagation()}>
      <button type="button" className="product-close" aria-label="بستن" onClick={onClose} />
      <div className="product-gallery"><img src={product.image} alt={product.title} /><div className="product-dots" aria-hidden="true"><i /><i /><i /><i /></div></div>
      <h1>{product.title}</h1>
      <div className="product-specs"><div><span>نوع بسته‌بندی:</span><strong>بسته‌بندی استاندارد</strong></div><div><span>ضمانت کالا:</span><strong>تضمین اصالت</strong></div><div><span>شرایط نگهداری:</span><strong>در جای خشک و خنک</strong></div><div><span>ارسال:</span><strong>ارسال سریع</strong></div></div>
      <div className="product-purchase"><div className="product-support-price"><b>تعداد در سبد خرید</b><span><strong>{quantity.toLocaleString("fa-IR")}</strong> عدد</span></div><div className="product-buy-row">{quantity > 0 ? <div className="product-modal-counter" dir="ltr"><button type="button" onClick={() => decrement(product.id)} aria-label="کم کردن تعداد">−</button><b>{quantity.toLocaleString("fa-IR")}</b><button type="button" onClick={() => increment(product.id)} aria-label="زیاد کردن تعداد">＋</button></div> : <button type="button" onClick={() => addItem(product)}>افزودن به سبد خرید</button>}<div><span>قیمت کالا</span><strong>{formatPrice(getDiscountedPrice(product.price, product.discount))}</strong><small>تومان</small></div></div></div>
    </section>
  </div>;
}

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addItem, increment, decrement, quantityOf } = useCart();

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
              const quantity = quantityOf(product.id);

              return (
                <article
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedProduct(product)}
                  onKeyDown={event => { if (event.key === "Enter") setSelectedProduct(product); }}
                  className="flex h-77.5 w-39.5 flex-col overflow-hidden rounded-[14px] border border-[#ECE8E6] bg-white"
                >
                  <div
                    className="block px-1.5 pt-1.5"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-36 w-full rounded-lg bg-[#FDFBFA] object-contain"
                      loading="lazy"
                    />
                  </div>

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

                  {quantity > 0 ? (
                    <div className="-mb-px mt-auto flex h-10 w-full shrink-0 items-center justify-between rounded-[13px] border border-[#ECECEC] bg-[#F7F7F7] px-3" dir="ltr">
                      <button type="button" onClick={event => { event.stopPropagation(); decrement(product.id); }} aria-label="کم کردن تعداد" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-0 bg-white p-0 text-[#E94B24] shadow-sm"><svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
                      <span className="text-sm font-bold text-[#666]">{quantity.toLocaleString("fa-IR")}</span>
                      <button type="button" onClick={event => { event.stopPropagation(); increment(product.id); }} aria-label="زیاد کردن تعداد" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-0 bg-[#FF612B] p-0 text-white shadow-sm"><svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h8M7 3v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
                    </div>
                  ) : (
                    <button type="button" onClick={event => { event.stopPropagation(); addItem(product); }} className="-mb-px mt-auto h-10 w-full shrink-0 rounded-[13px] border border-[#ECECEC] bg-[#F7F7F7] text-sm font-normal text-[#777]">افزودن به سبد</button>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
      {selectedProduct && <ProductDetails product={selectedProduct} quantity={quantityOf(selectedProduct.id)} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}

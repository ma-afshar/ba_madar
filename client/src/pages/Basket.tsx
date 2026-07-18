import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FestivalBanner from "../components/home/FestivalBanner";
import BottomNavigation from "../components/layout/BottomNavigation";
import { useCart, type CartItem } from "../context/CartContext";

function formatPrice(value: number) { return value.toLocaleString("fa-IR"); }
function finalPrice(product: CartItem) { return Math.round((product.price * (1 - product.discount / 100)) / 10000) * 10000; }
type BasketSort = "popular" | "discount" | "newest" | "cheap" | "expensive";
const basketSortLabels: Record<BasketSort, string> = { popular: "پرفروش‌ترین", discount: "بیشترین تخفیف", newest: "جدیدترین", cheap: "ارزان‌ترین", expensive: "گران‌ترین" };

function BasketHeader({ count }: { count: number }) {
  const navigate = useNavigate();
  return (
    <header className="search-page-header" dir="rtl">
      <button type="button" className="search-brand" onClick={() => navigate("/home")}>
        <img src="/images/header/logo.png" alt="مادر مارکت" />
        <img src="/images/header/direction.png" alt="" aria-hidden="true" />
      </button>
      <div className="search-header-actions" dir="ltr">
        <button type="button" className="search-icon-button" aria-label="جستجو"><img src="/images/searchbar/search.png" alt="" /></button>
        <button type="button" className="search-cart-button">
          <span className="search-cart-icon"><img src="/images/header/basket.png" alt="" /></span>
          <span><b>مشاهده سبد</b><small dir="ltr"><span>{count.toLocaleString("fa-IR")}</span><span>محصول</span></small></span>
        </button>
      </div>
    </header>
  );
}

function ProductCard({ product, onOpen }: { product: CartItem; onOpen: () => void }) {
  const { increment, decrement, removeItem } = useCart();
  const price = finalPrice(product);
  return (
    <article className="search-product-card" dir="rtl" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => { if (event.key === "Enter") onOpen(); }}>
      <div className="search-product-main">
        <img className="search-product-image" src={product.image} alt={product.title} />
        <div className="search-product-info">
          <h2>{product.title}</h2>
          <div className="search-product-bottom">
            <div className="search-counter" dir="ltr">
              <button type="button" onClick={(event) => { event.stopPropagation(); product.quantity === 1 ? removeItem(product.id) : decrement(product.id); }} aria-label={product.quantity === 1 ? "حذف محصول" : "کم کردن تعداد"}>
                {product.quantity === 1 ? <img src="/images/basket/recycle-bin.png" alt="" /> : <svg width="21" height="21" viewBox="0 0 22 22" fill="none" aria-hidden="true"><rect x="3.5" y="8" width="15" height="6" rx="3" stroke="#FF612B" strokeWidth="1.4"/></svg>}
              </button>
              <span>{product.quantity.toLocaleString("fa-IR")}</span>
              <button type="button" onClick={(event) => { event.stopPropagation(); increment(product.id); }}><img src="/images/basket/plus.png" alt="افزایش" /></button>
            </div>
            <div className="search-price">
              {product.discount > 0 && <div><span className="search-discount">٪{product.discount.toLocaleString("fa-IR")}</span><del>{formatPrice(product.price)} تومان</del></div>}
              <strong>{formatPrice(price)}</strong><small>تومان</small>
            </div>
          </div>
        </div>
      </div>
      <div className="search-card-price"><b>جمع این محصول</b><span><strong>{formatPrice(price * product.quantity)}</strong> تومان</span></div>
    </article>
  );
}

function ProductDetails({ product, onClose }: { product: CartItem; onClose: () => void }) {
  const { addItem } = useCart();
  return (
    <div className="product-modal" role="dialog" aria-modal="true" aria-label="جزئیات محصول" onClick={onClose}>
      <section className="product-sheet" dir="rtl" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="product-close" aria-label="بستن" onClick={onClose} />
        <div className="product-gallery"><img src={product.image} alt={product.title} /><div className="product-dots" aria-hidden="true"><i /><i /><i /><i /></div></div>
        <h1>{product.title}</h1>
        <div className="product-specs">
          <div><span>نوع بسته‌بندی :</span><strong>پلی اتیلن</strong></div><div><span>مواد تشکیل‌دهنده :</span><strong>شیر گاوی</strong></div>
          <div><span>نوع بسته‌بندی :</span><strong>پلی اتیلن</strong></div><div><span>مواد تشکیل‌دهنده :</span><strong>شیر گاوی</strong></div>
        </div>
        <div className="product-purchase">
          <div className="product-support-price"><b>تعداد در سبد خرید</b><span><strong>{product.quantity.toLocaleString("fa-IR")}</strong> عدد</span></div>
          <div className="product-buy-row"><button type="button" onClick={() => addItem(product)}>افزودن به سبد خرید</button><div><span>قیمت کالا</span><strong>{formatPrice(finalPrice(product))}</strong><small>تومان</small></div></div>
        </div>
      </section>
    </div>
  );
}

export default function Basket() {
  const { items, totalQuantity } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<CartItem | null>(null);
  const [sort, setSort] = useState<BasketSort>("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const sortedItems = useMemo(() => [...items].sort((a, b) => sort === "discount" ? b.discount - a.discount : sort === "newest" ? b.id - a.id : sort === "cheap" ? finalPrice(a) - finalPrice(b) : sort === "expensive" ? finalPrice(b) - finalPrice(a) : b.quantity - a.quantity), [items, sort]);
  return (
    <>
      <main className="search-page" onClick={() => sortOpen && setSortOpen(false)}>
        <BasketHeader count={totalQuantity} />
        <div className="search-festival"><FestivalBanner /></div>
        <div className="search-tools" dir="rtl">
          <div className="catalog-sort basket-sort" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSortOpen(value => !value)}><img className="catalog-sort-icon" src="/images/basket/arrow-swap.png" alt="" /> مرتب‌سازی <img className={sortOpen ? "catalog-sort-arrow open" : "catalog-sort-arrow"} src="/images/basket/arrow-down.png" alt="" /></button>
            {sortOpen && <div className="catalog-sort-menu">{(Object.keys(basketSortLabels) as BasketSort[]).map(option => <button type="button" key={option} className={sort === option ? "active" : ""} onClick={() => { setSort(option); setSortOpen(false); }}>{basketSortLabels[option]}</button>)}</div>}
          </div>
          <button type="button" className="search-card-filter"><img src="/images/basket/card.png" alt="" /> حامی کارت</button>
        </div>
        <section className="search-results" aria-label="محصولات سبد خرید">
          {sortedItems.length ? sortedItems.map((product) => <ProductCard key={product.id} product={product} onOpen={() => setSelectedProduct(product)} />) : <div className="basket-empty">سبد خرید شما خالی است</div>}
        </section>
      </main>
      <BottomNavigation />
      {selectedProduct && <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </>
  );
}

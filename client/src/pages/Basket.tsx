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
        <button type="button" className="search-icon-button" aria-label="جستجو" onClick={() => navigate("/search")}><img src="/images/searchbar/search.png" alt="" /></button>
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
  const { addItem, increment, decrement, items } = useCart();
  const currentProduct = items.find(item => item.id === product.id) ?? product;
  const currentQuantity = items.find(item => item.id === product.id)?.quantity ?? 0;
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
          <div className="product-support-price"><b>تعداد در سبد خرید</b><span><strong>{currentQuantity.toLocaleString("fa-IR")}</strong> عدد</span></div>
          <div className="product-buy-row">{currentQuantity > 0 ? <div className="product-modal-counter" dir="ltr"><button type="button" onClick={() => { if (currentQuantity === 1) onClose(); decrement(product.id); }} aria-label="کم کردن تعداد">−</button><b>{currentProduct.quantity.toLocaleString("fa-IR")}</b><button type="button" onClick={() => increment(product.id)} aria-label="زیاد کردن تعداد">＋</button></div> : <button type="button" onClick={() => addItem(product)}>افزودن به سبد خرید</button>}<div><span>قیمت کالا</span><strong>{formatPrice(finalPrice(product))}</strong><small>تومان</small></div></div>
        </div>
      </section>
    </div>
  );
}

function CheckoutSection() {
  const { items, placeOrder } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("تهران، آدرس پیش‌فرض من");
  const [paymentMethod, setPaymentMethod] = useState("پرداخت آنلاین");
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const deliveryFee = 25000;
  const productsTotal = items.reduce((sum, item) => sum + finalPrice(item) * item.quantity, 0);
  const payable = productsTotal + deliveryFee;

  const handlePayment = () => {
    if (!items.length || !address.trim() || isPaying) return;
    setIsPaying(true);
    window.setTimeout(async () => {
      const order = await placeOrder({ address: address.trim(), paymentMethod, deliveryFee });
      if (order) navigate("/orders", { replace: true, state: { paymentSuccess: true, orderId: order.id } });
      else { setIsPaying(false); navigate("/login"); }
    }, 900);
  };

  return <><button type="button" className="checkout-trigger" onClick={() => setCheckoutOpen(true)} dir="rtl"><span><b>تکمیل خرید و پرداخت</b><small>{items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString("fa-IR")} کالا در سبد خرید</small></span><span><b>{formatPrice(payable)}</b><small>تومان ←</small></span></button>{checkoutOpen && <div className="checkout-modal" role="presentation" onClick={() => !isPaying && setCheckoutOpen(false)}><section className="checkout-sheet" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={event => event.stopPropagation()}><div className="checkout-handle" /><button type="button" className="checkout-close" aria-label="بستن پرداخت" onClick={() => setCheckoutOpen(false)}>×</button><div className="checkout-section">
    <div className="checkout-title-row"><div><span className="checkout-lock">✓</span><div><h2 id="checkout-title">تکمیل خرید و پرداخت</h2><p>پرداخت امن و ثبت فوری سفارش</p></div></div><span>مرحله آخر</span></div>
    <label className="checkout-field"><span>آدرس تحویل</span><textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={2} placeholder="آدرس تحویل سفارش را وارد کنید" /></label>
    <fieldset className="payment-methods"><legend>روش پرداخت</legend>
      {["پرداخت آنلاین", "پرداخت با کارت حامی"].map(method => <label key={method} className={paymentMethod === method ? "selected" : ""}><input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} /><span className="payment-radio" /><span><b>{method}</b><small>{method === "پرداخت آنلاین" ? "درگاه امن بانکی" : "استفاده از اعتبار کارت"}</small></span></label>)}
    </fieldset>
    <div className="checkout-summary"><div><span>جمع کالاها</span><b>{formatPrice(productsTotal)} تومان</b></div><div><span>هزینه ارسال</span><b>{formatPrice(deliveryFee)} تومان</b></div><div className="checkout-payable"><span>مبلغ قابل پرداخت</span><b>{formatPrice(payable)} <small>تومان</small></b></div></div>
    <button type="button" className="checkout-button" disabled={!items.length || !address.trim() || isPaying} onClick={handlePayment}>{isPaying ? <><i /> در حال انجام پرداخت...</> : <>پرداخت و ثبت سفارش <span>←</span></>}</button>
    <p className="checkout-note">با پرداخت، سفارش شما ثبت و به بخش سفارش‌های جاری منتقل می‌شود.</p>
  </div></section></div>}</>;
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
        {items.length > 0 && <CheckoutSection />}
        <section className="search-results" aria-label="محصولات سبد خرید">
          {sortedItems.length ? sortedItems.map((product) => <ProductCard key={product.id} product={product} onOpen={() => setSelectedProduct(product)} />) : <div className="basket-empty">سبد خرید شما خالی است</div>}
        </section>
      </main>
      <BottomNavigation />
      {selectedProduct && <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FestivalBanner from "../components/home/FestivalBanner";
import BottomNavigation from "../components/layout/BottomNavigation";

const products = [
  { id: 1, image: "/images/products/oliveoil.png", title: "روغن زیتون بکر کریستال - ۵ لیتر پنیر فتا دوشه هراز روغن زیتون بکر کریستال - ۵ لیتر پنیر فتا دوشه هراز", price: "۳,۷۰۰,۰۰۰", cardPrice: "۳,۰۰۰,۰۰۰", discount: true, inCart: true },
  { id: 2, image: "/images/products/kashk.png", title: "روغن زیتون بکر کریستال - ۵ لیتر پنیر فتا دوشه هراز روغن زیتون بکر کریستال", price: "۴۰,۰۰۰", cardPrice: "", discount: false, inCart: false },
  { id: 3, image: "/images/products/oliveoil.png", title: "روغن زیتون بکر کریستال - ۵ لیتر پنیر فتا دوشه هراز روغن زیتون بکر کریستال - ۵ لیتر پنیر فتا دوشه هراز", price: "۳,۷۰۰,۰۰۰", cardPrice: "۳,۰۰۰,۰۰۰", discount: true, inCart: false },
  { id: 4, image: "/images/products/oliveoil.png", title: "روغن زیتون بکر کریستال - ۵ لیتر پنیر فتا دوشه هراز روغن زیتون بکر کریستال - ۵ لیتر پنیر فتا دوشه هراز", price: "۳,۷۰۰,۰۰۰", cardPrice: "۳,۰۰۰,۰۰۰", discount: true, inCart: false },
  { id: 5, image: "/images/products/oliveoil.png", title: "روغن زیتون بکر کریستال - ۵ لیتر پنیر فتا دوشه هراز روغن زیتون بکر کریستال - ۵ لیتر پنیر فتا دوشه هراز", price: "۳,۷۰۰,۰۰۰", cardPrice: "", discount: true, inCart: false },
  { id: 6, image: "/images/products/kashk.png", title: "روغن زیتون بکر کریستال - ۵ لیتر پنیر فتا دوشه هراز روغن زیتون بکر کریستال", price: "۴۰,۰۰۰", cardPrice: "", discount: false, inCart: false },
];

function BasketHeader() {
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
          <span><b>مشاهده سبد</b><small dir="ltr">۱ محصول</small></span>
        </button>
      </div>
    </header>
  );
}

type Product = (typeof products)[number];

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  return (
    <article className="search-product-card" dir="rtl" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => { if (event.key === "Enter") onOpen(); }}>
      <div className="search-product-main">
        <img className="search-product-image" src={product.image} alt="" />
        <div className="search-product-info">
          <h2>{product.title}</h2>
          <div className="search-product-bottom">
            {product.inCart ? (
              <div className="search-counter" dir="ltr">
                <button type="button" onClick={(event) => event.stopPropagation()}><img src="/images/basket/recycle-bin.png" alt="حذف" /></button>
                <span>۱</span>
                <button type="button" onClick={(event) => event.stopPropagation()}><img src="/images/basket/plus.png" alt="افزایش" /></button>
              </div>
            ) : <button type="button" className="search-add-button" onClick={(event) => event.stopPropagation()}>افزودن به سبد</button>}
            <div className="search-price">
              {product.discount && <div><span className="search-discount">٪۱۰</span><del>۴,۰۰۰,۰۰۰ تومان</del></div>}
              <strong>{product.price}</strong><small>تومان</small>
            </div>
          </div>
        </div>
      </div>
      {product.cardPrice && <div className="search-card-price"><b>قیمت با حامی کارت</b><span><strong>{product.cardPrice}</strong> تومان</span></div>}
    </article>
  );
}

function ProductDetails({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div className="product-modal" role="dialog" aria-modal="true" aria-label="جزئیات محصول" onClick={onClose}>
      <section className="product-sheet" dir="rtl" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="product-close" aria-label="بستن" onClick={onClose} />
        <div className="product-gallery">
          <img src={product.image} alt={product.title} />
          <div className="product-dots" aria-hidden="true"><i /><i /><i /><i /></div>
        </div>
        <h1>{product.title}</h1>
        <div className="product-specs">
          <div><span>نوع بسته‌بندی :</span><strong>پلی اتیلن</strong></div>
          <div><span>مواد تشکیل‌دهنده :</span><strong>شیر گاوی</strong></div>
          <div><span>نوع بسته‌بندی :</span><strong>پلی اتیلن</strong></div>
          <div><span>مواد تشکیل‌دهنده :</span><strong>شیر گاوی</strong></div>
        </div>
        <div className="product-purchase">
          {product.cardPrice && (
            <div className="product-support-price"><b>قیمت با حامی کارت</b><span><strong>{product.cardPrice}</strong> تومان</span></div>
          )}
          <div className="product-buy-row">
            <button type="button">افزودن به سبد خرید</button>
            <div><span>قیمت کالا</span><strong>{product.price}</strong><small>تومان</small></div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Basket() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <main className="search-page">
        <BasketHeader />
        <div className="search-festival"><FestivalBanner /></div>
        <div className="search-tools" dir="rtl">
          <button type="button" className="search-sort"><img src="/images/basket/arrow-swap.png" alt="" /> مرتب سازی <span>⌄</span></button>
          <button type="button" className="search-card-filter"><img src="/images/basket/card.png" alt="" /> حامی کارت</button>
        </div>
        <section className="search-results" aria-label="محصولات سبد خرید">
          {products.map((product) => <ProductCard key={product.id} product={product} onOpen={() => setSelectedProduct(product)} />)}
          <span className="search-loader" aria-label="در حال بارگذاری" />
        </section>
      </main>
      <BottomNavigation />
      {selectedProduct && <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNavigation from "../components/layout/BottomNavigation";
import { useCart, type CartProduct, type CustomerOrder } from "../context/CartContext";
import { API_URL } from "../lib/api";

type OrderStatus = "active" | "delivered" | "cancelled";
type Order = CustomerOrder;

const tabs: { value: OrderStatus; label: string }[] = [
  { value: "active", label: "جاری" }, { value: "delivered", label: "تحویل‌شده" }, { value: "cancelled", label: "لغوشده" },
];
const formatPrice = (value: number) => value.toLocaleString("fa-IR");

function OrdersHeader() {
  const navigate = useNavigate();
  const { totalQuantity } = useCart();
  return <header className="orders-header" dir="rtl">
    <button type="button" className="orders-brand" onClick={() => navigate("/home")} aria-label="بازگشت به خانه"><img src="/images/header/logo.png" alt="مادر مارکت" /><img src="/images/header/direction.png" alt="" aria-hidden="true" /></button>
    <h1>سفارش‌های من</h1>
    <button type="button" className="orders-basket" onClick={() => navigate("/basket")} aria-label="سبد خرید"><img src="/images/header/basket.png" alt="" />{totalQuantity > 0 && <span>{totalQuantity.toLocaleString("fa-IR")}</span>}</button>
  </header>;
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const reorder = async () => {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) return;
    const products = await response.json() as CartProduct[];
    const currentProducts = new Map(products.map(product => [product.id, product]));
    order.items.forEach(item => {
      const product = currentProducts.get(item.id);
      if (!product) return;
      for (let index = 0; index < Math.min(item.quantity, product.stock); index += 1) addItem(product);
    });
    navigate("/basket");
  };
  return <article className="order-card">
    <div className="order-card-top"><span className={`order-status ${order.status}`}><i />{order.statusLabel}</span><span className="order-number">شماره سفارش: <b>{order.id}</b></span></div>
    <p className="order-date">{order.date}</p>
    <div className="order-products" aria-label="کالاهای سفارش">{order.items.map(item => <div className="order-product" key={item.id}><img src={item.image} alt={item.title} />{item.quantity > 1 && <span>{item.quantity.toLocaleString("fa-IR")}</span>}</div>)}</div>
    {expanded && <div className="order-details">{order.items.map(item => <div key={item.id}><span>{item.title} × {item.quantity.toLocaleString("fa-IR")}</span><b>{formatPrice(item.price * item.quantity)} تومان</b></div>)}</div>}
    <div className="order-total"><span>مبلغ کل</span><b>{formatPrice(order.price)} <small>تومان</small></b></div>
    <div className="order-actions"><button type="button" className="order-detail-button" onClick={() => setExpanded(value => !value)}>{expanded ? "بستن جزئیات" : "مشاهده جزئیات"}<img className={expanded ? "open" : ""} src="/images/basket/arrow-down.png" alt="" aria-hidden="true" /></button>{order.status === "delivered" && <button type="button" className="order-repeat-button" onClick={() => void reorder()}>خرید مجدد</button>}{order.status === "active" && <div className="order-progress"><i /><i /><i /></div>}</div>
  </article>;
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("active");
  const { orders: placedOrders, refreshOrders } = useCart();
  const allOrders: Order[] = placedOrders;
  const visibleOrders = allOrders.filter(order => order.status === activeTab);
  const navigate = useNavigate();
  const location = useLocation();
  const paymentSuccess = Boolean((location.state as { paymentSuccess?: boolean } | null)?.paymentSuccess);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(paymentSuccess);
  const dismissPaymentSuccess = () => { setShowPaymentSuccess(false); navigate(location.pathname, { replace: true, state: null }); };
  useEffect(() => {
    if (!showPaymentSuccess) return;
    const timeout = window.setTimeout(dismissPaymentSuccess, 5000);
    return () => window.clearTimeout(timeout);
  }, [showPaymentSuccess]);
  useEffect(() => {
    void refreshOrders();
    const interval = window.setInterval(() => void refreshOrders(), 8000);
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") void refreshOrders(); };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshOrders);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", refreshWhenVisible); window.removeEventListener("focus", refreshOrders); };
  }, [refreshOrders]);
  return <><main className="orders-page" dir="rtl"><OrdersHeader />{showPaymentSuccess && <div className="order-success" role="status" onClick={dismissPaymentSuccess}><span>✓</span><div><b>پرداخت با موفقیت انجام شد</b><small>سفارش شما ثبت شد و در حال آماده‌سازی است.</small></div><button type="button" aria-label="بستن پیام">×</button></div>}<nav className="orders-tabs" aria-label="وضعیت سفارش‌ها">{tabs.map(tab => <button type="button" key={tab.value} className={activeTab === tab.value ? "active" : ""} onClick={() => setActiveTab(tab.value)}>{tab.label}<span>{allOrders.filter(order => order.status === tab.value).length.toLocaleString("fa-IR")}</span></button>)}</nav><section className="orders-list">{visibleOrders.length ? visibleOrders.map(order => <OrderCard order={order} key={order.id} />) : <div className="orders-empty"><div className="orders-empty-icon"><img src="/images/navigationbar/receipt.png" alt="" /></div><h2>سفارشی در این بخش ندارید</h2><p>بعد از ثبت سفارش، وضعیت آن را از اینجا دنبال کنید.</p><button type="button" onClick={() => navigate("/home")}>شروع خرید</button></div>}</section></main><BottomNavigation /></>;
}

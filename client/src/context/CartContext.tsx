import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { API_URL } from "../lib/api";
import { getAuthToken } from "../lib/auth";

export type CartProduct = {
  id: number;
  title: string;
  image: string;
  price: number;
  discount: number;
  stock: number;
};

export type CartItem = CartProduct & { quantity: number };

export type OrderStatus = "active" | "delivered" | "cancelled";
export type CustomerOrder = {
  id: string;
  date: string;
  status: OrderStatus;
  statusLabel: string;
  price: number;
  deliveryFee: number;
  paymentMethod: string;
  address: string;
  items: CartItem[];
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  addItem: (product: CartProduct) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  removeItem: (id: number) => void;
  quantityOf: (id: number) => number;
  orders: CustomerOrder[];
  refreshOrders: () => Promise<void>;
  placeOrder: (details: { address: string; paymentMethod: string; deliveryFee: number }) => Promise<CustomerOrder | null>;
};

const STORAGE_KEY = "madar_cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as CartItem[]; }
    catch { return []; }
  });
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [stockMessage, setStockMessage] = useState("");
  const [stockMessagePosition, setStockMessagePosition] = useState({ x: 0, y: 0 });
  const pointerPosition = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const showStockMessage = useCallback(() => {
    const x = Math.min(Math.max(pointerPosition.current.x, 130), window.innerWidth - 130);
    const y = Math.max(pointerPosition.current.y - 12, 58);
    setStockMessagePosition({ x, y });
    setStockMessage("موجودی این کالا در انبار کافی نیست.");
  }, []);

  const refreshOrders = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) { setOrders([]); return; }
    try {
      const response = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!response.ok) return;
      const data = await response.json() as ServerOrder[];
      setOrders(data.map(mapServerOrder));
    } catch { /* Keep the last known orders when temporarily offline. */ }
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { void refreshOrders(); }, [refreshOrders]);
  useEffect(() => {
    const trackPointer = (event: PointerEvent) => { pointerPosition.current = { x: event.clientX, y: event.clientY }; };
    window.addEventListener("pointermove", trackPointer, { passive: true });
    window.addEventListener("pointerdown", trackPointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", trackPointer);
      window.removeEventListener("pointerdown", trackPointer);
    };
  }, []);
  useEffect(() => {
    if (!stockMessage) return;
    const timeout = window.setTimeout(() => setStockMessage(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [stockMessage]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/products`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((products: Array<CartProduct>) => {
        const currentProducts = new Map(products.map(product => [product.id, product]));
        setItems(current => current.flatMap(item => {
          const product = currentProducts.get(item.id);
          if (!product || product.stock <= 0) return [];
          return [{ ...item, ...product, quantity: Math.min(item.quantity, product.stock) }];
        }));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const value = useMemo<CartContextValue>(() => ({
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem: (product) => {
      const existing = items.find(item => item.id === product.id);
      if (product.stock <= 0 || (existing?.quantity ?? 0) >= product.stock) {
        showStockMessage();
        return;
      }
      setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, ...product, quantity: Math.min(item.quantity + 1, product.stock) } : item)
        : [...current, { ...product, quantity: 1 }];
      });
    },
    increment: (id) => {
      const item = items.find(product => product.id === id);
      if (!item || item.quantity >= item.stock) {
        showStockMessage();
        return;
      }
      setItems((current) => current.map((product) => product.id === id ? { ...product, quantity: product.quantity + 1 } : product));
    },
    decrement: (id) => setItems((current) => current.flatMap((item) => item.id !== id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [])),
    removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
    quantityOf: (id) => items.find((item) => item.id === id)?.quantity ?? 0,
    orders,
    refreshOrders,
    placeOrder: async ({ address, paymentMethod, deliveryFee }) => {
      if (!items.length) return null;
      const authToken = getAuthToken();
      if (!authToken) return null;
      const response = await fetch(`${API_URL}/orders`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ address, paymentMethod, deliveryFee, items }) });
      if (response.status === 409) {
        const shortage = await response.json() as { productId: number; available: number };
        setItems(current => current.flatMap(item => item.id !== shortage.productId ? [item] : shortage.available > 0 ? [{ ...item, stock: shortage.available, quantity: Math.min(item.quantity, shortage.available) }] : []));
        throw new Error("INSUFFICIENT_STOCK");
      }
      if (!response.ok) return null;
      const order = mapServerOrder(await response.json() as ServerOrder);
      setOrders((current) => [order, ...current]);
      setItems([]);
      return order;
    },
  }), [items, orders, refreshOrders, showStockMessage]);

  return <CartContext.Provider value={value}>{children}{stockMessage && <div className="stock-warning-toast" role="alert" style={{ left: stockMessagePosition.x, top: stockMessagePosition.y }}>{stockMessage}</div>}</CartContext.Provider>;
}

type ServerOrder = { id: number; status: OrderStatus; totalPrice: number; deliveryFee: number; paymentMethod: string; address: string; createdAt: string; items: Array<{ productId: number; title: string; image: string; price: number; discount: number; quantity: number }> };
const statusLabels: Record<OrderStatus, string> = { active: "در حال آماده‌سازی", delivered: "تحویل داده شده", cancelled: "لغو شده" };
function mapServerOrder(order: ServerOrder): CustomerOrder {
  return { id: String(order.id), date: new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.createdAt)), status: order.status, statusLabel: statusLabels[order.status], price: order.totalPrice, deliveryFee: order.deliveryFee, paymentMethod: order.paymentMethod, address: order.address, items: order.items.map(item => ({ id: item.productId, title: item.title, image: item.image, price: item.price, discount: item.discount, stock: 0, quantity: item.quantity })) };
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

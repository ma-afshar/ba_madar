import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { API_URL } from "../lib/api";
import { getAuthToken } from "../lib/auth";

export type CartProduct = {
  id: number;
  title: string;
  image: string;
  price: number;
  discount: number;
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

  const value = useMemo<CartContextValue>(() => ({
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem: (product) => setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    }),
    increment: (id) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
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
      if (!response.ok) return null;
      const order = mapServerOrder(await response.json() as ServerOrder);
      setOrders((current) => [order, ...current]);
      setItems([]);
      return order;
    },
  }), [items, orders, refreshOrders]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

type ServerOrder = { id: number; status: OrderStatus; totalPrice: number; deliveryFee: number; paymentMethod: string; address: string; createdAt: string; items: Array<{ productId: number; title: string; image: string; price: number; discount: number; quantity: number }> };
const statusLabels: Record<OrderStatus, string> = { active: "در حال آماده‌سازی", delivered: "تحویل داده شده", cancelled: "لغو شده" };
function mapServerOrder(order: ServerOrder): CustomerOrder {
  return { id: String(order.id), date: new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.createdAt)), status: order.status, statusLabel: statusLabels[order.status], price: order.totalPrice, deliveryFee: order.deliveryFee, paymentMethod: order.paymentMethod, address: order.address, items: order.items.map(item => ({ id: item.productId, title: item.title, image: item.image, price: item.price, discount: item.discount, quantity: item.quantity })) };
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

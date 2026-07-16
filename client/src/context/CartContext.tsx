import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartProduct = {
  id: number;
  title: string;
  image: string;
  price: number;
  discount: number;
};

export type CartItem = CartProduct & { quantity: number };

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  addItem: (product: CartProduct) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  removeItem: (id: number) => void;
  quantityOf: (id: number) => number;
};

const STORAGE_KEY = "madar_cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as CartItem[]; }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

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
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

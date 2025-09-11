// filepath: /Users/dakshgupta/Desktop/SIH/SIH Frontend/src/pages/consumer/CartContext.tsx
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  manufacturer: string;
  batchId: string;
  lifecycle: LifecycleEvent[];
}

export interface LifecycleEvent {
  stage: string; // Farmer, Lab, Processor, Manufacturer, Store
  actor: string;
  location: string;
  timestamp: string; // ISO string
  details: string;
  hash: string; // mock blockchain hash
}

interface CartItem extends ProductItem {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (p: ProductItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQty: (id: string, qty: number) => void;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (p: ProductItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setItems([]);
  const updateQty = (id: string, qty: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);

  const value = { items, addToCart, removeFromCart, clearCart, updateQty, total };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
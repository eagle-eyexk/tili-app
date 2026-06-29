import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

import type { Cart, CartItem } from "@/types";

const CART_KEY = "tiligo_cart_v1";

interface CartContextType {
  cart: Cart | null;
  totalItems: number;
  totalPrice: number;
  addItem: (businessId: string, businessName: string, deliveryFee: number, item: Omit<CartItem, "quantity">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY).then((raw) => {
      if (raw) {
        try { setCart(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const saveCart = useCallback((newCart: Cart | null) => {
    setCart(newCart);
    if (newCart) {
      AsyncStorage.setItem(CART_KEY, JSON.stringify(newCart));
    } else {
      AsyncStorage.removeItem(CART_KEY);
    }
  }, []);

  const addItem = useCallback(
    (businessId: string, businessName: string, deliveryFee: number, item: Omit<CartItem, "quantity">) => {
      if (cart && cart.businessId !== businessId) {
        Alert.alert(
          "Shporta jo e zbrazur",
          `Shporta juaj ka produkte nga "${cart.businessName}". A dëshironi ta pastroni dhe të shtoni nga "${businessName}"?`,
          [
            { text: "Anulo", style: "cancel" },
            {
              text: "Pastro dhe shto",
              style: "destructive",
              onPress: () => {
                saveCart({ businessId, businessName, deliveryFee, items: [{ ...item, quantity: 1 }] });
              },
            },
          ]
        );
        return;
      }

      const base: Cart = cart ?? { businessId, businessName, deliveryFee, items: [] };
      const existing = base.items.find((i) => i.id === item.id);
      const newItems: CartItem[] = existing
        ? base.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...base.items, { ...item, quantity: 1 }];

      saveCart({ ...base, items: newItems });
    },
    [cart, saveCart]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      if (!cart) return;
      const newItems = cart.items.filter((i) => i.id !== itemId);
      saveCart(newItems.length ? { ...cart, items: newItems } : null);
    },
    [cart, saveCart]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (!cart) return;
      if (quantity <= 0) { removeItem(itemId); return; }
      saveCart({ ...cart, items: cart.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)) });
    },
    [cart, removeItem, saveCart]
  );

  const clearCart = useCallback(() => saveCart(null), [saveCart]);

  const getItemQuantity = useCallback(
    (itemId: string) => cart?.items.find((i) => i.id === itemId)?.quantity ?? 0,
    [cart]
  );

  const totalItems = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const totalPrice = cart?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart, getItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be within CartProvider");
  return ctx;
}

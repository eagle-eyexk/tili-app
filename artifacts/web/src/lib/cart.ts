const CART_KEY = "tiligo_web_cart_v1";
const GUEST_KEY = "tiligo_web_guest_id";
const GUEST_NAME_KEY = "tiligo_web_name";
const GUEST_PHONE_KEY = "tiligo_web_phone";

export interface CartItem {
  id: string; name: string; price: number; quantity: number; image?: string;
}

export interface Cart {
  businessId: string; businessName: string; deliveryFee: number; items: CartItem[];
}

export function getCart(): Cart | null {
  try { const raw = localStorage.getItem(CART_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

export function setCart(cart: Cart | null): void {
  if (cart) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  else localStorage.removeItem(CART_KEY);
}

export function getGuestId(): string {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export function getGuestName(): string { return localStorage.getItem(GUEST_NAME_KEY) ?? ""; }
export function setGuestName(v: string): void { localStorage.setItem(GUEST_NAME_KEY, v); }
export function getGuestPhone(): string { return localStorage.getItem(GUEST_PHONE_KEY) ?? ""; }
export function setGuestPhone(v: string): void { localStorage.setItem(GUEST_PHONE_KEY, v); }

export function cartTotal(cart: Cart): number {
  return cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
}

export function cartItemCount(cart: Cart): number {
  return cart.items.reduce((s, i) => s + i.quantity, 0);
}

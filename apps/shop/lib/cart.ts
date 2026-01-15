import { cookies } from "next/headers";

export type CartItem = {
  productId: string;
  priceId: string;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  shippingCountry?: string;
  shippingService?: "standard" | "express";
};

const CART_COOKIE = "mezcal_cart";

const normalizeCart = (cart: Cart): Cart => ({
  items: cart.items.filter((item) => item.quantity > 0),
  shippingCountry: cart.shippingCountry,
  shippingService: cart.shippingService,
});

export const getCart = () => {
  const cookieStore = cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return { items: [] } satisfies Cart;
  try {
    const parsed = JSON.parse(raw) as Cart;
    return normalizeCart(parsed);
  } catch {
    return { items: [] } satisfies Cart;
  }
};

export const setCart = (cart: Cart) => {
  const cookieStore = cookies();
  const value = JSON.stringify(normalizeCart(cart));
  cookieStore.set(CART_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
};

export const addItem = (cart: Cart, item: CartItem) => {
  const existing = cart.items.find((entry) => entry.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.items.push({ ...item });
  }
  return normalizeCart(cart);
};

export const updateItemQuantity = (cart: Cart, productId: string, quantity: number) => {
  const existing = cart.items.find((entry) => entry.productId === productId);
  if (!existing) return cart;
  existing.quantity = quantity;
  return normalizeCart(cart);
};

export const removeItem = (cart: Cart, productId: string) => {
  cart.items = cart.items.filter((entry) => entry.productId !== productId);
  return normalizeCart(cart);
};

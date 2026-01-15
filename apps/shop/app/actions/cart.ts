"use server";

import { revalidatePath } from "next/cache";

import { addItem, getCart, removeItem, setCart, updateItemQuantity } from "@/lib/cart";

export const addToCartAction = async (formData: FormData) => {
  const productId = String(formData.get("productId") ?? "");
  const priceId = String(formData.get("priceId") ?? "");
  if (!productId || !priceId) return;

  const cart = getCart();
  const updated = addItem(cart, { productId, priceId, quantity: 1 });
  setCart(updated);
  revalidatePath("/cart");
};

export const updateQuantityAction = async (formData: FormData) => {
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  if (!productId) return;
  const cart = getCart();
  const updated = updateItemQuantity(cart, productId, Number.isNaN(quantity) ? 1 : quantity);
  setCart(updated);
  revalidatePath("/cart");
};

export const removeFromCartAction = async (formData: FormData) => {
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;
  const cart = getCart();
  const updated = removeItem(cart, productId);
  setCart(updated);
  revalidatePath("/cart");
};

export const updateShippingAction = async (formData: FormData) => {
  const shippingCountry = String(formData.get("shippingCountry") ?? "");
  const shippingService = String(formData.get("shippingService") ?? "");
  const cart = getCart();
  cart.shippingCountry = shippingCountry || undefined;
  cart.shippingService = shippingService === "express" ? "express" : "standard";
  setCart(cart);
  revalidatePath("/cart");
};

export const clearCartAction = async () => {
  setCart({ items: [] });
  revalidatePath("/cart");
};

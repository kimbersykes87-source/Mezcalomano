"use server";

import { revalidatePath } from "next/cache";

import { addItem, getCart, removeItem, setCart, updateItemQuantity } from "@/lib/cart";

export const addToCartAction = async (formData: FormData) => {
  const productId = String(formData.get("productId") ?? "");
  const priceId = String(formData.get("priceId") ?? "");
  if (!productId || !priceId) return;

  const cart = await getCart();
  const updated = addItem(cart, { productId, priceId, quantity: 1 });
  await setCart(updated);
  revalidatePath("/cart");
};

export const updateQuantityAction = async (formData: FormData) => {
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  if (!productId) return;
  const cart = await getCart();
  const updated = updateItemQuantity(cart, productId, Number.isNaN(quantity) ? 1 : quantity);
  await setCart(updated);
  revalidatePath("/cart");
};

export const removeFromCartAction = async (formData: FormData) => {
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;
  const cart = await getCart();
  const updated = removeItem(cart, productId);
  await setCart(updated);
  revalidatePath("/cart");
};

export const updateShippingAction = async (formData: FormData) => {
  const shippingCountry = String(formData.get("shippingCountry") ?? "");
  const shippingService = String(formData.get("shippingService") ?? "");
  const cart = await getCart();
  cart.shippingCountry = shippingCountry || undefined;
  cart.shippingService = shippingService === "express" ? "express" : "standard";
  await setCart(cart);
  revalidatePath("/cart");
};

export const clearCartAction = async () => {
  await setCart({ items: [] });
  revalidatePath("/cart");
};

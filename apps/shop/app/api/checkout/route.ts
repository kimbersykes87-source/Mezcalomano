import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getCart } from "@/lib/cart";
import { getProductsByIds } from "@/lib/catalog";
import { ALLOWED_COUNTRIES } from "@/lib/countries";
import { createId } from "@/lib/ids";
import { reserveInventory, releaseInventory } from "@/lib/inventory";
import { getShippingRatesForCountry } from "@/lib/shipping";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/lib/cloudflare-env";

export async function POST() {
  const cart = getCart();
  if (cart.items.length === 0) {
    return NextResponse.redirect(new URL("/cart", env.NEXT_PUBLIC_SITE_URL));
  }

  const products = await getProductsByIds(cart.items.map((item) => item.productId));
  const lineItems = cart.items.map((item) => {
    const product = products.find((entry) => entry.productId === item.productId);
    if (!product) {
      throw new Error(`Missing product ${item.productId}`);
    }
    const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
      name: product.name,
      metadata: {
        product_id: product.productId,
      },
    };
    if (env.STRIPE_TAX_CODE) {
      productData.tax_code = env.STRIPE_TAX_CODE;
    }
    return {
      price_data: {
        currency: "usd",
        unit_amount: product.unitAmount,
        product_data: productData,
      },
      quantity: item.quantity,
    };
  });

  const shippingCountry = (cart.shippingCountry ?? "US").toUpperCase();
  const shippingRates = await getShippingRatesForCountry(shippingCountry);
  const fallbackRates = shippingRates.length > 0 ? shippingRates : await getShippingRatesForCountry("US");
  const requestedService = cart.shippingService ?? "standard";
  const selectedRate = fallbackRates.find((rate) => rate.serviceLevel === requestedService) ?? fallbackRates[0];

  if (!selectedRate) {
    return NextResponse.json({ error: "No shipping rates available." }, { status: 400 });
  }

  await reserveInventory(
    cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  );

  const reservationId = createId("resv");
  const { env: cfEnv } = getRequestContext<CloudflareEnv>();

  try {
    const shippingRateData: Stripe.Checkout.SessionCreateParams.ShippingOption.ShippingRateData = {
      display_name: selectedRate.serviceLevel === "express" ? "Express" : "Standard",
      type: "fixed_amount",
      fixed_amount: {
        amount: selectedRate.amount,
        currency: "usd",
      },
    };
    if (selectedRate.minDays || selectedRate.maxDays) {
      shippingRateData.delivery_estimate = {
        minimum: selectedRate.minDays ? { unit: "business_day", value: selectedRate.minDays } : undefined,
        maximum: selectedRate.maxDays ? { unit: "business_day", value: selectedRate.maxDays } : undefined,
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ALLOWED_COUNTRIES,
      },
      shipping_options: [
        {
          shipping_rate_data: shippingRateData,
        },
      ],
      phone_number_collection: { enabled: true },
      success_url: `${env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        reservation_id: reservationId,
        shipping_service: selectedRate.serviceLevel,
        shipping_country: shippingCountry,
      },
    });

    await cfEnv.KV.put(
      `reservation:${reservationId}`,
      JSON.stringify({
        items: cart.items,
        shippingCountry,
        shippingService: selectedRate.serviceLevel,
      }),
      { expirationTtl: 60 * 30 },
    );

    if (!session.url) {
      throw new Error("Stripe checkout URL missing.");
    }

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    await releaseInventory(
      cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );
    throw error;
  }
}

import { Resend } from "resend";

import { env } from "@/lib/env";
import { formatCurrency } from "@/lib/money";

const resend = new Resend(env.RESEND_API_KEY);

const wrapEmail = (title: string, body: string) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
    <h1 style="font-size: 20px; margin-bottom: 12px;">${title}</h1>
    ${body}
    <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
      Mezcalomano · shop.mezcalomano.com
    </p>
  </div>
`;

export const sendOrderConfirmation = async (params: {
  to: string;
  orderId: string;
  totalAmount: number;
  currency: string;
}) => {
  const html = wrapEmail(
    "Your Mezcalomano order is confirmed",
    `
    <p>Thank you for your order. We are preparing your deck for shipment.</p>
    <p style="margin-top: 12px;"><strong>Order:</strong> ${params.orderId}</p>
    <p><strong>Total:</strong> ${formatCurrency(params.totalAmount, params.currency)}</p>
    <p style="margin-top: 12px;">You can view status anytime at <a href="${env.NEXT_PUBLIC_SITE_URL}/order/${params.orderId}">your order page</a>.</p>
  `,
  );

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: "Your Mezcalomano order is confirmed",
    html,
  });
};

export const sendShippingConfirmation = async (params: {
  to: string;
  orderId: string;
  trackingNumber: string;
}) => {
  const html = wrapEmail(
    "Your Mezcalomano order has shipped",
    `
    <p>Your order is on its way.</p>
    <p style="margin-top: 12px;"><strong>Order:</strong> ${params.orderId}</p>
    <p><strong>Tracking:</strong> ${params.trackingNumber}</p>
    <p style="margin-top: 12px;">View order status at <a href="${env.NEXT_PUBLIC_SITE_URL}/order/${params.orderId}">your order page</a>.</p>
  `,
  );

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: "Your Mezcalomano order has shipped",
    html,
  });
};

export const sendRefundConfirmation = async (params: { to: string; orderId: string }) => {
  const html = wrapEmail(
    "Your Mezcalomano refund is processed",
    `
    <p>Your refund has been processed.</p>
    <p style="margin-top: 12px;"><strong>Order:</strong> ${params.orderId}</p>
    <p style="margin-top: 12px;">If you have any questions, reply to this email.</p>
  `,
  );

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: "Your Mezcalomano refund is processed",
    html,
  });
};

export const sendMagicLink = async (params: { to: string; magicLink: string }) => {
  const html = wrapEmail(
    "Your Mezcalomano login link",
    `
    <p>Use the link below to access your account. It expires soon and can only be used once.</p>
    <p style="margin-top: 12px;"><a href="${params.magicLink}">Sign in to your account</a></p>
  `,
  );

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: "Your Mezcalomano login link",
    html,
  });
};

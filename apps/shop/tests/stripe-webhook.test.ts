import { describe, expect, it } from "vitest";

describe("Stripe webhook", () => {
  it("rejects invalid signature", async () => {
    process.env.NODE_ENV = "test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const request = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "bad" },
      body: "payload",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

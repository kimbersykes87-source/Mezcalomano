import { describe, expect, it } from "vitest";

describe("ShipStation signature", () => {
  it("rejects invalid signatures", async () => {
    process.env.NODE_ENV = "test";
    process.env.SHIPSTATION_WEBHOOK_SECRET = "secret";
    const { verifyShipStationSignature } = await import("@/lib/shipstation");
    const valid = verifyShipStationSignature("payload", "bad-signature");
    expect(valid).toBe(false);
  });
});

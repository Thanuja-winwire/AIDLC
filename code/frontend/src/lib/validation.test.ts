import { describe, expect, it } from "vitest";
import { hasErrors, luhnValid, validateCard, validateRegister } from "./validation";

describe("validation", () => {
  it("accepts valid test card and rejects bad Luhn", () => {
    expect(luhnValid("4242424242424242")).toBe(true);
    expect(luhnValid("4242424242424241")).toBe(false);
  });

  it("validates card fields", () => {
    const now = new Date("2025-01-15");
    expect(hasErrors(validateCard({ number: "4242 4242 4242 4242", expiry: "12/30", cvc: "123" }, now))).toBe(false);
    const e = validateCard({ number: "1", expiry: "01/20", cvc: "1" }, now);
    expect(e.number && e.expiry && e.cvc).toBeTruthy();
  });

  it("validates registration", () => {
    expect(hasErrors(validateRegister({ name: "A", email: "a@b.co", password: "12345678" }))).toBe(false);
    expect(validateRegister({ name: "", email: "x", password: "short" })).toHaveProperty("password");
  });
});

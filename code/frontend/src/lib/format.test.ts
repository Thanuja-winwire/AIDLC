import { describe, expect, it } from "vitest";
import { daysUntil, formatMoney, formatPercent, statusLabel } from "./format";

describe("format", () => {
  it("formats money", () => expect(formatMoney("1234.5")).toBe("$1,234.50"));
  it("formats percent", () => expect(formatPercent(0.0425)).toBe("4.3%"));
  it("labels status", () => expect(statusLabel("past_due")).toBe("Past due"));
  it("never returns negative days", () => {
    expect(daysUntil("2020-01-01T00:00:00Z", new Date("2025-01-01"))).toBe(0);
    expect(daysUntil("2025-01-11T00:00:00Z", new Date("2025-01-01T00:00:00Z"))).toBe(10);
  });
});

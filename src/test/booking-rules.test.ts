import { describe, expect, it } from "vitest";
import { capacityIssues, estimateTotal, resetDemo, unlockHost } from "@/lib/store";

describe("booking & host rules", () => {
  it("Bean to cup $35 x 2 visitors = $70 estimated", () => {
    expect(estimateTotal("process", 2)).toBe(70);
  });
  it("flags groups above Noor's limit without declining", () => {
    const c = { times: [], maxGuests: { walk: 4 }, unavailable: ["2026-11-02"], availableDays: [0, 1, 2, 3, 4, 5, 6] };
    expect(capacityIssues({ experienceId: "walk", date: "2026-11-01", guests: 5 }, c)).toEqual(["More than your limit of 4 guests"]);
    expect(capacityIssues({ experienceId: "walk", date: "2026-11-02", guests: 2 }, c)).toEqual(["You marked this day as unavailable"]);
  });
  it("host area opens only with the demo PIN", () => {
    resetDemo();
    expect(unlockHost("0000")).toBe(false);
    expect(unlockHost("1234")).toBe(true);
  });
});

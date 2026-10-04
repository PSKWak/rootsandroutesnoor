import { describe, expect, it } from "vitest";
import { digestDue, needsReview, pendingSync, SMS_LABEL } from "@/lib/feedback-sync";

describe("feedback sync rules", () => {
  it("skips items already being synced (no duplicates)", () => {
    const list = [{ id: "a", consent: true, sync: "waiting" as const }];
    expect(pendingSync(list, new Set(["a"]))).toHaveLength(0);
  });
  it("retries failed items and never drops them", () => {
    const list = [{ id: "a", consent: true, sync: "failed" as const }, { id: "b", consent: true, sync: "synced" as const }];
    expect(pendingSync(list, new Set()).map((x) => x.id)).toEqual(["a"]);
    expect(list).toHaveLength(2);
  });
  it("never syncs feedback without consent", () => {
    expect(pendingSync([{ id: "a", consent: false, sync: "saved" as const }], new Set())).toHaveLength(0);
  });
  it("never shows Delivered for SMS", () => {
    expect(Object.values(SMS_LABEL)).not.toContain("Delivered");
  });
  it("holds translations under 0.7 confidence for review", () => {
    expect(needsReview(0.5)).toBe(true);
    expect(needsReview(0.9)).toBe(false);
  });
  it("daily digest waits a full day", () => {
    expect(digestDue("daily", 1000, 1000 + 3600000, 3)).toBe(false);
    expect(digestDue("daily", 1000, 1000 + 86400000, 3)).toBe(true);
  });
});

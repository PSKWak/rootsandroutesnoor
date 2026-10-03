import { describe, expect, it, vi } from "vitest";
import { feedbackThemes, noorDecide, requestBooking, resetDemo, useStore } from "@/lib/store";

void useStore;

describe("Rooted rules", () => {
  it("never auto-confirms a booking", async () => {
    vi.useFakeTimers();
    resetDemo();
    requestBooking({ experienceId: "walk", date: "2026-11-01", guests: 2 });
    vi.advanceTimersByTime(60_000);
    const { bookings } = JSON.parse(localStorage.getItem("rooted-state-v1")!);
    expect(bookings[0].status).toBe("awaiting");
    noorDecide(bookings[0].id, "confirmed");
    expect(JSON.parse(localStorage.getItem("rooted-state-v1")!).bookings[0].status).toBe("confirmed");
    vi.useRealTimers();
  });

  it("counts seed feedback themes with sample sizes", () => {
    resetDemo();
    const fb = JSON.parse(localStorage.getItem("rooted-state-v1")!).feedback;
    const t = Object.fromEntries(feedbackThemes(fb).map((x) => [x.label, x.count]));
    expect(t["mentioned meeting Noor"]).toBe(4);
    expect(t["mentioned coffee processing"]).toBe(3);
    expect(t["asked about roasting"]).toBe(2);
  });
});

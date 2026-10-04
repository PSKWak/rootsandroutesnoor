import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "@/components/rooted";

function mockPrefersReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

function wrapperOf(text: string) {
  return screen.getByText(text).parentElement!;
}

describe("coffee journey reveal motion", () => {
  afterEach(() => {
    mockPrefersReducedMotion(false);
    delete (globalThis as unknown as Record<string, unknown>).IntersectionObserver;
  });

  it("shows every step straight away when the visitor prefers reduced motion", () => {
    mockPrefersReducedMotion(true);
    render(
      <Reveal delay={480}>
        <p>Growing</p>
      </Reveal>,
    );
    const cls = wrapperOf("Growing").className;
    expect(cls).toContain("animate-rise-in");
    expect(cls).not.toContain("opacity-0");
  });

  it("hides a step until it scrolls into view when motion is allowed", () => {
    mockPrefersReducedMotion(false);
    (globalThis as unknown as Record<string, unknown>).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    render(
      <Reveal>
        <p>Roasting</p>
      </Reveal>,
    );
    expect(wrapperOf("Roasting").className).toContain("opacity-0");
  });

  it("never leaves a step hidden when the browser cannot observe scrolling", () => {
    mockPrefersReducedMotion(false);
    expect(typeof (globalThis as unknown as Record<string, unknown>).IntersectionObserver).toBe("undefined");
    render(
      <Reveal>
        <p>Harvesting</p>
      </Reveal>,
    );
    expect(wrapperOf("Harvesting").className).toContain("animate-rise-in");
  });
});

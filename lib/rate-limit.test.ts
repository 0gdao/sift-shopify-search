import { describe, expect, it, vi } from "vitest";

import { takeRateLimit } from "./rate-limit";

describe("takeRateLimit", () => {
  it("allows a burst up to the configured limit", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000);
    expect(takeRateLimit("burst-a", { limit: 2, windowMs: 10_000 }).allowed).toBe(true);
    expect(takeRateLimit("burst-a", { limit: 2, windowMs: 10_000 }).allowed).toBe(true);
    expect(takeRateLimit("burst-a", { limit: 2, windowMs: 10_000 })).toMatchObject({
      allowed: false,
      retryAfter: 10,
      remaining: 0,
    });
    vi.restoreAllMocks();
  });

  it("resets after the window", () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(20_000);
    takeRateLimit("burst-b", { limit: 1, windowMs: 1_000 });
    expect(takeRateLimit("burst-b", { limit: 1, windowMs: 1_000 }).allowed).toBe(false);
    clock.mockReturnValue(21_001);
    expect(takeRateLimit("burst-b", { limit: 1, windowMs: 1_000 }).allowed).toBe(true);
    vi.restoreAllMocks();
  });
});

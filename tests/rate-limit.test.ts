import { describe, expect, it, beforeEach } from "vitest";

import { checkRateLimit, resetRateLimitStore } from "@/lib/rate-limit";

describe("rate limit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("allows requests within the configured limit", () => {
    const config = { maxRequests: 3, windowMs: 60_000 };

    expect(checkRateLimit("contact:ip:1.2.3.4", config).allowed).toBe(true);
    expect(checkRateLimit("contact:ip:1.2.3.4", config).allowed).toBe(true);
    expect(checkRateLimit("contact:ip:1.2.3.4", config).allowed).toBe(true);
  });

  it("blocks requests after the limit is exceeded", () => {
    const config = { maxRequests: 2, windowMs: 60_000 };

    expect(checkRateLimit("contact:email:test@example.com", config).allowed).toBe(true);
    expect(checkRateLimit("contact:email:test@example.com", config).allowed).toBe(true);

    const blocked = checkRateLimit("contact:email:test@example.com", config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks ip and email keys independently", () => {
    const config = { maxRequests: 1, windowMs: 60_000 };

    expect(checkRateLimit("contact:ip:1.2.3.4", config).allowed).toBe(true);
    expect(checkRateLimit("contact:email:test@example.com", config).allowed).toBe(true);
    expect(checkRateLimit("contact:ip:1.2.3.4", config).allowed).toBe(false);
    expect(checkRateLimit("contact:email:test@example.com", config).allowed).toBe(false);
  });
});

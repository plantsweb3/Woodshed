/*
 * In-memory rate limiter. Good enough for single-region Vercel + a school-scale app.
 * If we ever run on multiple regions, swap this for Upstash/Turso counter keys.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, max: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, remaining: max - 1, resetAt: now + windowSeconds * 1000 };
  }
  existing.count += 1;
  if (existing.count > max) return { ok: false, remaining: 0, resetAt: existing.resetAt };
  return { ok: true, remaining: max - existing.count, resetAt: existing.resetAt };
}

export function ipFromHeaders(headers: Headers) {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

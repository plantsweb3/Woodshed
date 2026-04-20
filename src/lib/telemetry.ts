/*
 * Aggregate-only PostHog. No-op when NEXT_PUBLIC_POSTHOG_KEY is missing.
 * Uses hashed user IDs — no emails, no names in telemetry. Used to understand
 * product fit, never for surveillance.
 */
import { createHash } from "node:crypto";
import { PostHog } from "posthog-node";

let client: PostHog | null = null;

function getClient() {
  if (client) return client;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  client = new PostHog(key, { host, flushAt: 10, flushInterval: 5000 });
  return client;
}

export function hashId(id: string) {
  const salt = process.env.TELEMETRY_SALT || "woodshed-default-salt";
  return createHash("sha256").update(`${salt}:${id}`).digest("hex").slice(0, 32);
}

export interface CaptureInput {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

export async function captureServerEvent(input: CaptureInput) {
  const c = getClient();
  if (!c) return;
  c.capture({
    distinctId: hashId(input.distinctId),
    event: input.event,
    properties: sanitize(input.properties),
  });
}

function sanitize(props?: Record<string, unknown>) {
  if (!props) return props;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (k.toLowerCase().includes("email")) continue;
    if (k === "name" || k === "firstName" || k === "lastName") continue;
    out[k] = v;
  }
  return out;
}

export async function shutdownTelemetry() {
  if (client) await client.shutdown();
}

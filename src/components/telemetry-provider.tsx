"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

let initialized = false;

export function TelemetryProvider({ hashedUserId, role }: { hashedUserId: string | null; role?: string }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (!initialized) {
      posthog.init(key, {
        api_host: host,
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: true,
        autocapture: false,
        persistence: "localStorage",
        person_profiles: "identified_only",
      });
      initialized = true;
    }

    if (hashedUserId) {
      posthog.identify(hashedUserId, { role });
    }
  }, [hashedUserId, role]);

  return null;
}

export function capture(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, properties);
  } catch {
    /* no-op */
  }
}

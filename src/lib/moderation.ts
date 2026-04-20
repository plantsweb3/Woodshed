/*
 * Moderation helpers:
 *  - `scan(text)` returns a light-touch profanity flag (for auto-queueing)
 *  - `zeroTolerance(text)` returns a category for immediate-escalation hits
 *    (self-harm, threats, sexual content, slurs)
 *
 * Deliberately conservative: false positives are preferable to false negatives,
 * since the consequence is "human reviews it", not "user is banned".
 */
import { Filter } from "bad-words";

// The bad-words package already covers common profanity. We add the
// heavy-weight categories separately so they can be routed to zero-tolerance.
const SELF_HARM = [
  "kill myself",
  "kms",
  "kys",
  "self harm",
  "self-harm",
  "suicide",
  "cut myself",
  "end it all",
  "want to die",
];
const THREATS = ["i'll kill", "i will kill", "gonna kill", "murder you", "shoot up", "bomb the"];
const SEXUAL_EXPLICIT = ["nudes", "send nudes", "dick pic", "porn", "horny"];
// Slurs — keeping the common ones. Expand as your moderators see patterns.
const SLURS = ["n-word", "faggot", "retard", "retarded", "tranny", "kike", "chink", "spic", "gook"];

const filter = new Filter();

export function scan(text: string) {
  if (!text) return { flagged: false };
  const normalized = text.toLowerCase();
  if (filter.isProfane(normalized)) return { flagged: true, reason: "profanity" as const };
  return { flagged: false };
}

export type ZeroToleranceCategory = "self_harm" | "threats" | "sexual" | "slur";

export function zeroTolerance(text: string): ZeroToleranceCategory | null {
  if (!text) return null;
  const n = text.toLowerCase();
  if (SELF_HARM.some((w) => n.includes(w))) return "self_harm";
  if (THREATS.some((w) => n.includes(w))) return "threats";
  if (SLURS.some((w) => n.includes(w))) return "slur";
  if (SEXUAL_EXPLICIT.some((w) => n.includes(w))) return "sexual";
  return null;
}

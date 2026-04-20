import { randomUUID, randomBytes } from "node:crypto";

export const newId = () => randomUUID();

// Human-readable invite code: 4-4 block, ambiguous chars stripped.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newInviteCode() {
  const buf = randomBytes(8);
  let out = "";
  for (let i = 0; i < buf.length; i++) {
    out += ALPHABET[buf[i] % ALPHABET.length];
    if (i === 3) out += "-";
  }
  return out;
}

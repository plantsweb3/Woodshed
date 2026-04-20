import bcrypt from "bcryptjs";

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE, signSession, verifySession, type SessionPayload } from "./auth-edge";

export async function hashPassword(plaintext: string) {
  if (plaintext.length < 8) throw new Error("Password must be at least 8 characters.");
  return bcrypt.hash(plaintext, 12);
}

export async function verifyPassword(plaintext: string, hash: string) {
  return bcrypt.compare(plaintext, hash);
}

import { SignJWT, jwtVerify } from "jose";
import type { Role, UserStatus } from "./constants";

export const SESSION_COOKIE_NAME = "woodshed_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, rolling

function secret() {
  const raw = process.env.SESSION_SECRET;
  if (!raw || raw.length < 24) {
    throw new Error("SESSION_SECRET is missing or too short. Set it in .env (at least 32 bytes of random data).");
  }
  return new TextEncoder().encode(raw);
}

export interface SessionPayload extends Record<string, unknown> {
  sub: string;
  role: Role;
  status: UserStatus;
  sid?: string;
}

export async function signSession(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    if (typeof payload.role !== "string") return null;
    if (typeof payload.status !== "string") return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

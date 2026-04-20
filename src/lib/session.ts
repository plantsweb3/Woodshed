import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles, sessions } from "@/db/schema";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, signSession, verifySession } from "./auth-edge";
import type { Role, UserStatus } from "./constants";
import { newId } from "./ids";
import { ipFromHeaders } from "./rate-limit";
import { shouldBeAlumni } from "./graduation";

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySession(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  if (session.sid) {
    const [s] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, session.sid), isNull(sessions.revokedAt)))
      .limit(1);
    if (!s) {
      await clearSessionCookie();
      return null;
    }
    // Update last_seen asynchronously — fire-and-forget is fine here.
    void db
      .update(sessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(sessions.id, session.sid))
      .execute()
      .catch(() => {});
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.sub)).limit(1);
  if (!user || user.status === "deleted_pending") return null;

  // Lazy alumni transition: flip on graduation date.
  if (
    user.status === "approved" &&
    user.role === "student" &&
    user.graduationYear &&
    shouldBeAlumni(user.graduationYear)
  ) {
    await db
      .update(users)
      .set({ status: "alumni", alumniSince: new Date() })
      .where(eq(users.id, user.id));
    user.status = "alumni";
    user.alumniSince = new Date();
  }

  return user;
}

export async function getCurrentUserWithProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  return { ...user, profile: profile ?? null };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}

export async function requireApprovedUser() {
  const user = await requireUser();
  if (user.status === "awaiting_parent_consent") redirect("/pending?state=parent");
  if (user.status === "pending") redirect("/pending");
  if (user.status === "inactive") redirect("/signin?inactive=1");
  if (user.status === "deleted_pending") redirect("/signin?deleted=1");
  if (user.status === "alumni" && !user.onboardingCompletedAt) redirect("/onboarding");
  if (user.status !== "alumni" && !user.onboardingCompletedAt) redirect("/onboarding");
  return user;
}

export async function requireApprovedOrAlumniNoOnboarding() {
  const user = await requireUser();
  if (user.status === "pending") redirect("/pending");
  if (user.status === "inactive") redirect("/signin?inactive=1");
  if (user.status === "awaiting_parent_consent") redirect("/pending?state=parent");
  return user;
}

export async function requireRole(allowed: Role[]) {
  const user = await requireApprovedUser();
  if (!allowed.includes(user.role)) redirect("/directory");
  return user;
}

export async function setSessionCookie(userId: string, role: Role, status: UserStatus): Promise<string> {
  const sid = newId();
  const h = await headers();
  const ua = h.get("user-agent") ?? null;
  const ip = ipFromHeaders(h);
  await db.insert(sessions).values({ id: sid, userId, userAgent: ua, ip });
  const token = await signSession({ sub: userId, role, status, sid });
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return sid;
}

export async function clearSessionCookie() {
  const session = await getSession();
  if (session?.sid) {
    await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, session.sid));
  }
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
}

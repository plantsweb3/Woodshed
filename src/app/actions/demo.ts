"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { setSessionCookie } from "@/lib/session";
import { DEMO_EMAIL } from "@/lib/demo";
import { logAudit } from "@/lib/audit";

export async function enterDemoMode() {
  const [user] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (!user) redirect("/signin?error=demo_unavailable");
  await setSessionCookie(user.id, user.role, user.status);
  await logAudit({ actorUserId: user.id, action: "demo_session_start" });
  redirect("/directory");
}

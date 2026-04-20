"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { count } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, profiles, inviteCodes } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { newId, newInviteCode } from "@/lib/ids";
import { ipFromHeaders } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { getOrCreatePreferences } from "@/lib/notifications";

const SetupSchema = z.object({
  firstName: z.string().trim().min(1).max(40),
  lastName: z.string().trim().min(1).max(40),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(12, "At least 12 characters for the director account").max(128),
  section: z.string().trim().min(1).max(60),
  primaryInstrument: z.string().trim().min(1).max(60),
});

export interface SetupState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function bootstrapDirector(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const [{ c: userCount }] = await db.select({ c: count() }).from(users);
  if (userCount > 0) return { error: "Setup has already run. Sign in as the director instead." };

  const parsed = SetupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const p = issue.path.join(".") || "_";
      if (!fieldErrors[p]) fieldErrors[p] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const h = await headers();
  const ip = ipFromHeaders(h);
  const id = newId();
  const passwordHash = await hashPassword(parsed.data.password);

  await db.insert(users).values({
    id,
    email: parsed.data.email,
    passwordHash,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    grade: 12,
    section: parsed.data.section,
    primaryInstrument: parsed.data.primaryInstrument,
    role: "director",
    status: "approved",
    approvedAt: new Date(),
    onboardingCompletedAt: new Date(),
  });
  await db.insert(profiles).values({ userId: id, bio: "Director of bands." });
  await getOrCreatePreferences(id);

  const code = newInviteCode();
  await db.insert(inviteCodes).values({ id: newId(), code, active: true, createdBy: id });

  await logAudit({
    actorUserId: id,
    action: "setup_bootstrap",
    targetType: "user",
    targetId: id,
    metadata: { ip, inviteCode: code },
  });

  await setSessionCookie(id, "director", "approved");
  redirect(`/admin?firstCode=${code}`);
}

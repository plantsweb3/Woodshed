"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { clearSessionCookie } from "@/lib/session";
import { buildUserExport } from "@/lib/data-export";
import { logAudit } from "@/lib/audit";

export async function exportMyData() {
  const user = await requireApprovedOrAlumniNoOnboarding();
  const data = await buildUserExport(user.id);
  await logAudit({ actorUserId: user.id, action: "data_export", targetType: "user", targetId: user.id });
  return JSON.stringify(data, null, 2);
}

export async function requestAccountDeletion() {
  const user = await requireApprovedOrAlumniNoOnboarding();
  await db
    .update(users)
    .set({ status: "deleted_pending", deletedAt: new Date() })
    .where(eq(users.id, user.id));
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.userId, user.id));
  await logAudit({ actorUserId: user.id, action: "account_delete_request", targetType: "user", targetId: user.id });
  await clearSessionCookie();
  redirect("/signin?deleted=1");
}

export async function cancelDeletion() {
  const user = await requireApprovedOrAlumniNoOnboarding();
  // This runs only if they sign back in during the grace period.
  await db
    .update(users)
    .set({ status: "approved", deletedAt: null })
    .where(eq(users.id, user.id));
  await logAudit({ actorUserId: user.id, action: "account_delete_cancel", targetType: "user", targetId: user.id });
  revalidatePath("/settings/data");
}

const VisibilitySchema = z.object({ visible: z.coerce.boolean() });

export async function setProfileVisibility(formData: FormData) {
  const user = await requireApprovedOrAlumniNoOnboarding();
  const parsed = VisibilitySchema.safeParse({ visible: formData.get("visible") === "on" });
  if (!parsed.success) return;
  await db.update(users).set({ profileVisible: parsed.data.visible }).where(eq(users.id, user.id));
  await logAudit({
    actorUserId: user.id,
    action: "profile_visibility_change",
    targetType: "user",
    targetId: user.id,
    metadata: { visible: parsed.data.visible },
  });
  revalidatePath("/settings/account");
  revalidatePath(`/directory/${user.id}`);
}

export async function revokeSession(formData: FormData) {
  const user = await requireApprovedOrAlumniNoOnboarding();
  const sid = z.string().min(1).parse(formData.get("sid"));
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sid));
  await logAudit({ actorUserId: user.id, action: "session_revoke", targetType: "session", targetId: sid });
  revalidatePath("/settings/sessions");
}

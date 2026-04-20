"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, profiles, inviteCodes, sessions } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import {
  canApproveMembers,
  canFeatureMembers,
  canPromoteDrumMajor,
  canPromoteSectionLeader,
  canRotateInviteCode,
} from "@/lib/permissions";
import { newId, newInviteCode } from "@/lib/ids";
import { ROLES, type Role } from "@/lib/constants";
import { onSignupApproved, onSignupRejected, onFeaturedAdded } from "@/lib/events";

export async function approveUser(formData: FormData) {
  const actor = await requireApprovedUser();
  if (!canApproveMembers(actor.role)) return;
  const id = z.string().min(1).parse(formData.get("id"));
  const result = await db
    .update(users)
    .set({ status: "approved", approvedAt: new Date(), approvedBy: actor.id })
    .where(and(eq(users.id, id), eq(users.status, "pending")))
    .returning({ id: users.id });
  if (result.length) {
    await logAudit({ actorUserId: actor.id, action: "member_approve", targetType: "user", targetId: id });
    await onSignupApproved(id, actor.id);
  }
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
  revalidatePath("/directory");
}

export async function rejectUser(formData: FormData) {
  const actor = await requireApprovedUser();
  if (!canApproveMembers(actor.role)) return;
  const id = z.string().min(1).parse(formData.get("id"));
  const [target] = await db.select().from(users).where(and(eq(users.id, id), eq(users.status, "pending"))).limit(1);
  if (!target) return;
  await db.delete(users).where(eq(users.id, id));
  await logAudit({ actorUserId: actor.id, action: "member_reject", targetType: "user", targetId: id });
  await onSignupRejected(target.email, target.firstName, actor.id);
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
}

export async function setUserRole(formData: FormData) {
  const actor = await requireApprovedUser();
  const id = z.string().min(1).parse(formData.get("id"));
  const nextRole = z.enum(ROLES).parse(formData.get("role"));

  if (id === actor.id) return; // no self-promotion ever
  if (nextRole === "director" && !canPromoteDrumMajor(actor.role)) return;
  if (nextRole === "drum_major" && !canPromoteDrumMajor(actor.role)) return;
  if (nextRole === "section_leader" && !canPromoteSectionLeader(actor.role)) return;
  if (nextRole === "student" && actor.role !== "director" && actor.role !== "drum_major") return;

  await db.update(users).set({ role: nextRole as Role }).where(eq(users.id, id));
  await logAudit({
    actorUserId: actor.id,
    action: "member_role_change",
    targetType: "user",
    targetId: id,
    metadata: { to: nextRole },
  });
  revalidatePath("/admin/members");
}

export async function deactivateUser(formData: FormData) {
  const actor = await requireApprovedUser();
  if (actor.role !== "director" && actor.role !== "drum_major") return;
  const id = z.string().min(1).parse(formData.get("id"));
  if (id === actor.id) return;
  await db.update(users).set({ status: "inactive" }).where(eq(users.id, id));
  // Revoke all their sessions so the deactivation takes effect immediately.
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.userId, id));
  await logAudit({ actorUserId: actor.id, action: "member_deactivate", targetType: "user", targetId: id });
  revalidatePath("/admin/members");
}

export async function reactivateUser(formData: FormData) {
  const actor = await requireApprovedUser();
  if (actor.role !== "director" && actor.role !== "drum_major") return;
  const id = z.string().min(1).parse(formData.get("id"));
  await db.update(users).set({ status: "approved" }).where(eq(users.id, id));
  await logAudit({ actorUserId: actor.id, action: "member_reactivate", targetType: "user", targetId: id });
  revalidatePath("/admin/members");
}

export async function forceSignOutUser(formData: FormData) {
  const actor = await requireApprovedUser();
  if (actor.role !== "director") return;
  const id = z.string().min(1).parse(formData.get("id"));
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.userId, id));
  await logAudit({ actorUserId: actor.id, action: "member_force_signout", targetType: "user", targetId: id });
  revalidatePath("/admin/members");
}

export async function toggleFeatured(formData: FormData) {
  const actor = await requireApprovedUser();
  if (!canFeatureMembers(actor.role)) return;
  const id = z.string().min(1).parse(formData.get("id"));
  const [p] = await db.select().from(profiles).where(eq(profiles.userId, id)).limit(1);
  if (!p) return;
  const nextFeatured = !p.featured;
  await db.update(profiles).set({ featured: nextFeatured }).where(eq(profiles.userId, id));
  await logAudit({
    actorUserId: actor.id,
    action: nextFeatured ? "feature_add" : "feature_remove",
    targetType: "profile",
    targetId: id,
  });
  if (nextFeatured) await onFeaturedAdded(id, actor.id);
  revalidatePath("/directory");
  revalidatePath("/admin/featured");
}

export async function rotateInviteCode() {
  const actor = await requireApprovedUser();
  if (!canRotateInviteCode(actor.role)) return;
  await db.update(inviteCodes).set({ active: false, rotatedAt: new Date() }).where(eq(inviteCodes.active, true));
  const code = newInviteCode();
  await db.insert(inviteCodes).values({ id: newId(), code, active: true, createdBy: actor.id });
  await logAudit({ actorUserId: actor.id, action: "invite_code_rotate", metadata: { code } });
  revalidatePath("/admin/settings");
  return { code };
}

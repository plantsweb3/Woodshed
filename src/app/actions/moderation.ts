"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { reports, users, sessions } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { hideContent, unhideContent } from "@/lib/reports";
import { logAudit } from "@/lib/audit";

async function getReport(id: string) {
  const [r] = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return r ?? null;
}

export async function dismissReport(formData: FormData) {
  const actor = await requireRole(["drum_major", "director"]);
  const id = z.string().min(1).parse(formData.get("id"));
  const report = await getReport(id);
  if (!report) return;
  await db
    .update(reports)
    .set({ status: "dismissed", resolution: "dismissed", resolvedAt: new Date(), resolvedBy: actor.id })
    .where(eq(reports.id, id));
  await logAudit({ actorUserId: actor.id, action: "report_dismiss", targetType: "report", targetId: id });
  revalidatePath("/admin/moderation");
}

export async function hideReportedContent(formData: FormData) {
  const actor = await requireRole(["drum_major", "director"]);
  const id = z.string().min(1).parse(formData.get("id"));
  const report = await getReport(id);
  if (!report) return;
  if (report.targetType !== "profile" && report.targetType !== "mentor_request") return;
  await hideContent({ type: report.targetType, id: report.targetId });
  await db
    .update(reports)
    .set({ status: "actioned", resolution: "content_hidden", resolvedAt: new Date(), resolvedBy: actor.id })
    .where(eq(reports.id, id));
  await logAudit({
    actorUserId: actor.id,
    action: "report_hide_content",
    targetType: report.targetType,
    targetId: report.targetId,
    metadata: { reportId: id },
  });
  revalidatePath("/admin/moderation");
  revalidatePath("/directory");
  revalidatePath("/mentorship");
}

export async function unhideReportedContent(formData: FormData) {
  const actor = await requireRole(["director"]);
  const id = z.string().min(1).parse(formData.get("id"));
  const report = await getReport(id);
  if (!report) return;
  if (report.targetType !== "profile" && report.targetType !== "mentor_request") return;
  await unhideContent({ type: report.targetType, id: report.targetId });
  await logAudit({
    actorUserId: actor.id,
    action: "report_unhide_content",
    targetType: report.targetType,
    targetId: report.targetId,
    metadata: { reportId: id },
  });
  revalidatePath("/admin/moderation");
  revalidatePath("/directory");
  revalidatePath("/mentorship");
}

export async function escalateReport(formData: FormData) {
  const actor = await requireRole(["drum_major"]);
  const id = z.string().min(1).parse(formData.get("id"));
  await db
    .update(reports)
    .set({ status: "escalated", resolution: "escalated_to_director" })
    .where(and(eq(reports.id, id), eq(reports.status, "open")));
  await logAudit({ actorUserId: actor.id, action: "report_escalate", targetType: "report", targetId: id });
  revalidatePath("/admin/moderation");
}

export async function suspendReportedUser(formData: FormData) {
  const actor = await requireRole(["director"]);
  const id = z.string().min(1).parse(formData.get("id"));
  const report = await getReport(id);
  if (!report?.targetUserId) return;
  await db.update(users).set({ status: "inactive" }).where(eq(users.id, report.targetUserId));
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.userId, report.targetUserId));
  await db
    .update(reports)
    .set({ status: "actioned", resolution: "user_suspended", resolvedAt: new Date(), resolvedBy: actor.id })
    .where(eq(reports.id, id));
  await logAudit({
    actorUserId: actor.id,
    action: "report_suspend_user",
    targetType: "user",
    targetId: report.targetUserId,
    metadata: { reportId: id },
  });
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/members");
}

export async function deleteReportedUser(formData: FormData) {
  const actor = await requireRole(["director"]);
  const id = z.string().min(1).parse(formData.get("id"));
  const report = await getReport(id);
  if (!report?.targetUserId) return;
  await db.delete(users).where(eq(users.id, report.targetUserId));
  await db
    .update(reports)
    .set({ status: "actioned", resolution: "user_deleted", resolvedAt: new Date(), resolvedBy: actor.id })
    .where(eq(reports.id, id));
  await logAudit({
    actorUserId: actor.id,
    action: "report_delete_user",
    targetType: "user",
    targetId: report.targetUserId,
    metadata: { reportId: id },
  });
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/members");
}

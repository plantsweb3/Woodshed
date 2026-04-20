"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { insertReport, loadReportContent } from "@/lib/reports";
import { zeroTolerance } from "@/lib/moderation";
import { onZeroToleranceReport } from "@/lib/events";
import { logAudit } from "@/lib/audit";

const Schema = z.object({
  targetType: z.enum(["profile", "mentor_request", "user"]),
  targetId: z.string().min(1),
  reason: z.enum(["harassment", "inappropriate", "spam", "other"]),
  description: z.string().trim().max(1000).optional(),
});

export interface ReportFormState {
  ok?: boolean;
  error?: string;
}

export async function submitReport(_prev: ReportFormState, formData: FormData): Promise<ReportFormState> {
  const user = await requireApprovedOrAlumniNoOnboarding();
  const parsed = Schema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    reason: formData.get("reason") || "other",
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Couldn't submit report." };

  const content = await loadReportContent(parsed.data.targetType, parsed.data.targetId);
  if (!content) return { error: "That content isn't reportable." };

  // Auto-classify into zero-tolerance if content matches heavy categories.
  const zt = zeroTolerance(content.text ?? "") ?? zeroTolerance(parsed.data.description ?? "");
  const { id: reportId } = await insertReport({
    reporterId: user.id,
    targetType: parsed.data.targetType,
    targetId: parsed.data.targetId,
    targetUserId: content.userId,
    reason: zt ?? parsed.data.reason,
    description: parsed.data.description,
    zeroTolerance: !!zt,
  });

  if (zt) {
    await onZeroToleranceReport({
      reportId,
      reason: zt,
      targetUserName: "unknown",
      reporterName: `${user.firstName} ${user.lastName}`,
      excerpt: (content.text ?? "").slice(0, 400),
    });
  }

  await logAudit({
    actorUserId: user.id,
    action: "report_submit",
    targetType: parsed.data.targetType,
    targetId: parsed.data.targetId,
    metadata: { reason: parsed.data.reason, zeroTolerance: !!zt },
  });
  revalidatePath("/admin/moderation");
  return { ok: true };
}

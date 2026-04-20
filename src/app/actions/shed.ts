"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { practiceLogs } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { newId } from "@/lib/ids";
import { logAudit } from "@/lib/audit";
import { PRACTICE_VISIBILITY } from "@/lib/constants";
import { checkShedMilestones, checkStreakMilestones } from "@/lib/milestones";
import { computeStreak } from "@/lib/sheds";
import { captureServerEvent } from "@/lib/telemetry";

const ShedSchema = z.object({
  durationMinutes: z.coerce.number().int().min(1, "How long?").max(600, "600 minutes is the max per shed."),
  workedOn: z.string().trim().min(1, "What did you work on?").max(240),
  notes: z.string().trim().max(600).optional().transform((v) => (v ? v : null)),
  visibility: z.enum(PRACTICE_VISIBILITY).default("private"),
  date: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : new Date()))
    .refine((d) => !Number.isNaN(d.getTime()), "Invalid date"),
});

export interface ShedFormState {
  ok?: boolean;
  error?: string;
}

export async function logShed(_prev: ShedFormState, formData: FormData): Promise<ShedFormState> {
  const user = await requireApprovedUser();
  const parsed = ShedSchema.safeParse({
    durationMinutes: formData.get("durationMinutes"),
    workedOn: formData.get("workedOn"),
    notes: formData.get("notes"),
    visibility: formData.get("visibility") || "private",
    date: formData.get("date") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Fix the errors and try again." };

  const id = newId();
  await db.insert(practiceLogs).values({
    id,
    userId: user.id,
    date: parsed.data.date,
    durationMinutes: parsed.data.durationMinutes,
    workedOn: parsed.data.workedOn,
    notes: parsed.data.notes,
    visibility: parsed.data.visibility,
  });
  await logAudit({
    actorUserId: user.id,
    action: "shed_log",
    targetType: "practice_log",
    targetId: id,
    metadata: { minutes: parsed.data.durationMinutes, visibility: parsed.data.visibility },
  });
  await checkShedMilestones(user.id);
  const streak = await computeStreak(user.id);
  await checkStreakMilestones(user.id, streak);

  await captureServerEvent({
    distinctId: user.id,
    event: "shed_logged",
    properties: { minutes: parsed.data.durationMinutes, visibility: parsed.data.visibility },
  });

  revalidatePath("/shed");
  revalidatePath("/profile");
  return { ok: true };
}

export async function deleteShed(formData: FormData) {
  const user = await requireApprovedUser();
  const id = z.string().min(1).parse(formData.get("id"));
  await db.delete(practiceLogs).where(eq(practiceLogs.id, id));
  await logAudit({ actorUserId: user.id, action: "shed_delete", targetType: "practice_log", targetId: id });
  revalidatePath("/shed");
}

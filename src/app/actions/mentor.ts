"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { mentorRequests, users } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { newId } from "@/lib/ids";
import { logAudit } from "@/lib/audit";
import { MENTOR_URGENCY } from "@/lib/constants";
import { scan, zeroTolerance } from "@/lib/moderation";
import { onMentorRequestCreated, onMentorRequestClaimed, onZeroToleranceReport } from "@/lib/events";
import { awardMilestone } from "@/lib/milestones";

const MAX_OPEN_PER_USER = 5;

const CreateSchema = z.object({
  targetId: z.string().optional().transform((v) => (v ? v : null)),
  skill: z.string().trim().min(1, "Pick a skill").max(60),
  description: z.string().trim().min(1, "Describe what you need help with").max(800),
  urgency: z.enum(MENTOR_URGENCY).default("casual"),
});

export interface MentorFormState {
  error?: string;
}

export async function createMentorRequest(_prev: MentorFormState, formData: FormData): Promise<MentorFormState> {
  const user = await requireApprovedUser();
  const parsed = CreateSchema.safeParse({
    targetId: formData.get("targetId") || undefined,
    skill: formData.get("skill"),
    description: formData.get("description"),
    urgency: formData.get("urgency") || "casual",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { targetId, skill, description, urgency } = parsed.data;

  // Rate limit: max 5 open requests per user at a time.
  const [{ c }] = await db
    .select({ c: count() })
    .from(mentorRequests)
    .where(and(eq(mentorRequests.requesterId, user.id), eq(mentorRequests.status, "open")));
  if (c >= MAX_OPEN_PER_USER) {
    return { error: `You already have ${c} open requests. Close one before posting another.` };
  }

  if (targetId) {
    const [target] = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
    if (!target || target.status !== "approved") return { error: "That mentor isn't available." };
  }

  const zt = zeroTolerance(description) ?? zeroTolerance(skill);
  const id = newId();
  await db.insert(mentorRequests).values({
    id,
    requesterId: user.id,
    targetId,
    skill,
    description,
    urgency,
    status: "open",
    hiddenAt: zt ? new Date() : null,
  });

  const profanity = scan(description);
  const shouldQueue = profanity.flagged || !!zt;
  if (shouldQueue) {
    const { insertReport } = await import("@/lib/reports");
    const reporterName = null;
    const excerpt = description.slice(0, 400);
    const report = await insertReport({
      reporterId: null,
      targetType: "mentor_request",
      targetId: id,
      targetUserId: user.id,
      reason: zt ?? "other",
      description: "Auto-flagged on submission.",
      zeroTolerance: !!zt,
    });
    if (zt) {
      await onZeroToleranceReport({
        reportId: report.id,
        reason: zt,
        targetUserName: `${user.firstName} ${user.lastName}`,
        reporterName,
        excerpt,
      });
    }
  }

  await logAudit({
    actorUserId: user.id,
    action: "mentor_request_create",
    targetType: "mentor_request",
    targetId: id,
    metadata: { targetId, skill, urgency, autoFlagged: shouldQueue, zeroTolerance: !!zt },
  });
  await awardMilestone(user.id, {
    type: "first_open_request",
    dedupeKey: "first_open_request",
    title: "Posted your first open mentor request",
  });
  await onMentorRequestCreated(id, user.id, skill, urgency, description, targetId ?? null);

  revalidatePath("/mentorship");
  redirect("/mentorship");
}

export async function claimMentorRequest(formData: FormData) {
  const user = await requireApprovedUser();
  if (user.status === "alumni") return; // Alumni can't claim
  const id = z.string().min(1).parse(formData.get("id"));

  const [req] = await db.select().from(mentorRequests).where(eq(mentorRequests.id, id)).limit(1);
  if (!req) return;
  if (req.status !== "open") return;
  if (req.hiddenAt) return;
  if (req.requesterId === user.id) return;

  await db
    .update(mentorRequests)
    .set({ status: "claimed", claimedBy: user.id, claimedAt: new Date() })
    .where(and(eq(mentorRequests.id, id), eq(mentorRequests.status, "open")));
  await logAudit({ actorUserId: user.id, action: "mentor_request_claim", targetType: "mentor_request", targetId: id });
  await onMentorRequestClaimed(id, req.requesterId, user.id, req.skill);

  revalidatePath("/mentorship");
}

export async function closeMentorRequest(formData: FormData) {
  const user = await requireApprovedUser();
  const id = z.string().min(1).parse(formData.get("id"));
  const [req] = await db.select().from(mentorRequests).where(eq(mentorRequests.id, id)).limit(1);
  if (!req) return;
  const isOwnerOrMentor = req.requesterId === user.id || req.claimedBy === user.id;
  const isAdmin = user.role === "drum_major" || user.role === "director";
  if (!isOwnerOrMentor && !isAdmin) return;

  await db.update(mentorRequests).set({ status: "closed" }).where(eq(mentorRequests.id, id));
  await logAudit({ actorUserId: user.id, action: "mentor_request_close", targetType: "mentor_request", targetId: id });
  revalidatePath("/mentorship");
}

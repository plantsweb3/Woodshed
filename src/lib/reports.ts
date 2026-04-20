import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reports, mentorRequests, profiles, users } from "@/db/schema";
import { newId } from "./ids";
import type { ZeroToleranceCategory } from "./moderation";

export interface InsertReportInput {
  reporterId: string | null;
  targetType: "profile" | "mentor_request" | "user";
  targetId: string;
  targetUserId: string | null;
  reason: "harassment" | "inappropriate" | "spam" | "other" | ZeroToleranceCategory;
  description?: string | null;
  zeroTolerance?: boolean;
}

export async function insertReport(input: InsertReportInput) {
  const id = newId();
  await db.insert(reports).values({
    id,
    reporterId: input.reporterId,
    targetType: input.targetType,
    targetId: input.targetId,
    targetUserId: input.targetUserId,
    reason: input.reason,
    description: input.description ?? null,
    zeroTolerance: !!input.zeroTolerance,
    status: input.zeroTolerance ? "escalated" : "open",
  });
  return { id };
}

export async function hideContent(target: { type: "profile" | "mentor_request"; id: string }) {
  const now = new Date();
  if (target.type === "mentor_request") {
    await db.update(mentorRequests).set({ hiddenAt: now }).where(eq(mentorRequests.id, target.id));
  } else if (target.type === "profile") {
    await db.update(profiles).set({ hiddenAt: now, bio: null }).where(eq(profiles.userId, target.id));
  }
}

export async function unhideContent(target: { type: "profile" | "mentor_request"; id: string }) {
  if (target.type === "mentor_request") {
    await db.update(mentorRequests).set({ hiddenAt: null }).where(eq(mentorRequests.id, target.id));
  } else if (target.type === "profile") {
    await db.update(profiles).set({ hiddenAt: null }).where(eq(profiles.userId, target.id));
  }
}

export async function loadReportContent(targetType: string, targetId: string) {
  if (targetType === "mentor_request") {
    const [row] = await db
      .select({
        id: mentorRequests.id,
        text: mentorRequests.description,
        skill: mentorRequests.skill,
        userId: mentorRequests.requesterId,
      })
      .from(mentorRequests)
      .where(eq(mentorRequests.id, targetId))
      .limit(1);
    return row;
  }
  if (targetType === "profile") {
    const [row] = await db
      .select({ id: profiles.userId, text: profiles.bio, userId: profiles.userId })
      .from(profiles)
      .where(eq(profiles.userId, targetId))
      .limit(1);
    return row;
  }
  if (targetType === "user") {
    const [row] = await db.select({ id: users.id, text: users.firstName, userId: users.id }).from(users).where(eq(users.id, targetId)).limit(1);
    return row;
  }
  return null;
}

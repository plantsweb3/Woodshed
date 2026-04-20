import { and, asc, eq, sum } from "drizzle-orm";
import { db } from "@/db";
import { milestones, practiceLogs } from "@/db/schema";
import { newId } from "./ids";

export interface AwardInput {
  type: string;
  dedupeKey: string;
  title: string;
}

export async function awardMilestone(userId: string, input: AwardInput) {
  try {
    await db.insert(milestones).values({
      id: newId(),
      userId,
      type: input.type,
      dedupeKey: input.dedupeKey,
      title: input.title,
    });
    return true;
  } catch {
    // Unique constraint on (userId, dedupeKey) — already awarded.
    return false;
  }
}

export async function listForUser(userId: string) {
  return db.select().from(milestones).where(eq(milestones.userId, userId)).orderBy(asc(milestones.earnedAt));
}

/*
 * Shed-based milestone checks — called after each practice log insert.
 */

const HOUR_THRESHOLDS = [10, 25, 100, 250, 500, 1000];

export async function checkShedMilestones(userId: string) {
  // Total minutes for this user ever.
  const [totalRow] = await db
    .select({ total: sum(practiceLogs.durationMinutes) })
    .from(practiceLogs)
    .where(eq(practiceLogs.userId, userId));
  const totalMinutes = Number(totalRow?.total ?? 0);
  const totalHours = Math.floor(totalMinutes / 60);

  const awarded: string[] = [];
  // First shed
  const first = await awardMilestone(userId, {
    type: "shed_first",
    dedupeKey: "shed_first",
    title: "First shed logged — welcome to the woodshed.",
  });
  if (first) awarded.push("shed_first");
  for (const h of HOUR_THRESHOLDS) {
    if (totalHours >= h) {
      const ok = await awardMilestone(userId, {
        type: `shed_hours_${h}`,
        dedupeKey: `shed_hours_${h}`,
        title: `Shed ${h} hours lifetime`,
      });
      if (ok) awarded.push(`shed_hours_${h}`);
    }
  }
  return awarded;
}

const STREAK_MILESTONES = [7, 14, 30, 60, 90];

export async function checkStreakMilestones(userId: string, currentStreak: number) {
  const awarded: string[] = [];
  for (const m of STREAK_MILESTONES) {
    if (currentStreak >= m) {
      const ok = await awardMilestone(userId, {
        type: `streak_${m}`,
        dedupeKey: `streak_${m}`,
        title: `Reached ${m}-day shed streak`,
      });
      if (ok) awarded.push(`streak_${m}`);
    }
  }
  return awarded;
}

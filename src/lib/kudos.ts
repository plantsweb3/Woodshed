import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { kudos, milestones } from "@/db/schema";

export type KudosTargetType = "profile" | "milestone" | "shoutout";

export async function countFor(targetType: KudosTargetType, targetId: string) {
  const [row] = await db
    .select({ c: count() })
    .from(kudos)
    .where(and(eq(kudos.targetType, targetType), eq(kudos.targetId, targetId)));
  return row?.c ?? 0;
}

export async function hasGiven(fromUserId: string, targetType: KudosTargetType, targetId: string) {
  const [row] = await db
    .select({ id: kudos.id })
    .from(kudos)
    .where(
      and(
        eq(kudos.fromUserId, fromUserId),
        eq(kudos.targetType, targetType),
        eq(kudos.targetId, targetId)
      )
    )
    .limit(1);
  return !!row;
}

/** Returns a {targetId -> {count, mine}} map for a list of targets. */
export async function summarize(
  targetType: KudosTargetType,
  targetIds: string[],
  viewerId: string | null
) {
  if (targetIds.length === 0) return new Map<string, { count: number; mine: boolean }>();
  const rows = await db
    .select({ targetId: kudos.targetId, fromUserId: kudos.fromUserId })
    .from(kudos)
    .where(and(eq(kudos.targetType, targetType), inArray(kudos.targetId, targetIds)));
  const map = new Map<string, { count: number; mine: boolean }>();
  for (const id of targetIds) map.set(id, { count: 0, mine: false });
  for (const r of rows) {
    const entry = map.get(r.targetId)!;
    entry.count += 1;
    if (viewerId && r.fromUserId === viewerId) entry.mine = true;
  }
  return map;
}

export async function resolveMilestoneRecipient(milestoneId: string) {
  const [m] = await db.select({ userId: milestones.userId }).from(milestones).where(eq(milestones.id, milestoneId)).limit(1);
  return m?.userId ?? null;
}

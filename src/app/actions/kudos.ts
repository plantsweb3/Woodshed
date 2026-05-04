"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { kudos, users, shoutouts } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { newId } from "@/lib/ids";
import { resolveMilestoneRecipient } from "@/lib/kudos";

const ToggleSchema = z.object({
  targetType: z.enum(["profile", "milestone", "shoutout"]),
  targetId: z.string().min(1).max(120),
});

export interface KudosResult {
  given: boolean;
  count: number;
}

async function getRecipient(
  targetType: "profile" | "milestone" | "shoutout",
  targetId: string
): Promise<string | null> {
  if (targetType === "profile") {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.id, targetId)).limit(1);
    return u?.id ?? null;
  }
  if (targetType === "milestone") {
    return await resolveMilestoneRecipient(targetId);
  }
  // shoutout
  const [s] = await db.select({ authorId: shoutouts.authorId }).from(shoutouts).where(eq(shoutouts.id, targetId)).limit(1);
  return s?.authorId ?? null;
}

export async function toggleKudos(input: { targetType: "profile" | "milestone" | "shoutout"; targetId: string }): Promise<KudosResult> {
  const actor = await requireApprovedUser();
  const parsed = ToggleSchema.parse(input);

  const recipient = await getRecipient(parsed.targetType, parsed.targetId);
  if (!recipient) return { given: false, count: 0 };
  if (recipient === actor.id) {
    return { given: false, count: await totalCount(parsed.targetType, parsed.targetId) };
  }

  const [existing] = await db
    .select({ id: kudos.id })
    .from(kudos)
    .where(
      and(
        eq(kudos.fromUserId, actor.id),
        eq(kudos.targetType, parsed.targetType),
        eq(kudos.targetId, parsed.targetId)
      )
    )
    .limit(1);

  if (existing) {
    await db.delete(kudos).where(eq(kudos.id, existing.id));
  } else {
    await db.insert(kudos).values({
      id: newId(),
      fromUserId: actor.id,
      targetType: parsed.targetType,
      targetId: parsed.targetId,
      recipientUserId: recipient,
    });
  }

  const count = await totalCount(parsed.targetType, parsed.targetId);

  if (parsed.targetType === "profile") revalidatePath(`/directory/${parsed.targetId}`);
  if (parsed.targetType === "shoutout") revalidatePath("/shoutouts");
  revalidatePath("/profile");

  return { given: !existing, count };
}

async function totalCount(targetType: "profile" | "milestone" | "shoutout", targetId: string) {
  const rows = await db
    .select({ id: kudos.id })
    .from(kudos)
    .where(and(eq(kudos.targetType, targetType), eq(kudos.targetId, targetId)));
  return rows.length;
}

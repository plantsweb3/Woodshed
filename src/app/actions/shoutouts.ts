"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { shoutouts } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { newId } from "@/lib/ids";
import { logAudit } from "@/lib/audit";
import { scan, zeroTolerance } from "@/lib/moderation";
import { insertReport } from "@/lib/reports";
import { onZeroToleranceReport } from "@/lib/events";

const KINDS = ["summer_program", "audition", "lesson", "honor", "performance", "camp", "other"] as const;

const PostSchema = z.object({
  kind: z.enum(KINDS).default("other"),
  title: z.string().trim().min(1, "Give it a title.").max(120),
  body: z.string().trim().max(800).optional().transform((v) => (v ? v : null)),
});

export interface ShoutoutFormState {
  ok?: boolean;
  error?: string;
}

export async function postShoutout(_prev: ShoutoutFormState, formData: FormData): Promise<ShoutoutFormState> {
  const user = await requireApprovedUser();
  const parsed = PostSchema.safeParse({
    kind: formData.get("kind") || "other",
    title: formData.get("title"),
    body: formData.get("body") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Couldn't post." };

  const id = newId();
  const text = `${parsed.data.title}\n${parsed.data.body ?? ""}`;
  const zt = zeroTolerance(text);
  const profanity = scan(text);

  await db.insert(shoutouts).values({
    id,
    authorId: user.id,
    kind: parsed.data.kind,
    title: parsed.data.title,
    body: parsed.data.body,
    hiddenAt: zt ? new Date() : null,
  });

  if (zt || profanity.flagged) {
    const report = await insertReport({
      reporterId: null,
      targetType: "user",
      targetId: id,
      targetUserId: user.id,
      reason: zt ?? "other",
      description: "Auto-flagged shoutout submission.",
      zeroTolerance: !!zt,
    });
    if (zt) {
      await onZeroToleranceReport({
        reportId: report.id,
        reason: zt,
        targetUserName: `${user.firstName} ${user.lastName}`,
        reporterName: null,
        excerpt: text.slice(0, 400),
      });
    }
  }

  await logAudit({
    actorUserId: user.id,
    action: "shoutout_post",
    targetType: "shoutout",
    targetId: id,
    metadata: { kind: parsed.data.kind, autoFlagged: !!zt || profanity.flagged },
  });

  revalidatePath("/shoutouts");
  return { ok: true };
}

export async function deleteShoutout(formData: FormData) {
  const user = await requireApprovedUser();
  const id = z.string().min(1).parse(formData.get("id"));
  const [row] = await db.select().from(shoutouts).where(eq(shoutouts.id, id)).limit(1);
  if (!row) return;
  const isAuthor = row.authorId === user.id;
  const isAdmin = user.role === "drum_major" || user.role === "director";
  if (!isAuthor && !isAdmin) return;
  await db.delete(shoutouts).where(eq(shoutouts.id, id));
  await logAudit({ actorUserId: user.id, action: "shoutout_delete", targetType: "shoutout", targetId: id });
  revalidatePath("/shoutouts");
}

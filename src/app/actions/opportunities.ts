"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { newId } from "@/lib/ids";
import { logAudit } from "@/lib/audit";
import { canPostOpportunity } from "@/lib/permissions";
import { OPPORTUNITY_TYPES } from "@/lib/constants";

const PostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(140),
  description: z.string().trim().min(1).max(2000),
  opportunityType: z.enum(OPPORTUNITY_TYPES),
  link: z
    .string()
    .trim()
    .url("Must be a URL (students need somewhere to click)")
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  deadline: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? new Date(v) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), "Invalid date"),
  sections: z.array(z.string()).default([]),
  instruments: z.array(z.string()).default([]),
});

export interface OpportunityFormState {
  error?: string;
}

function parseMulti(fd: FormData, key: string) {
  return fd.getAll(key).map((v) => String(v)).filter(Boolean);
}

export async function createOpportunity(_prev: OpportunityFormState, formData: FormData): Promise<OpportunityFormState> {
  const user = await requireApprovedUser();
  if (!canPostOpportunity(user.role)) return { error: "Only section leaders and up can post." };

  const parsed = PostSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    opportunityType: formData.get("opportunityType"),
    link: formData.get("link") || undefined,
    deadline: formData.get("deadline") || undefined,
    sections: parseMulti(formData, "sections"),
    instruments: parseMulti(formData, "instruments"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const id = newId();
  await db.insert(opportunities).values({
    id,
    title: parsed.data.title,
    description: parsed.data.description,
    opportunityType: parsed.data.opportunityType,
    link: parsed.data.link,
    deadlineDate: parsed.data.deadline ?? null,
    sections: parsed.data.sections,
    instruments: parsed.data.instruments,
    postedBy: user.id,
  });
  await logAudit({
    actorUserId: user.id,
    action: "opportunity_create",
    targetType: "opportunity",
    targetId: id,
    metadata: { title: parsed.data.title },
  });
  revalidatePath("/opportunities");
  revalidatePath("/admin/opportunities");
  redirect("/admin/opportunities");
}

export async function deleteOpportunity(formData: FormData) {
  const user = await requireApprovedUser();
  if (user.role !== "drum_major" && user.role !== "director") return;
  const id = z.string().min(1).parse(formData.get("id"));
  await db.delete(opportunities).where(eq(opportunities.id, id));
  await logAudit({ actorUserId: user.id, action: "opportunity_delete", targetType: "opportunity", targetId: id });
  revalidatePath("/opportunities");
  revalidatePath("/admin/opportunities");
}

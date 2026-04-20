"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { notificationPreferences } from "@/db/schema";
import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { markAllRead, markRead, getOrCreatePreferences } from "@/lib/notifications";

export async function markNotificationsRead(ids?: string[]) {
  const user = await requireApprovedOrAlumniNoOnboarding();
  if (ids && ids.length) await markRead(user.id, ids);
  else await markAllRead(user.id);
  revalidatePath("/");
}

const PrefSchema = z.object({
  emailMentorRequestDirect: z.coerce.boolean().optional().default(false),
  emailMentorOfferAccepted: z.coerce.boolean().optional().default(false),
  emailSignupApproved: z.coerce.boolean().optional().default(false),
  emailSignupRejected: z.coerce.boolean().optional().default(false),
  emailZeroTolerance: z.coerce.boolean().optional().default(false),
});

export interface PrefsFormState {
  ok?: boolean;
  error?: string;
}

export async function saveNotificationPreferences(_prev: PrefsFormState, formData: FormData): Promise<PrefsFormState> {
  const user = await requireApprovedOrAlumniNoOnboarding();
  await getOrCreatePreferences(user.id);
  const parsed = PrefSchema.safeParse({
    emailMentorRequestDirect: formData.get("emailMentorRequestDirect") === "on",
    emailMentorOfferAccepted: formData.get("emailMentorOfferAccepted") === "on",
    emailSignupApproved: formData.get("emailSignupApproved") === "on",
    emailSignupRejected: formData.get("emailSignupRejected") === "on",
    emailZeroTolerance: formData.get("emailZeroTolerance") === "on",
  });
  if (!parsed.success) return { error: "Couldn't save preferences." };
  await db
    .update(notificationPreferences)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(notificationPreferences.userId, user.id));
  revalidatePath("/settings/notifications");
  return { ok: true };
}

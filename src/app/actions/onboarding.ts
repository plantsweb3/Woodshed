"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { onOnboardingCompleted } from "@/lib/events";
import { scan, zeroTolerance } from "@/lib/moderation";
import { insertReport } from "@/lib/reports";
import { onZeroToleranceReport } from "@/lib/events";

const EnsembleSchema = z.object({
  name: z.string().trim().min(1).max(80),
  startYear: z.coerce.number().int().min(1990).max(2100).nullable().optional().catch(null),
  notes: z.string().trim().max(240).nullable().optional().catch(null),
});
const LessonSchema = z.object({
  teacher: z.string().trim().min(1).max(80),
  focus: z.string().trim().max(120).nullable().optional().catch(null),
});
const AchievementSchema = z.object({
  title: z.string().trim().min(1).max(120),
  year: z.coerce.number().int().min(1990).max(2100).nullable().optional().catch(null),
  detail: z.string().trim().max(240).nullable().optional().catch(null),
});

const OnboardingSchema = z.object({
  bio: z.string().trim().max(1200).optional().transform((v) => (v ? v : null)),
  mentorAvailable: z.coerce.boolean().optional().default(false),
  mentorSkills: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  outsideEnsembles: z.array(EnsembleSchema).max(15).default([]),
  privateLessons: z.array(LessonSchema).max(10).default([]),
  achievements: z.array(AchievementSchema).max(25).default([]),
});

export interface OnboardingFormState {
  error?: string;
  ok?: boolean;
}

export async function completeOnboarding(_prev: OnboardingFormState, formData: FormData): Promise<OnboardingFormState> {
  const user = await requireApprovedOrAlumniNoOnboarding();

  const raw = {
    bio: formData.get("bio") ?? "",
    mentorAvailable: formData.get("mentorAvailable") === "on",
    mentorSkills: JSON.parse((formData.get("mentorSkills") as string) || "[]"),
    outsideEnsembles: JSON.parse((formData.get("outsideEnsembles") as string) || "[]"),
    privateLessons: JSON.parse((formData.get("privateLessons") as string) || "[]"),
    achievements: JSON.parse((formData.get("achievements") as string) || "[]"),
  };

  const parsed = OnboardingSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Couldn't save, fix the highlighted fields." };
  const p = parsed.data;

  // Moderation scan on the bio. Auto-queue or escalate if flagged.
  let hidden: Date | null = null;
  if (p.bio) {
    const zt = zeroTolerance(p.bio);
    const prof = scan(p.bio);
    if (zt || prof.flagged) {
      const report = await insertReport({
        reporterId: null,
        targetType: "profile",
        targetId: user.id,
        targetUserId: user.id,
        reason: zt ?? "other",
        description: "Auto-flagged on submission.",
        zeroTolerance: !!zt,
      });
      if (zt) {
        hidden = new Date();
        await onZeroToleranceReport({
          reportId: report.id,
          reason: zt,
          targetUserName: `${user.firstName} ${user.lastName}`,
          reporterName: null,
          excerpt: p.bio.slice(0, 400),
        });
      }
    }
  }

  await db
    .update(profiles)
    .set({
      bio: p.bio,
      mentorAvailable: p.mentorAvailable,
      mentorSkills: p.mentorSkills,
      outsideEnsembles: p.outsideEnsembles.map((e) => ({
        name: e.name,
        startYear: e.startYear ?? null,
        notes: e.notes ?? null,
      })),
      privateLessons: p.privateLessons.map((l) => ({ teacher: l.teacher, focus: l.focus ?? null })),
      achievements: p.achievements.map((a) => ({
        title: a.title,
        year: a.year ?? null,
        detail: a.detail ?? null,
      })),
      hiddenAt: hidden,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, user.id));

  await db.update(users).set({ onboardingCompletedAt: new Date() }).where(eq(users.id, user.id));
  await onOnboardingCompleted(user.id);

  revalidatePath("/profile");
  revalidatePath("/directory");
  revalidatePath(`/directory/${user.id}`);
  return { ok: true };
}

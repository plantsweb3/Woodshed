"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";

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

const ProfileSchema = z.object({
  bio: z.string().trim().max(1200).optional().transform((v) => (v ? v : null)),
  mentorAvailable: z.coerce.boolean().optional().default(false),
  mentorSkills: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  outsideEnsembles: z.array(EnsembleSchema).max(15).default([]),
  privateLessons: z.array(LessonSchema).max(10).default([]),
  achievements: z.array(AchievementSchema).max(25).default([]),
  workingOn: z
    .string()
    .trim()
    .max(140, "Keep this under 140 characters.")
    .optional()
    .transform((v) => (v ? v : null)),
  avatarUrl: z
    .string()
    .max(200_000, "Image too large after resize. Try a smaller original.")
    .optional()
    .transform((v) => (v ? v : null))
    .refine(
      (v) => !v || v.startsWith("data:image/") || v.startsWith("https://") || v === "__clear__",
      "Bad avatar payload"
    ),
});

export interface ProfileFormState {
  error?: string;
  ok?: boolean;
}

export async function saveProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await requireApprovedUser();
  const raw = {
    bio: formData.get("bio") ?? "",
    mentorAvailable: formData.get("mentorAvailable") === "on",
    mentorSkills: JSON.parse((formData.get("mentorSkills") as string) || "[]"),
    outsideEnsembles: JSON.parse((formData.get("outsideEnsembles") as string) || "[]"),
    privateLessons: JSON.parse((formData.get("privateLessons") as string) || "[]"),
    achievements: JSON.parse((formData.get("achievements") as string) || "[]"),
    workingOn: formData.get("workingOn") ?? "",
    avatarUrl: formData.get("avatarUrl") ?? "",
  };
  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please fix errors and try again." };
  }
  const p = parsed.data;

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
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, user.id));

  // workingOn + avatarUrl live on `users`.
  const userPatch: { workingOn?: string | null; avatarUrl?: string | null } = {};
  userPatch.workingOn = p.workingOn;
  if (p.avatarUrl === "__clear__") userPatch.avatarUrl = null;
  else if (p.avatarUrl) userPatch.avatarUrl = p.avatarUrl;
  // if avatarUrl unset, leave existing
  if (Object.keys(userPatch).length) {
    await db.update(users).set(userPatch).where(eq(users.id, user.id));
  }

  await logAudit({ actorUserId: user.id, action: "profile_update", targetType: "profile", targetId: user.id });
  revalidatePath("/profile");
  revalidatePath(`/directory/${user.id}`);
  revalidatePath("/directory");
  return { ok: true };
}

const StatusSchema = z.object({
  workingOn: z.string().trim().max(140).optional().transform((v) => (v ? v : null)),
});

export async function saveWorkingOn(formData: FormData) {
  const user = await requireApprovedUser();
  const parsed = StatusSchema.safeParse({ workingOn: formData.get("workingOn") ?? "" });
  if (!parsed.success) return;
  await db.update(users).set({ workingOn: parsed.data.workingOn }).where(eq(users.id, user.id));
  revalidatePath("/profile");
  revalidatePath("/directory");
  revalidatePath(`/directory/${user.id}`);
}

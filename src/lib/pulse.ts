/*
 * Compute the program's "pulse" — the hidden norm made visible.
 * Powers the headline strip on /directory. The whole point of the
 * social-norms-marketing intervention: publish the actual norm.
 */
import { eq, count, and, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles, practiceLogs, shoutouts } from "@/db/schema";

export interface ProgramPulse {
  total: number;
  withLessons: number;
  withOutside: number;
  withAchievements: number;
  mentorAvailable: number;
  shedThisWeek: number;
  shoutoutsThisMonth: number;
}

export async function computeProgramPulse(): Promise<ProgramPulse> {
  const [totalRow] = await db.select({ c: count() }).from(users).where(eq(users.status, "approved"));
  const total = totalRow?.c ?? 0;

  const profilesRows = await db
    .select({
      lessons: profiles.privateLessons,
      ensembles: profiles.outsideEnsembles,
      achievements: profiles.achievements,
      mentorAvailable: profiles.mentorAvailable,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(eq(users.status, "approved"));

  let withLessons = 0;
  let withOutside = 0;
  let withAchievements = 0;
  let mentorAvailable = 0;
  for (const p of profilesRows) {
    if (Array.isArray(p.lessons) && p.lessons.length > 0) withLessons++;
    if (Array.isArray(p.ensembles) && p.ensembles.length > 0) withOutside++;
    if (Array.isArray(p.achievements) && p.achievements.length > 0) withAchievements++;
    if (p.mentorAvailable) mentorAvailable++;
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const shedRows = await db
    .select({ userId: practiceLogs.userId })
    .from(practiceLogs)
    .where(gte(practiceLogs.date, weekAgo));
  const shedUnique = new Set(shedRows.map((r) => r.userId));

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const [shoutoutsRow] = await db
    .select({ c: count() })
    .from(shoutouts)
    .where(and(gte(shoutouts.createdAt, monthAgo), sql`${shoutouts.hiddenAt} IS NULL`));

  return {
    total,
    withLessons,
    withOutside,
    withAchievements,
    mentorAvailable,
    shedThisWeek: shedUnique.size,
    shoutoutsThisMonth: shoutoutsRow?.c ?? 0,
  };
}

export function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

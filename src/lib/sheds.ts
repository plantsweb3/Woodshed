/*
 * "Shed" semantics — every practice_log is called a shed in the UI.
 * - Streak: consecutive days with >= MIN_SHED_MINUTES logged.
 * - Rest day: one per rolling 7-day window that doesn't break the streak.
 *
 * Streaks are private — displayed only on the user's own profile. No leaderboards.
 */
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { practiceLogs, users } from "@/db/schema";

export const MIN_SHED_MINUTES = 15;
const STREAK_RESTS_PER_WEEK = 1;
const RECENT_WINDOW_MINUTES = 90;

function dayStart(d: Date) {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

function toDayKey(d: Date) {
  return dayStart(d).getTime();
}

/** Count consecutive days ending today with a shed >= MIN_SHED_MINUTES, with one rest day per 7. */
export async function computeStreak(userId: string, today: Date = new Date()) {
  const logs = await db
    .select({ date: practiceLogs.date, minutes: practiceLogs.durationMinutes })
    .from(practiceLogs)
    .where(eq(practiceLogs.userId, userId))
    .orderBy(desc(practiceLogs.date));

  if (logs.length === 0) return 0;

  // Group minutes by day.
  const perDay = new Map<number, number>();
  for (const l of logs) {
    const k = toDayKey(l.date as unknown as Date);
    perDay.set(k, (perDay.get(k) ?? 0) + l.minutes);
  }

  // Walk back from today. Allow one "rest" skip per rolling 7-day window.
  let streak = 0;
  let restsUsed = 0;
  const cursor = dayStart(today);
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // If the user hasn't practiced today yet, don't penalize — start from yesterday.
  const hasToday = (perDay.get(cursor.getTime()) ?? 0) >= MIN_SHED_MINUTES;
  if (!hasToday) cursor.setDate(cursor.getDate() - 1);

  while (true) {
    const k = cursor.getTime();
    const mins = perDay.get(k) ?? 0;
    if (mins >= MIN_SHED_MINUTES) {
      streak++;
    } else {
      if (restsUsed < STREAK_RESTS_PER_WEEK) {
        restsUsed++;
        streak++;
      } else {
        break;
      }
    }
    // Decay rest budget as we walk past 7 days.
    if (streak > 0 && streak % 7 === 0) restsUsed = 0;
    cursor.setDate(cursor.getDate() - 1);
    if (streak > 365) break; // sanity cap
  }

  return streak;
}

export async function hoursShedLifetime(userId: string) {
  const logs = await db
    .select({ minutes: practiceLogs.durationMinutes })
    .from(practiceLogs)
    .where(eq(practiceLogs.userId, userId));
  const total = logs.reduce((acc, r) => acc + r.minutes, 0);
  return Math.floor(total / 60);
}

export async function inTheShedNow(now: Date = new Date()) {
  const since = new Date(now.getTime() - RECENT_WINDOW_MINUTES * 60 * 1000);
  const rows = await db
    .select({ userId: practiceLogs.userId, section: users.section })
    .from(practiceLogs)
    .innerJoin(users, eq(practiceLogs.userId, users.id))
    .where(gte(practiceLogs.createdAt, since));
  const unique = new Map<string, string>();
  for (const r of rows) unique.set(r.userId, r.section);
  const bySection = new Map<string, number>();
  for (const section of unique.values()) {
    bySection.set(section, (bySection.get(section) ?? 0) + 1);
  }
  return { total: unique.size, bySection: Object.fromEntries(bySection.entries()) };
}

export async function thisWeekBySection(now: Date = new Date()) {
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const rows = await db
    .select({ section: users.section, minutes: practiceLogs.durationMinutes })
    .from(practiceLogs)
    .innerJoin(users, eq(practiceLogs.userId, users.id))
    .where(and(gte(practiceLogs.date, weekStart)));
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.section, (m.get(r.section) ?? 0) + r.minutes);
  const out: Array<{ section: string; hours: number }> = [];
  for (const [section, minutes] of m.entries()) {
    out.push({ section, hours: Math.round((minutes / 60) * 10) / 10 });
  }
  out.sort((a, b) => b.hours - a.hours);
  return out;
}

import { and, eq, gte, desc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { practiceLogs, mentorRequests, milestones, opportunities } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { computeStreak } from "@/lib/sheds";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function ReflectionPage() {
  const user = await requireApprovedUser();
  const now = new Date();
  const start = new Date(user.createdAt as unknown as Date);

  // "Year" = either last 12 months if more than a year on the app, else since signup.
  const yearAgo = new Date(now);
  yearAgo.setFullYear(now.getFullYear() - 1);
  const windowStart = start > yearAgo ? start : yearAgo;

  const [shedRows, mentorRows, milestoneRows, oppRows] = await Promise.all([
    db
      .select({ minutes: practiceLogs.durationMinutes })
      .from(practiceLogs)
      .where(and(eq(practiceLogs.userId, user.id), gte(practiceLogs.date, windowStart))),
    db
      .select()
      .from(mentorRequests)
      .where(and(eq(mentorRequests.requesterId, user.id), gte(mentorRequests.createdAt, windowStart))),
    db
      .select()
      .from(milestones)
      .where(and(eq(milestones.userId, user.id), gte(milestones.earnedAt, windowStart)))
      .orderBy(desc(milestones.earnedAt)),
    db.select().from(opportunities).where(and(eq(opportunities.postedBy, user.id), gte(opportunities.createdAt, windowStart))),
  ]);

  const totalMinutes = shedRows.reduce((acc, r) => acc + r.minutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const streak = await computeStreak(user.id);

  const closings = [
    "You showed up. That's the work.",
    "The shed knows. Keep going.",
    "One more year in.",
    "You put in what no one saw.",
    "Future freshmen are reading this profile.",
  ];
  const line = closings[Math.floor(Math.random() * closings.length)];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link href="/shed" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to the shed
      </Link>

      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-primary">Year in review</p>
        <h1 className="font-display text-5xl tracking-tight leading-[0.95]">
          {user.firstName}
          <br />
          in the shed.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Since {formatDate(windowStart)}. Private to you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Hours shed</p>
          <p className="font-display text-5xl mt-1">{hours}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Longest streak</p>
          <p className="font-display text-5xl mt-1">{streak}</p>
          <p className="text-xs text-muted-foreground mt-1">Current streak in days.</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Mentorship threads</p>
          <p className="font-display text-5xl mt-1">{mentorRows.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Milestones</p>
          <p className="font-display text-5xl mt-1">{milestoneRows.length}</p>
        </Card>
      </div>

      {milestoneRows.length > 0 && (
        <Card className="p-6">
          <h2 className="font-display text-2xl mb-4">Milestones, this year</h2>
          <ul className="flex flex-col gap-2">
            {milestoneRows.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3">
                <span className="text-sm">— {m.title}</span>
                <span className="text-xs text-muted-foreground">{formatDate(m.earnedAt as unknown as Date)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {oppRows.length > 0 && (
        <Card className="p-6">
          <h2 className="font-display text-2xl mb-2">Opportunities you posted</h2>
          <ul className="text-sm">
            {oppRows.map((o) => (
              <li key={o.id}>— {o.title}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-6 bg-primary-soft/40 border-primary/20">
        <p className="font-display text-2xl">{line}</p>
      </Card>

      <Link href="/shed" className="self-start">
        <Button variant="outline">Back to the shed</Button>
      </Link>
    </div>
  );
}

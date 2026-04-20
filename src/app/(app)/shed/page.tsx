import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { practiceLogs } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { computeStreak, hoursShedLifetime, inTheShedNow, thisWeekBySection } from "@/lib/sheds";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Flame, Clock, Users, Activity } from "lucide-react";
import { ShedForm } from "./shed-form";

export default async function ShedPage() {
  const user = await requireApprovedUser();

  const [streak, lifetime, now, week, recent] = await Promise.all([
    computeStreak(user.id),
    hoursShedLifetime(user.id),
    inTheShedNow(),
    thisWeekBySection(),
    db.select().from(practiceLogs).where(eq(practiceLogs.userId, user.id)).orderBy(desc(practiceLogs.date)).limit(8),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-primary">The Shed</p>
        <h1 className="font-display text-4xl tracking-tight">Where your work actually goes.</h1>
        <p className="mt-1 text-muted-foreground max-w-2xl">
          A shed is any practice session you log here. Streaks are private, lifetime hours are yours. Nobody&apos;s watching — log what&apos;s true.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<Flame className="h-4 w-4" />} label="Your streak" value={streak > 0 ? `${streak} day${streak === 1 ? "" : "s"}` : "—"} sub="Private. Only you see it." />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Lifetime shed" value={`${lifetime}h`} sub="Total hours logged." />
        <StatCard icon={<Activity className="h-4 w-4" />} label="In the shed right now" value={`${now.total} Warrior${now.total === 1 ? "" : "s"}`} sub={now.total === 0 ? "It's quiet." : "At 9pm on a Tuesday, you're not alone."} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <Card className="p-5">
          <h2 className="font-display text-2xl mb-1">Log a shed</h2>
          <p className="text-sm text-muted-foreground mb-4">Quick entry. Default is private.</p>
          <ShedForm />
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <Users className="h-4 w-4" />
            <h2 className="text-xs uppercase tracking-wide">This week by section</h2>
          </div>
          {week.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nobody&apos;s shed yet this week.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {week.map((w) => (
                <li key={w.section} className="flex items-center justify-between gap-3">
                  <span className="text-sm">{w.section}</span>
                  <span className="text-sm font-medium">{w.hours}h</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Not a leaderboard. Just a pulse. If your section is zero, it&apos;s information.
          </p>
        </Card>
      </div>

      <div>
        <h2 className="font-display text-2xl mb-4">Your recent sheds</h2>
        {recent.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="font-display text-xl">No sheds logged yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Log your first one — even a 15-minute scale run counts.</p>
          </Card>
        ) : (
          <Card>
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="p-4 flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-medium">{r.workedOn}</p>
                    {r.notes && <p className="text-sm text-muted-foreground mt-0.5">{r.notes}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(r.date as unknown as Date, { month: "short", day: "numeric", weekday: "short" })} ·{" "}
                      {r.durationMinutes} min
                    </p>
                  </div>
                  <Badge variant="outline">{r.visibility}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Card className="p-5 bg-primary-soft/40 border-primary/20">
        <h2 className="font-display text-xl">Annual reflection</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Once a year, on your Woodshed anniversary, we quietly pull together what you&apos;ve done: hours, streaks, mentorship, milestones.
        </p>
        <Link href="/shed/reflection" className="mt-3 inline-block">
          <Button variant="outline" size="sm">
            See this year&apos;s reflection
          </Button>
        </Link>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <p className="text-xs uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 font-display text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}

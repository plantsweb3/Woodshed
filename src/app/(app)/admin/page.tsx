import Link from "next/link";
import { eq, count, gte } from "drizzle-orm";
import { db } from "@/db";
import { users, mentorRequests, opportunities, profiles } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const [pending] = await db.select({ c: count() }).from(users).where(eq(users.status, "pending"));
  const [total] = await db.select({ c: count() }).from(users).where(eq(users.status, "approved"));
  const [openReq] = await db.select({ c: count() }).from(mentorRequests).where(eq(mentorRequests.status, "open"));
  const [featuredCount] = await db.select({ c: count() }).from(profiles).where(eq(profiles.featured, true));

  const now = new Date();
  const [upcoming] = await db
    .select({ c: count() })
    .from(opportunities)
    .where(gte(opportunities.deadlineDate, now));

  const stats = [
    { label: "Pending approvals", value: pending.c, href: "/admin/approvals" },
    { label: "Active members", value: total.c, href: "/admin/members" },
    { label: "Open mentor requests", value: openReq.c, href: "/mentorship" },
    { label: "Featured profiles", value: featuredCount.c, href: "/admin/featured" },
    { label: "Upcoming opportunities", value: upcoming.c, href: "/admin/opportunities" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 h-full hover:border-primary/40 transition-colors">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-3xl">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-display text-2xl mb-2">You&apos;ve got the whole picture.</h2>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Every signup, every role change, every featured pick is logged. Nothing happens here without your awareness.
          This is your complement to BAND — students see the rehearsal schedule there, and you see the musicianship layer here.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/admin/approvals">
            <Button size="sm" variant="outline">Review pending signups</Button>
          </Link>
          <Link href="/admin/settings">
            <Button size="sm" variant="ghost">Rotate invite code</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

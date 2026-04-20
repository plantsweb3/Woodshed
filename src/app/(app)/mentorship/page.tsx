import Link from "next/link";
import { desc, eq, or, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { mentorRequests, users } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MentorRequestCard, type MentorRequestCardData } from "@/components/mentor-request-card";
import { Plus, Lightbulb } from "lucide-react";
import type { MentorUrgency } from "@/lib/constants";

export default async function MentorshipPage() {
  const me = await requireApprovedUser();
  const isAdmin = me.role === "drum_major" || me.role === "director";

  const requester = alias(users, "requester");
  const claimer = alias(users, "claimer");

  const rows = await db
    .select({
      id: mentorRequests.id,
      skill: mentorRequests.skill,
      description: mentorRequests.description,
      urgency: mentorRequests.urgency,
      status: mentorRequests.status,
      createdAt: mentorRequests.createdAt,
      requesterId: mentorRequests.requesterId,
      targetId: mentorRequests.targetId,
      requesterFirst: requester.firstName,
      requesterLast: requester.lastName,
      requesterGrade: requester.grade,
      requesterSection: requester.section,
      claimerFirst: claimer.firstName,
      claimerLast: claimer.lastName,
    })
    .from(mentorRequests)
    .innerJoin(requester, eq(mentorRequests.requesterId, requester.id))
    .leftJoin(claimer, eq(mentorRequests.claimedBy, claimer.id))
    .where(isNull(mentorRequests.hiddenAt))
    .orderBy(desc(mentorRequests.createdAt));

  const mapped: MentorRequestCardData[] = rows.map((r) => ({
    id: r.id,
    skill: r.skill,
    description: r.description,
    urgency: r.urgency as MentorUrgency,
    status: r.status as "open" | "claimed" | "closed",
    createdAt: r.createdAt as unknown as Date,
    requesterId: r.requesterId,
    requesterName: `${r.requesterFirst} ${r.requesterLast}`,
    requesterGrade: r.requesterGrade,
    requesterSection: r.requesterSection,
    targetId: r.targetId,
    claimedByName: r.claimerFirst ? `${r.claimerFirst} ${r.claimerLast}` : null,
  }));

  const open = mapped.filter((r) => r.status === "open");
  const claimed = mapped.filter((r) => r.status === "claimed");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Mentorship board</h1>
          <p className="mt-1 text-muted-foreground">
            Post what you&apos;re working on. Pick up what you&apos;ve been through.
          </p>
        </div>
        <Link href="/mentorship/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Request help
          </Button>
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">Open</h2>
        {open.length === 0 ? (
          <Card className="p-10 text-center">
            <Lightbulb className="h-6 w-6 text-primary mx-auto mb-3" />
            <p className="font-display text-xl">Nobody&apos;s asking — yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The board is quiet right now. If you&apos;re stuck on something, post it. Someone here has already been where you are.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {open.map((r) => (
              <MentorRequestCard key={r.id} r={r} viewerId={me.id} viewerIsAdmin={isAdmin} />
            ))}
          </div>
        )}
      </section>

      {claimed.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl">Claimed</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {claimed.map((r) => (
              <MentorRequestCard key={r.id} r={r} viewerId={me.id} viewerIsAdmin={isAdmin} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Silence warnings for helpers we intentionally import conditionally.
void or;

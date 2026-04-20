import Link from "next/link";
import { and, desc, eq, or, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { reports, users, mentorRequests, profiles } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  dismissReport,
  hideReportedContent,
  unhideReportedContent,
  escalateReport,
  suspendReportedUser,
  deleteReportedUser,
} from "@/app/actions/moderation";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, Eye, EyeOff, Trash2, ShieldX, ArrowUp, Check } from "lucide-react";

export default async function ModerationPage() {
  const me = await requireRole(["drum_major", "director"]);
  const isDirector = me.role === "director";

  const target = alias(users, "target");
  const reporter = alias(users, "reporter");

  const rows = await db
    .select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reason: reports.reason,
      description: reports.description,
      zeroTolerance: reports.zeroTolerance,
      status: reports.status,
      resolution: reports.resolution,
      createdAt: reports.createdAt,
      targetFirst: target.firstName,
      targetLast: target.lastName,
      targetId_: target.id,
      reporterFirst: reporter.firstName,
      reporterLast: reporter.lastName,
      reporterId: reporter.id,
    })
    .from(reports)
    .leftJoin(target, eq(reports.targetUserId, target.id))
    .leftJoin(reporter, eq(reports.reporterId, reporter.id))
    .orderBy(desc(reports.createdAt))
    .limit(200);

  // Resolve the content text for each report.
  const requestIds = rows.filter((r) => r.targetType === "mentor_request").map((r) => r.targetId);
  const profileIds = rows.filter((r) => r.targetType === "profile").map((r) => r.targetId);
  const reqContent = requestIds.length
    ? await db
        .select({ id: mentorRequests.id, text: mentorRequests.description, skill: mentorRequests.skill, hiddenAt: mentorRequests.hiddenAt })
        .from(mentorRequests)
        .where(inArray(mentorRequests.id, requestIds))
    : [];
  const profContent = profileIds.length
    ? await db
        .select({ userId: profiles.userId, text: profiles.bio, hiddenAt: profiles.hiddenAt })
        .from(profiles)
        .where(inArray(profiles.userId, profileIds))
    : [];
  const reqMap = new Map(reqContent.map((r) => [r.id, r]));
  const profMap = new Map(profContent.map((r) => [r.userId, r]));

  const open = rows.filter((r) => r.status === "open" || r.status === "escalated");
  const resolved = rows.filter((r) => r.status === "dismissed" || r.status === "actioned");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl">Moderation</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Reports from members plus anything auto-flagged at submission. Zero-tolerance items are marked and email the director immediately.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Open ({open.length})</h3>
        {open.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">Nothing in the queue.</Card>
        ) : (
          open.map((r) => {
            const content =
              r.targetType === "mentor_request"
                ? reqMap.get(r.targetId)
                : r.targetType === "profile"
                ? profMap.get(r.targetId)
                : null;
            const hidden = !!content?.hiddenAt;
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.zeroTolerance && (
                      <Badge variant="accent" className="gap-1 bg-destructive text-destructive-foreground">
                        <AlertTriangle className="h-3 w-3" /> Zero-tolerance
                      </Badge>
                    )}
                    <Badge variant="outline">{r.status}</Badge>
                    <Badge variant="outline">{r.reason.replace("_", " ")}</Badge>
                    <Badge variant="outline">{r.targetType.replace("_", " ")}</Badge>
                    {hidden && (
                      <Badge variant="default" className="gap-1">
                        <EyeOff className="h-3 w-3" /> Hidden
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt as unknown as Date)}</span>
                </div>

                {content?.text && (
                  <blockquote className="border-l-4 border-border pl-3 py-1 my-2 text-sm text-foreground/90 whitespace-pre-line">
                    {content.text}
                  </blockquote>
                )}
                {r.description && r.description !== "Auto-flagged on submission." && (
                  <p className="text-xs text-muted-foreground italic mt-1">Reporter note: {r.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {r.targetFirst ? `${r.targetFirst} ${r.targetLast ?? ""}` : "(unknown)"}
                  {isDirector && (
                    <> · Reporter: {r.reporterFirst ? `${r.reporterFirst} ${r.reporterLast ?? ""}` : "auto-flag"}</>
                  )}
                </p>

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <form action={dismissReport}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" size="sm" variant="outline" className="gap-1">
                      <Check className="h-4 w-4" /> Dismiss
                    </Button>
                  </form>
                  {!hidden && (
                    <form action={hideReportedContent}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button type="submit" size="sm" variant="outline" className="gap-1">
                        <EyeOff className="h-4 w-4" /> Hide content
                      </Button>
                    </form>
                  )}
                  {hidden && isDirector && (
                    <form action={unhideReportedContent}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button type="submit" size="sm" variant="ghost" className="gap-1">
                        <Eye className="h-4 w-4" /> Restore
                      </Button>
                    </form>
                  )}
                  {!isDirector && r.status === "open" && (
                    <form action={escalateReport}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button type="submit" size="sm" variant="ghost" className="gap-1">
                        <ArrowUp className="h-4 w-4" /> Escalate to director
                      </Button>
                    </form>
                  )}
                  {isDirector && (
                    <>
                      <form action={suspendReportedUser}>
                        <input type="hidden" name="id" value={r.id} />
                        <Button type="submit" size="sm" variant="ghost" className="gap-1 text-destructive">
                          <ShieldX className="h-4 w-4" /> Suspend user
                        </Button>
                      </form>
                      <form action={deleteReportedUser}>
                        <input type="hidden" name="id" value={r.id} />
                        <Button type="submit" size="sm" variant="ghost" className="gap-1 text-destructive">
                          <Trash2 className="h-4 w-4" /> Delete user
                        </Button>
                      </form>
                    </>
                  )}
                  <Link
                    href={r.targetType === "profile" ? `/directory/${r.targetId}` : "/mentorship"}
                    className="text-xs text-muted-foreground hover:text-foreground ml-auto"
                  >
                    View in app →
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </section>

      {resolved.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Recently resolved ({resolved.length})</h3>
          <Card>
            <ul className="divide-y divide-border">
              {resolved.slice(0, 20).map((r) => (
                <li key={r.id} className="p-3 flex items-center justify-between gap-3 text-sm">
                  <span>
                    <Badge variant="outline">{r.reason.replace("_", " ")}</Badge> · {r.resolution ?? r.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt as unknown as Date)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}

void or;
void and;

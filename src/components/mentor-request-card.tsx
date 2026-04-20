import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ReportButton } from "@/components/report-button";
import { claimMentorRequest, closeMentorRequest } from "@/app/actions/mentor";
import { URGENCY_LABEL, type MentorUrgency } from "@/lib/constants";
import { Lightbulb, X, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface MentorRequestCardData {
  id: string;
  skill: string;
  description: string;
  urgency: MentorUrgency;
  status: "open" | "claimed" | "closed";
  createdAt: Date | string;
  requesterId: string;
  requesterName: string;
  requesterGrade: number;
  requesterSection: string;
  targetId: string | null;
  claimedByName: string | null;
}

export function MentorRequestCard({
  r,
  viewerId,
  viewerIsAdmin,
}: {
  r: MentorRequestCardData;
  viewerId: string;
  viewerIsAdmin: boolean;
}) {
  const mine = r.requesterId === viewerId;
  const forMe = r.targetId === viewerId;
  const canClaim = r.status === "open" && !mine;
  const canClose = r.status !== "closed" && (mine || viewerIsAdmin);

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={r.requesterName} />
          <div className="min-w-0">
            <Link href={`/directory/${r.requesterId}`} className="font-medium hover:underline truncate block">
              {r.requesterName}
            </Link>
            <p className="text-xs text-muted-foreground">
              Grade {r.requesterGrade} · {r.requesterSection} · posted {formatDate(r.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          <Badge variant={r.urgency === "this_week" ? "accent" : "outline"}>{URGENCY_LABEL[r.urgency]}</Badge>
          {forMe && <Badge variant="primary">For you</Badge>}
          {r.status === "claimed" && <Badge variant="success">Claimed{r.claimedByName ? ` — ${r.claimedByName}` : ""}</Badge>}
          {r.status === "closed" && <Badge variant="default">Closed</Badge>}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1 text-sm text-primary">
          <Lightbulb className="h-4 w-4" />
          <span className="font-medium">{r.skill}</span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{r.description}</p>
      </div>

      <div className="flex items-center gap-2">
        {canClaim && (
          <form action={claimMentorRequest}>
            <input type="hidden" name="id" value={r.id} />
            <Button type="submit" size="sm" className="gap-2">
              <ArrowRight className="h-4 w-4" /> Offer to help
            </Button>
          </form>
        )}
        {canClose && (
          <form action={closeMentorRequest}>
            <input type="hidden" name="id" value={r.id} />
            <Button type="submit" size="sm" variant="ghost" className="gap-2">
              <X className="h-4 w-4" /> Close
            </Button>
          </form>
        )}
        {!mine && <ReportButton targetType="mentor_request" targetId={r.id} />}
      </div>
    </Card>
  );
}

import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { opportunities, users } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteOpportunity } from "@/app/actions/opportunities";
import { OPPORTUNITY_TYPE_LABEL, type OpportunityType } from "@/lib/constants";
import { formatDate, relativeDeadline } from "@/lib/utils";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export default async function AdminOpportunitiesPage() {
  const rows = await db
    .select({
      id: opportunities.id,
      title: opportunities.title,
      description: opportunities.description,
      opportunityType: opportunities.opportunityType,
      link: opportunities.link,
      deadlineDate: opportunities.deadlineDate,
      posterFirst: users.firstName,
      posterLast: users.lastName,
      createdAt: opportunities.createdAt,
    })
    .from(opportunities)
    .leftJoin(users, eq(opportunities.postedBy, users.id))
    .orderBy(desc(opportunities.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl">Opportunities</h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Audition deadlines, camp info, college clinics — anything that points students <em>outside</em> Pieper. Keep rehearsal stuff on BAND.
          </p>
        </div>
        <Link href="/admin/opportunities/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New opportunity
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-display text-xl">Nothing posted yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">Start with the closest upcoming SAYWE or All-Region deadline.</p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {rows.map((o) => (
              <div key={o.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="primary">
                      {OPPORTUNITY_TYPE_LABEL[o.opportunityType as OpportunityType] ?? o.opportunityType}
                    </Badge>
                    {o.deadlineDate && <Badge variant="accent">{relativeDeadline(o.deadlineDate)}</Badge>}
                  </div>
                  <h3 className="font-medium mt-1">{o.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {o.posterFirst ? `Posted by ${o.posterFirst} ${o.posterLast ?? ""}` : "Posted"} ·{" "}
                    {o.deadlineDate ? `Deadline ${formatDate(o.deadlineDate)}` : "No deadline set"} · created {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {o.link && (
                    <Link href={o.link} target="_blank" className="text-sm text-primary inline-flex items-center gap-1">
                      Link <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  <form action={deleteOpportunity}>
                    <input type="hidden" name="id" value={o.id} />
                    <Button type="submit" variant="ghost" size="sm" className="gap-1">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

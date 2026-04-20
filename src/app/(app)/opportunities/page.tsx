import Link from "next/link";
import { eq, asc, desc, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { opportunities, users } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { OpportunityCard, type OpportunityCardData } from "@/components/opportunity-card";
import { OPPORTUNITY_TYPES, OPPORTUNITY_TYPE_LABEL, type OpportunityType } from "@/lib/constants";
import { canPostOpportunity } from "@/lib/permissions";
import { Plus, Megaphone } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const me = await requireApprovedUser();
  const sp = await searchParams;

  const filters = [] as ReturnType<typeof eq>[];
  if (sp.type) filters.push(eq(opportunities.opportunityType, sp.type));

  const rows = await db
    .select({
      id: opportunities.id,
      title: opportunities.title,
      description: opportunities.description,
      opportunityType: opportunities.opportunityType,
      link: opportunities.link,
      deadlineDate: opportunities.deadlineDate,
      sections: opportunities.sections,
      instruments: opportunities.instruments,
      posterFirst: users.firstName,
      posterLast: users.lastName,
    })
    .from(opportunities)
    .leftJoin(users, eq(opportunities.postedBy, users.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(
      // Nulls-last on deadline: put undated after dated.
      sql`CASE WHEN ${opportunities.deadlineDate} IS NULL THEN 1 ELSE 0 END`,
      asc(opportunities.deadlineDate),
      desc(opportunities.createdAt)
    );

  const items: OpportunityCardData[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    opportunityType: r.opportunityType,
    link: r.link,
    deadlineDate: r.deadlineDate as unknown as Date | null,
    sections: r.sections ?? [],
    instruments: r.instruments ?? [],
    posterName: r.posterFirst ? `${r.posterFirst} ${r.posterLast ?? ""}`.trim() : null,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Opportunities</h1>
          <p className="mt-1 text-muted-foreground max-w-xl">
            Auditions, camps, clinics, and scholarships beyond Pieper. BAND doesn&apos;t post these because they&apos;re not on the official schedule — that&apos;s the point.
          </p>
        </div>
        {canPostOpportunity(me.role) && (me.role === "drum_major" || me.role === "director") && (
          <Link href="/admin/opportunities/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Post an opportunity
            </Button>
          </Link>
        )}
      </div>

      <form action="/opportunities" className="flex items-center gap-2">
        <Select name="type" defaultValue={sp.type ?? ""} className="max-w-xs">
          <option value="">All types</option>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {OPPORTUNITY_TYPE_LABEL[t as OpportunityType]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline" size="sm">
          Filter
        </Button>
      </form>

      {items.length === 0 ? (
        <Card className="p-10 text-center">
          <Megaphone className="h-6 w-6 text-primary mx-auto mb-3" />
          <p className="font-display text-xl">BAND has your rehearsal schedule.</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            This is where you&apos;ll find what&apos;s out there beyond Pieper. Nothing posted yet — check back soon.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((o) => (
            <OpportunityCard key={o.id} o={o} />
          ))}
        </div>
      )}
    </div>
  );
}

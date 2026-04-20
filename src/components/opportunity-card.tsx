import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OPPORTUNITY_TYPE_LABEL, type OpportunityType } from "@/lib/constants";
import { formatDate, relativeDeadline } from "@/lib/utils";
import { Calendar, ExternalLink } from "lucide-react";

export interface OpportunityCardData {
  id: string;
  title: string;
  description: string;
  opportunityType: string;
  link: string | null;
  deadlineDate: Date | string | null;
  sections: string[];
  instruments: string[];
  posterName: string | null;
}

export function OpportunityCard({ o }: { o: OpportunityCardData }) {
  const typeLabel = OPPORTUNITY_TYPE_LABEL[o.opportunityType as OpportunityType] ?? "Opportunity";
  const relatedTags = [...(o.sections ?? []), ...(o.instruments ?? [])];

  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="primary">{typeLabel}</Badge>
            {o.deadlineDate && (
              <Badge variant="accent" className="gap-1">
                <Calendar className="h-3 w-3" />
                {relativeDeadline(o.deadlineDate)}
              </Badge>
            )}
          </div>
          <h3 className="font-display text-xl tracking-tight">{o.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {o.posterName ? `Posted by ${o.posterName}` : "Posted"}
            {o.deadlineDate ? ` · Deadline ${formatDate(o.deadlineDate)}` : ""}
          </p>
        </div>
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{o.description}</p>

      {relatedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {relatedTags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      )}

      {o.link && (
        <Link
          href={o.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline w-fit"
        >
          Learn more <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      )}
    </Card>
  );
}

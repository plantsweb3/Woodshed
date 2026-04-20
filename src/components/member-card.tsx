import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MemberCardData {
  id: string;
  firstName: string;
  lastName: string;
  grade: number;
  section: string;
  primaryInstrument: string;
  marchingInstrument: string | null;
  mentorAvailable: boolean;
  featured: boolean;
  achievementCount: number;
}

export function MemberCard({ m, variant = "default" }: { m: MemberCardData; variant?: "default" | "featured" }) {
  const name = `${m.firstName} ${m.lastName}`;
  const isFeatured = variant === "featured";
  return (
    <Link href={`/directory/${m.id}`} className="group block">
      <Card
        className={cn(
          "p-5 transition-[box-shadow,transform,border-color] group-hover:border-primary/40 group-hover:shadow-[0_8px_24px_-12px_rgba(75,46,131,0.35)]",
          isFeatured && "border-primary/40 bg-gradient-to-br from-primary-soft/60 to-card"
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar name={name} className={cn(isFeatured && "h-12 w-12")} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg leading-tight truncate">{name}</h3>
              {m.featured && (
                <Badge variant="accent" className="gap-1">
                  <Sparkles className="h-3 w-3" /> Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              Grade {m.grade} · {m.section}
            </p>
            <p className="text-sm text-foreground/90 truncate">
              {m.primaryInstrument}
              {m.marchingInstrument ? ` / ${m.marchingInstrument}` : ""}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {m.mentorAvailable && (
            <Badge variant="primary" className="gap-1">
              <Lightbulb className="h-3 w-3" /> Mentor
            </Badge>
          )}
          {m.achievementCount > 0 && (
            <Badge variant="outline">
              {m.achievementCount} achievement{m.achievementCount === 1 ? "" : "s"}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}

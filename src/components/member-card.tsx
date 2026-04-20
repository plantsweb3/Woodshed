import Link from "next/link";
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
  avatarUrl: string | null;
  workingOn: string | null;
}

export function MemberCard({ m, variant = "default" }: { m: MemberCardData; variant?: "default" | "featured" }) {
  if (variant === "featured") return <FeaturedCard m={m} />;
  return <EditorialCard m={m} />;
}

function EditorialCard({ m }: { m: MemberCardData }) {
  const name = `${m.firstName} ${m.lastName}`;
  return (
    <Link href={`/directory/${m.id}`} className="group block">
      <article className="relative bg-card border border-[color:var(--color-rule)]/40 p-5 shadow-[3px_3px_0_0_var(--color-rule)] transition-[transform,box-shadow] group-hover:-translate-y-[2px] group-hover:shadow-[5px_5px_0_0_var(--color-rule)]">
        <div className="flex items-start gap-4">
          <Avatar
            name={name}
            src={m.avatarUrl}
            className="h-14 w-14 rounded-none border border-ink shadow-[2px_2px_0_0_var(--color-rule)]"
          />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Gr. {m.grade} · {m.section}
            </p>
            <h3 className="mt-1 font-display text-2xl leading-tight tracking-tight truncate">
              {m.firstName}{" "}
              <span className="font-display-italic text-primary">{m.lastName}</span>
            </h3>
            <p className="text-sm text-foreground/80 mt-0.5 truncate">
              {m.primaryInstrument}
              {m.marchingInstrument ? <span className="text-muted-foreground"> / {m.marchingInstrument}</span> : null}
            </p>
          </div>
        </div>

        {m.workingOn && (
          <p className="mt-4 pt-3 border-t border-dashed border-[color:var(--color-rule)]/40 text-sm italic leading-snug text-foreground/85">
            <span className="text-accent-ink not-italic mr-1.5">✦</span>
            {m.workingOn}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {m.mentorAvailable && (
            <Badge variant="primary" className="gap-1">
              <Lightbulb className="h-2.5 w-2.5" /> Mentor
            </Badge>
          )}
          {m.achievementCount > 0 && (
            <Badge variant="outline">
              {m.achievementCount}× achievement{m.achievementCount === 1 ? "" : "s"}
            </Badge>
          )}
        </div>
      </article>
    </Link>
  );
}

function FeaturedCard({ m }: { m: MemberCardData }) {
  const name = `${m.firstName} ${m.lastName}`;
  return (
    <Link href={`/directory/${m.id}`} className="group block">
      <article
        className={cn(
          "relative bg-paper border-2 border-ink shadow-[6px_6px_0_0_var(--color-rule)] transition-[transform,box-shadow] group-hover:-translate-y-1 group-hover:-rotate-[0.6deg] group-hover:shadow-[8px_10px_0_0_var(--color-rule)]"
        )}
      >
        {/* Card header — stamp strip */}
        <header className="flex items-center justify-between px-4 py-2 border-b-2 border-ink bg-accent">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] font-bold">
            ✦ Featured
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
            Gr. {m.grade}
          </span>
        </header>

        {/* Portrait */}
        <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-ink bg-primary-soft">
          {m.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.avatarUrl} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-primary halftone" style={{ color: "var(--color-primary)" }}>
              <span className="font-display text-[8rem] leading-none">{m.firstName.slice(0, 1)}</span>
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-15 halftone" style={{ color: "var(--color-ink)" }} />
          {m.mentorAvailable && (
            <span className="stamp absolute bottom-3 left-3 bg-paper text-ink">
              <Sparkles className="h-2.5 w-2.5" /> Mentor
            </span>
          )}
        </div>

        <div className="px-4 pt-4 pb-5">
          <h3 className="font-display text-4xl leading-[0.95] tracking-tight">
            {m.firstName}
            <br />
            <span className="font-display-italic text-primary">{m.lastName}</span>
          </h3>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {m.section} · {m.primaryInstrument}
            {m.marchingInstrument ? ` / ${m.marchingInstrument}` : ""}
          </p>

          {m.workingOn && (
            <p className="mt-3 border-l-2 border-primary pl-3 text-sm italic leading-snug text-foreground/85">
              &ldquo;{m.workingOn}&rdquo;
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-dashed border-[color:var(--color-rule)]/40 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {m.achievementCount > 0
                ? `${m.achievementCount}× honors`
                : "Rising"}
            </p>
            <span className="font-display-italic text-primary text-sm">read →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

import { eq, and, like, or, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { MemberCard, type MemberCardData } from "@/components/member-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SECTIONS, GRADES, CONCERT_INSTRUMENTS } from "@/lib/constants";
import { Search } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    section?: string;
    grade?: string;
    instrument?: string;
    mentor?: string;
  }>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  await requireApprovedUser();
  const sp = await searchParams;

  const filters = [eq(users.status, "approved")];
  if (sp.section) filters.push(eq(users.section, sp.section));
  if (sp.grade) filters.push(eq(users.grade, Number(sp.grade)));
  if (sp.instrument) filters.push(eq(users.primaryInstrument, sp.instrument));
  if (sp.q) {
    const q = `%${sp.q.toLowerCase()}%`;
    filters.push(
      or(like(users.firstName, q), like(users.lastName, q), like(users.primaryInstrument, q))!
    );
  }

  const rows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      grade: users.grade,
      section: users.section,
      primaryInstrument: users.primaryInstrument,
      marchingInstrument: users.marchingInstrument,
      avatarUrl: users.avatarUrl,
      workingOn: users.workingOn,
      mentorAvailable: profiles.mentorAvailable,
      featured: profiles.featured,
      achievements: profiles.achievements,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(...filters))
    .orderBy(users.lastName);

  let members: MemberCardData[] = rows.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    grade: r.grade,
    section: r.section,
    primaryInstrument: r.primaryInstrument,
    marchingInstrument: r.marchingInstrument,
    avatarUrl: r.avatarUrl,
    workingOn: r.workingOn,
    mentorAvailable: !!r.mentorAvailable,
    featured: !!r.featured,
    achievementCount: Array.isArray(r.achievements) ? r.achievements.length : 0,
  }));

  if (sp.mentor === "1") members = members.filter((m) => m.mentorAvailable);

  const featured = members.filter((m) => m.featured);
  const rest = members.filter((m) => !m.featured);

  return (
    <div className="flex flex-col gap-10">
      <header className="pt-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">The Directory</p>
        <h1 className="mt-1 font-display text-5xl md:text-7xl leading-[0.9] tracking-tight">
          Everyone in <span className="font-display-italic text-primary">the program.</span>
        </h1>
        <p className="mt-3 max-w-xl text-base text-foreground/80 leading-relaxed">
          Tap any name to see what they&apos;re working on right now. Featured profiles are picked by drum majors — that&apos;s public, deliberate, and rotates.
        </p>
      </header>

      <form
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-5 p-5 bg-paper border border-[color:var(--color-rule)]/40 shadow-[3px_3px_0_0_var(--color-rule)]"
        action="/directory"
      >
        <div className="relative sm:col-span-2 flex items-end">
          <Search className="h-4 w-4 absolute left-0 bottom-3 text-muted-foreground" />
          <Input name="q" placeholder="Search by name or instrument" defaultValue={sp.q ?? ""} className="pl-6" />
        </div>
        <Select name="section" defaultValue={sp.section ?? ""}>
          <option value="">All sections</option>
          {SECTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select name="grade" defaultValue={sp.grade ?? ""}>
          <option value="">All grades</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </Select>
        <Select name="instrument" defaultValue={sp.instrument ?? ""}>
          <option value="">All instruments</option>
          {CONCERT_INSTRUMENTS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
        <label className="sm:col-span-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" name="mentor" value="1" defaultChecked={sp.mentor === "1"} className="accent-primary" />
          Available mentors only
        </label>
        <button className="h-10 px-4 rounded-none bg-ink text-paper text-xs font-mono uppercase tracking-[0.18em] font-semibold">
          Apply filter
        </button>
      </form>

      {featured.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent-ink">Feature</p>
              <h2 className="font-display text-4xl md:text-5xl leading-[0.9]">
                <span className="font-display-italic text-primary">Worth</span> knowing about.
              </h2>
            </div>
            <p className="hidden md:block text-xs text-muted-foreground italic max-w-sm text-right">
              Chosen by this month&apos;s drum majors. Rotated regularly so more students get seen.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {featured.map((m) => (
              <MemberCard key={m.id} m={m} variant="featured" />
            ))}
          </div>
        </section>
      )}

      <section>
        {featured.length > 0 && (
          <div className="flex items-end justify-between mb-6 pt-4 border-t border-[color:var(--color-rule)]/30">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">The rest</p>
              <h2 className="font-display text-3xl md:text-4xl">
                Everyone <span className="font-display-italic text-primary">else.</span>
              </h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
              {rest.length} member{rest.length === 1 ? "" : "s"}
            </p>
          </div>
        )}
        {rest.length === 0 && featured.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="font-display text-3xl">Nobody matches that filter.</p>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Loosen the filters — or be the first to fill in this corner of the program.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((m) => (
              <MemberCard key={m.id} m={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

void inArray;

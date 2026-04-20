import { eq, and, like, or, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { MemberCard, type MemberCardData } from "@/components/member-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SECTIONS, GRADES, CONCERT_INSTRUMENTS } from "@/lib/constants";
import { Search, Sparkles } from "lucide-react";

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
    mentorAvailable: !!r.mentorAvailable,
    featured: !!r.featured,
    achievementCount: Array.isArray(r.achievements) ? r.achievements.length : 0,
  }));

  if (sp.mentor === "1") members = members.filter((m) => m.mentorAvailable);

  const featured = members.filter((m) => m.featured);
  const rest = members.filter((m) => !m.featured);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Directory</h1>
        <p className="mt-1 text-muted-foreground">
          The musicians in this program. Tap a name to see what they&apos;re working on.
        </p>
      </div>

      <form
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-card/60 border border-border rounded-lg"
        action="/directory"
      >
        <div className="relative sm:col-span-2">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" placeholder="Search by name or instrument" defaultValue={sp.q ?? ""} className="pl-9" />
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
        <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Apply</button>
      </form>

      {featured.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
            <h2 className="font-display text-2xl">Featured</h2>
            <p className="text-sm text-muted-foreground">— musicians worth knowing about</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((m) => (
              <MemberCard key={m.id} m={m} variant="featured" />
            ))}
          </div>
        </section>
      )}

      <section>
        {featured.length > 0 && <h2 className="font-display text-2xl mb-4">Everyone else</h2>}
        {rest.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="font-display text-xl">Nobody matches that filter.</p>
            <p className="mt-2 text-sm text-muted-foreground">
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

// Silences unused-import warning for tree-shaken helpers we may use later.
void inArray;

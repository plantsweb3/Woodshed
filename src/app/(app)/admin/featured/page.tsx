import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { toggleFeatured } from "@/app/actions/admin";
import { Sparkles } from "lucide-react";

export default async function FeaturedAdminPage() {
  const rows = await db
    .select({
      id: users.id,
      first: users.firstName,
      last: users.lastName,
      grade: users.grade,
      section: users.section,
      primary: users.primaryInstrument,
      featured: profiles.featured,
      achievements: profiles.achievements,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.status, "approved"))
    .orderBy(asc(users.lastName));

  const featured = rows.filter((r) => r.featured);
  const rest = rows.filter((r) => !r.featured);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl">Featured members</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Pick 3–5 musicians whose profiles exemplify what this program can look like. Featured profiles rise to the top of the directory.
          Rotate them regularly so more students get seen.
        </p>
      </div>

      <section>
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Currently featured ({featured.length})</h3>
        {featured.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">No one featured yet. Pick your first three.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featured.map((r) => (
              <FeatureRow key={r.id} r={r} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Everyone else</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rest.map((r) => (
            <FeatureRow key={r.id} r={r} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FeatureRow({
  r,
}: {
  r: {
    id: string;
    first: string;
    last: string;
    grade: number;
    section: string;
    primary: string;
    featured: boolean | null;
    achievements: unknown;
  };
}) {
  const name = `${r.first} ${r.last}`;
  const aCount = Array.isArray(r.achievements) ? r.achievements.length : 0;
  return (
    <Card className="p-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <Avatar name={name} />
        <div className="min-w-0">
          <Link href={`/directory/${r.id}`} className="font-medium hover:underline block truncate">
            {name}
          </Link>
          <p className="text-xs text-muted-foreground truncate">
            Grade {r.grade} · {r.section} · {r.primary}
          </p>
          <div className="mt-1 flex gap-1.5 flex-wrap">
            {r.featured && (
              <Badge variant="accent" className="gap-1">
                <Sparkles className="h-3 w-3" /> Featured
              </Badge>
            )}
            {aCount > 0 && <Badge variant="outline">{aCount} achievement{aCount === 1 ? "" : "s"}</Badge>}
          </div>
        </div>
      </div>
      <form action={toggleFeatured}>
        <input type="hidden" name="id" value={r.id} />
        <Button type="submit" size="sm" variant={r.featured ? "outline" : "default"}>
          {r.featured ? "Unfeature" : "Feature"}
        </Button>
      </form>
    </Card>
  );
}

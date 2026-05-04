import Link from "next/link";
import { desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { shoutouts, users } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ReportButton } from "@/components/report-button";
import { KudosButton } from "@/components/kudos-button";
import { ShoutoutForm } from "./form";
import { summarize as summarizeKudos } from "@/lib/kudos";
import { formatDate } from "@/lib/utils";
import { Megaphone, Trash2 } from "lucide-react";
import { deleteShoutout } from "@/app/actions/shoutouts";

const KIND_LABEL: Record<string, string> = {
  summer_program: "Summer program",
  audition: "Audition",
  lesson: "Lesson",
  honor: "Honor",
  performance: "Performance",
  camp: "Camp",
  other: "Other",
};

export default async function ShoutoutsPage() {
  const me = await requireApprovedUser();
  const isAdmin = me.role === "drum_major" || me.role === "director";

  const rows = await db
    .select({
      id: shoutouts.id,
      kind: shoutouts.kind,
      title: shoutouts.title,
      body: shoutouts.body,
      createdAt: shoutouts.createdAt,
      authorId: shoutouts.authorId,
      authorFirst: users.firstName,
      authorLast: users.lastName,
      authorSection: users.section,
      authorGrade: users.grade,
      authorAvatar: users.avatarUrl,
    })
    .from(shoutouts)
    .innerJoin(users, eq(shoutouts.authorId, users.id))
    .where(isNull(shoutouts.hiddenAt))
    .orderBy(desc(shoutouts.createdAt))
    .limit(60);

  const kudosMap = await summarizeKudos(
    "shoutout",
    rows.map((r) => r.id),
    me.id
  );

  return (
    <div className="flex flex-col gap-10">
      <header className="pt-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent-ink">Shoutouts</p>
        <h1 className="mt-1 font-display text-5xl md:text-7xl leading-[0.9] tracking-tight">
          What we&apos;re <span className="font-display-italic text-primary">doing</span> out there.
        </h1>
        <p className="mt-3 max-w-2xl text-base text-foreground/80 leading-relaxed">
          The literal &ldquo;what we did this summer&rdquo; ritual, made permanent. Auditions
          you took. Camps you went to. Honor bands you placed in. Lessons you started.
          Anything outside Pieper that the program should know happened.
        </p>
      </header>

      <Card className="p-5 md:p-6">
        <p className="label-eyebrow text-muted-foreground mb-3">Post a shoutout</p>
        <ShoutoutForm />
      </Card>

      <section className="flex flex-col gap-5">
        {rows.length === 0 ? (
          <Card className="p-12 text-center">
            <Megaphone className="h-6 w-6 text-primary mx-auto mb-3" />
            <p className="font-display text-3xl">Be the first.</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Whatever you&apos;ve done outside this program lately — say it here. Once one
              person posts, every other person in the program suddenly has permission to
              say theirs.
            </p>
          </Card>
        ) : (
          rows.map((s) => {
            const k = kudosMap.get(s.id) ?? { count: 0, mine: false };
            const authorName = `${s.authorFirst} ${s.authorLast}`;
            const isAuthor = me.id === s.authorId;
            return (
              <Card key={s.id} className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar
                    name={authorName}
                    src={s.authorAvatar}
                    className="h-12 w-12 rounded-none border border-ink shadow-[2px_2px_0_0_var(--color-rule)]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/directory/${s.authorId}`}
                        className="font-editorial text-lg leading-tight hover:underline"
                      >
                        {authorName}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        Gr. {s.authorGrade} · {s.authorSection}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{formatDate(s.createdAt as unknown as Date)}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge variant="primary">{KIND_LABEL[s.kind] ?? s.kind}</Badge>
                    </div>

                    <p className="mt-3 font-display text-2xl leading-[1.05]">{s.title}</p>
                    {s.body && (
                      <p className="mt-2 text-foreground/85 leading-relaxed whitespace-pre-line">{s.body}</p>
                    )}

                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {!isAuthor && (
                        <KudosButton
                          targetType="shoutout"
                          targetId={s.id}
                          initialCount={k.count}
                          initialGiven={k.mine}
                          size="sm"
                        />
                      )}
                      {isAuthor && k.count > 0 && (
                        <span className="text-xs text-muted-foreground italic">
                          {k.count} high-five{k.count === 1 ? "" : "s"}
                        </span>
                      )}
                      {!isAuthor && <ReportButton targetType="user" targetId={s.id} />}
                      {(isAuthor || isAdmin) && (
                        <form action={deleteShoutout} className="ml-auto">
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}

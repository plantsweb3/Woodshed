import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { requireApprovedUser, getCurrentUser } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ReportButton } from "@/components/report-button";
import { KudosButton } from "@/components/kudos-button";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { countFor, hasGiven, summarize as summarizeKudos } from "@/lib/kudos";
import { listForUser as listMilestones } from "@/lib/milestones";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function MemberProfilePage({ params }: PageProps) {
  await requireApprovedUser();
  const viewer = await getCurrentUser();
  const { userId } = await params;

  const [row] = await db
    .select({ user: users, profile: profiles })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) notFound();
  if (row.user.status !== "approved" && row.user.status !== "alumni") notFound();
  if (!row.user.profileVisible && viewer?.id !== row.user.id && viewer?.role !== "director") notFound();
  const { user, profile } = row;
  const fullName = `${user.firstName} ${user.lastName}`;
  const bioHidden = !!profile?.hiddenAt;

  const achievements = profile?.achievements ?? [];
  const ensembles = profile?.outsideEnsembles ?? [];
  const lessons = profile?.privateLessons ?? [];
  const mentorSkills = profile?.mentorSkills ?? [];
  const isSelf = viewer?.id === user.id;

  const profileKudosCount = await countFor("profile", user.id);
  const profileKudosGiven = viewer && !isSelf ? await hasGiven(viewer.id, "profile", user.id) : false;

  const theirMilestones = await listMilestones(user.id);
  const milestoneKudos = await summarizeKudos(
    "milestone",
    theirMilestones.map((m) => m.id),
    viewer?.id ?? null
  );

  return (
    <article className="flex flex-col gap-10">
      <Link
        href="/directory"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-mono uppercase tracking-[0.22em] w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to the directory
      </Link>

      {/* Masthead */}
      <header className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 md:gap-12 items-start pb-8 border-b-2 border-ink">
        <div className="flex flex-col items-start gap-3">
          <Avatar
            name={fullName}
            src={user.avatarUrl}
            className="h-48 w-48 rounded-none border-2 border-ink shadow-[6px_6px_0_0_var(--color-rule)]"
          />
          {!isSelf && viewer && (
            <KudosButton
              targetType="profile"
              targetId={user.id}
              initialCount={profileKudosCount}
              initialGiven={profileKudosGiven}
            />
          )}
          {isSelf && profileKudosCount > 0 && (
            <p className="text-xs text-muted-foreground italic">
              {profileKudosCount} high-five{profileKudosCount === 1 ? "" : "s"} on your profile.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Profile № {user.id.slice(0, 4).toUpperCase()} · Vol. 01
            </p>
            {profile?.featured && (
              <span className="stamp text-accent-ink">
                ✦ Featured
              </span>
            )}
            {user.role === "drum_major" && <Badge variant="stamp">Drum Major</Badge>}
            {user.role === "section_leader" && <Badge variant="stamp">Section Leader</Badge>}
            {user.role === "director" && <Badge variant="stamp">Director</Badge>}
            {user.status === "alumni" && user.graduationYear && (
              <Badge variant="outline">Alumni · {user.graduationYear}</Badge>
            )}
          </div>

          <h1 className="font-display text-6xl md:text-8xl leading-[0.88] tracking-tight">
            {user.firstName}
            <br />
            <span className="font-display-italic text-primary">{user.lastName}.</span>
          </h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-[0.22em]">
            <span>Grade {user.grade}</span>
            <span className="text-muted-foreground">—</span>
            <span>{user.section}</span>
            <span className="text-muted-foreground">—</span>
            <span className="text-primary">{user.primaryInstrument}</span>
            {user.marchingInstrument && (
              <>
                <span className="text-muted-foreground">/</span>
                <span>{user.marchingInstrument} (marching)</span>
              </>
            )}
          </div>

          {user.workingOn && (
            <div className="mt-7 relative pl-6 max-w-2xl">
              <span className="absolute left-0 top-1 text-accent-ink text-2xl leading-none">✦</span>
              <p className="label-eyebrow text-primary">In the shed right now</p>
              <p className="font-editorial-italic text-2xl md:text-3xl leading-snug mt-1">
                {user.workingOn}
              </p>
            </div>
          )}

          {profile?.mentorAvailable && user.status === "approved" && (
            <div className="mt-8 flex items-center gap-3">
              <Link href={`/mentorship/new?to=${user.id}`}>
                <Button className="gap-2">
                  Ask {user.firstName} for help <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-[0.18em]">
                {mentorSkills.length} skill{mentorSkills.length === 1 ? "" : "s"} open
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Bio — drop cap, pull quote */}
      {!bioHidden && profile?.bio && (
        <section className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 md:gap-12 items-start">
          <aside>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">I. In their words</p>
            <hr className="rule-letterpress mt-2 mb-3 w-12" />
          </aside>
          <div>
            <p className="max-w-2xl text-lg md:text-xl leading-[1.55] drop-cap whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        </section>
      )}
      {bioHidden && (
        <section className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 md:gap-12 items-start">
          <aside>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">I. In their words</p>
          </aside>
          <div><p className="italic text-muted-foreground">Bio hidden by moderation.</p></div>
        </section>
      )}

      {/* Outside work + achievements + lessons + mentor skills */}
      <section className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 md:gap-12 items-start border-t border-[color:var(--color-rule)]/30 pt-10">
        <aside>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">II. The record</p>
          <hr className="rule-letterpress mt-2 mb-3 w-12" />
          <p className="text-xs italic text-muted-foreground max-w-xs">
            Ensembles, honors, and the people teaching them. A permanent byline.
          </p>
        </aside>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Section label="Outside ensembles">
            {ensembles.length === 0 ? (
              <Empty text="None listed. (SAYWE, DCI, community symphony, honor band — fair game.)" />
            ) : (
              <ul className="flex flex-col gap-3">
                {ensembles.map((e, i) => (
                  <li key={i} className="flex flex-col border-b border-dashed border-[color:var(--color-rule)]/30 pb-2 last:border-b-0">
                    <span className="font-editorial text-base">{e.name}</span>
                    {e.startYear && <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Since {e.startYear}</span>}
                    {e.notes && <span className="text-sm text-muted-foreground italic">{e.notes}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section label="Honors & achievements">
            {achievements.length === 0 ? (
              <Empty text="Add what you're working on — future freshmen need to see it's possible." />
            ) : (
              <ul className="flex flex-col gap-3">
                {achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 border-b border-dashed border-[color:var(--color-rule)]/30 pb-2 last:border-b-0">
                    <span className="text-accent-ink shrink-0 mt-0.5">✦</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-editorial text-base">{a.title}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {a.year ?? ""}
                        {a.year && a.detail ? " · " : ""}
                        {a.detail ?? ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section label="Private lessons">
            {lessons.length === 0 ? (
              <Empty text="None listed." />
            ) : (
              <ul className="flex flex-col gap-3">
                {lessons.map((l, i) => (
                  <li key={i} className="flex flex-col border-b border-dashed border-[color:var(--color-rule)]/30 pb-2 last:border-b-0">
                    <span className="font-editorial text-base">{l.teacher}</span>
                    {l.focus && <span className="text-sm text-muted-foreground italic">{l.focus}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section label="Mentors in">
            {profile?.mentorAvailable && mentorSkills.length ? (
              <div className="flex flex-wrap gap-1.5">
                {mentorSkills.map((s) => (
                  <Badge key={s} variant="primary">
                    {s}
                  </Badge>
                ))}
              </div>
            ) : profile?.mentorAvailable ? (
              <Empty text="Mentor-available, no skills listed yet." />
            ) : (
              <Empty text="Not currently accepting mentees." />
            )}
          </Section>
        </div>
      </section>

      {/* Milestones */}
      {theirMilestones.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 md:gap-12 items-start border-t border-[color:var(--color-rule)]/30 pt-10">
          <aside>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">III. Timeline</p>
            <hr className="rule-letterpress mt-2 mb-3 w-12" />
            <p className="text-xs italic text-muted-foreground max-w-xs">
              Milestones on Woodshed. High-five the ones that land.
            </p>
          </aside>
          <ul className="relative border-l-2 border-ink pl-5 flex flex-col gap-5 max-w-2xl">
            {theirMilestones.map((m) => {
              const k = milestoneKudos.get(m.id) ?? { count: 0, mine: false };
              return (
                <li key={m.id} className="relative">
                  <span className="absolute -left-[26px] top-1.5 h-3 w-3 bg-accent border border-ink rotate-45" />
                  <p className="font-editorial text-lg leading-tight">{m.title}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    {formatDate(m.earnedAt as unknown as Date)}
                  </p>
                  <div className="mt-2">
                    {!isSelf && viewer ? (
                      <KudosButton
                        targetType="milestone"
                        targetId={m.id}
                        initialCount={k.count}
                        initialGiven={k.mine}
                        size="sm"
                      />
                    ) : (
                      k.count > 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          · {k.count} high-five{k.count === 1 ? "" : "s"}
                        </p>
                      )
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!isSelf && !bioHidden && (
        <section className="pt-6 border-t border-[color:var(--color-rule)]/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground italic max-w-sm">
            Something off? Flag it and a drum major will take a look. The person reported won&apos;t be notified.
          </p>
          <ReportButton targetType="profile" targetId={user.id} />
        </section>
      )}
    </article>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label-eyebrow text-muted-foreground mb-3 flex items-center gap-2">
        <span>{label}</span>
        <span className="flex-1 h-px bg-[color:var(--color-rule)]/20" />
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground italic">{text}</p>;
}

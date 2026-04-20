import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ReportButton } from "@/components/report-button";
import { Sparkles, Lightbulb, Music, GraduationCap, Medal, BookOpen, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/session";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function MemberProfilePage({ params }: PageProps) {
  await requireApprovedUser();
  const viewer = await getCurrentUser();
  const { userId } = await params;

  const [row] = await db
    .select({
      user: users,
      profile: profiles,
    })
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

  return (
    <div className="flex flex-col gap-8">
      <Link href="/directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to directory
      </Link>

      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <Avatar name={fullName} className="h-16 w-16 text-base" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-3xl sm:text-4xl tracking-tight">{fullName}</h1>
              {profile?.featured && (
                <Badge variant="accent" className="gap-1">
                  <Sparkles className="h-3 w-3" /> Featured
                </Badge>
              )}
              {user.role === "drum_major" && <Badge variant="primary">Drum Major</Badge>}
              {user.role === "section_leader" && <Badge variant="primary">Section Leader</Badge>}
              {user.role === "director" && <Badge variant="primary">Director</Badge>}
              {user.status === "alumni" && user.graduationYear && (
                <Badge variant="default">Alumni — Class of {user.graduationYear}</Badge>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">
              Grade {user.grade} · {user.section}
            </p>
            <p className="mt-0.5 text-foreground/90">
              {user.primaryInstrument}
              {user.marchingInstrument ? ` / ${user.marchingInstrument} (marching)` : ""}
            </p>
          </div>
          {profile?.mentorAvailable && user.status === "approved" && (
            <Link href={`/mentorship/new?to=${user.id}`}>
              <Button size="lg" className="gap-2">
                <Lightbulb className="h-4 w-4" /> Request mentorship
              </Button>
            </Link>
          )}
        </div>
        {bioHidden ? (
          <p className="mt-6 text-sm text-muted-foreground italic">Bio hidden by moderation.</p>
        ) : profile?.bio ? (
          <p className="mt-6 text-foreground/90 leading-relaxed whitespace-pre-line max-w-3xl">{profile.bio}</p>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground italic">
            No bio yet. That&apos;s ok — the work speaks.
          </p>
        )}
        {!isSelf && !bioHidden && (
          <div className="mt-4">
            <ReportButton targetType="profile" targetId={user.id} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section icon={<Music className="h-4 w-4" />} title="Outside ensembles">
          {ensembles.length === 0 ? (
            <Empty text="None listed. (SAYWE, DCI, community symphony, honor band — fair game.)" />
          ) : (
            <ul className="flex flex-col gap-3">
              {ensembles.map((e, i) => (
                <li key={i} className="flex flex-col">
                  <span className="font-medium">{e.name}</span>
                  {e.startYear && <span className="text-xs text-muted-foreground">Since {e.startYear}</span>}
                  {e.notes && <span className="text-sm text-muted-foreground">{e.notes}</span>}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon={<Medal className="h-4 w-4" />} title="Achievements">
          {achievements.length === 0 ? (
            <Empty text="Add what you're working on — future freshmen need to see it's possible." />
          ) : (
            <ul className="flex flex-col gap-3">
              {achievements.map((a, i) => (
                <li key={i} className="flex flex-col">
                  <span className="font-medium">{a.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.year ? a.year : ""}
                    {a.year && a.detail ? " · " : ""}
                    {a.detail ?? ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon={<GraduationCap className="h-4 w-4" />} title="Private lessons">
          {lessons.length === 0 ? (
            <Empty text="None listed." />
          ) : (
            <ul className="flex flex-col gap-3">
              {lessons.map((l, i) => (
                <li key={i} className="flex flex-col">
                  <span className="font-medium">{l.teacher}</span>
                  {l.focus && <span className="text-sm text-muted-foreground">{l.focus}</span>}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon={<BookOpen className="h-4 w-4" />} title="Mentors in">
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
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        {icon}
        <h2 className="text-xs uppercase tracking-wide font-medium">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground italic">{text}</p>;
}

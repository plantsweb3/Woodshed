import Link from "next/link";
import { getCurrentUserWithProfile } from "@/lib/session";
import { redirect } from "next/navigation";
import { ProfileEditor } from "./editor";
import { MENTOR_SKILLS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { listForUser as listMilestones } from "@/lib/milestones";
import { formatDate } from "@/lib/utils";
import { Flame } from "lucide-react";

function profileCompleteness(p: {
  bio: string | null;
  mentorAvailable: boolean;
  mentorSkills: string[];
  outsideEnsembles: unknown[];
  privateLessons: unknown[];
  achievements: unknown[];
}) {
  let score = 0;
  const total = 5;
  if (p.bio && p.bio.trim().length > 20) score++;
  if (p.mentorAvailable || p.mentorSkills.length > 0) score++;
  if (p.outsideEnsembles.length > 0) score++;
  if (p.privateLessons.length > 0) score++;
  if (p.achievements.length > 0) score++;
  return Math.round((score / total) * 100);
}

export default async function ProfilePage() {
  const me = await getCurrentUserWithProfile();
  if (!me) redirect("/signin");
  if (me.status === "pending") redirect("/pending");
  if (!me.onboardingCompletedAt) redirect("/onboarding");

  const completeness = profileCompleteness({
    bio: me.profile?.bio ?? null,
    mentorAvailable: me.profile?.mentorAvailable ?? false,
    mentorSkills: me.profile?.mentorSkills ?? [],
    outsideEnsembles: me.profile?.outsideEnsembles ?? [],
    privateLessons: me.profile?.privateLessons ?? [],
    achievements: me.profile?.achievements ?? [],
  });

  const earnedMilestones = await listMilestones(me.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight">My profile</h1>
        <p className="mt-1 text-muted-foreground">What other musicians in the program see when they find you.</p>
      </div>

      {completeness < 100 && (
        <Card className="p-4 bg-accent-soft/40 border-accent/20">
          <p className="text-sm">
            <span className="font-medium">{completeness}% complete</span> — finish it up. A full profile is how future
            freshmen know what&apos;s possible.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <Card className="p-6">
          <ProfileEditor
            initial={{
              bio: me.profile?.bio ?? "",
              mentorAvailable: me.profile?.mentorAvailable ?? false,
              mentorSkills: me.profile?.mentorSkills ?? [],
              outsideEnsembles: me.profile?.outsideEnsembles ?? [],
              privateLessons: me.profile?.privateLessons ?? [],
              achievements: me.profile?.achievements ?? [],
            }}
            mentorSkillOptions={[...MENTOR_SKILLS]}
          />
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Flame className="h-4 w-4" />
              <h2 className="text-xs uppercase tracking-wide">Milestones</h2>
            </div>
            {earnedMilestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your timeline fills in as you go. Log your first shed to start it.</p>
            ) : (
              <ul className="relative border-l border-border pl-4 flex flex-col gap-3">
                {earnedMilestones.map((m) => (
                  <li key={m.id} className="relative">
                    <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                    <p className="text-sm font-medium leading-tight">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(m.earnedAt as unknown as Date)}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/shed" className="text-xs text-primary hover:underline mt-4 inline-block">
              Go to the shed →
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

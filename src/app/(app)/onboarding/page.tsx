import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { MENTOR_SKILLS } from "@/lib/constants";
import { OnboardingWizard } from "./wizard";

export default async function OnboardingPage() {
  const user = await requireApprovedOrAlumniNoOnboarding();
  if (user.status !== "approved" && user.status !== "alumni") redirect("/pending");

  // Surface up to 3 featured profiles as examples. Filters the current user out.
  const examples = await db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      grade: users.grade,
      section: users.section,
      primaryInstrument: users.primaryInstrument,
      ensembles: profiles.outsideEnsembles,
      lessons: profiles.privateLessons,
      achievements: profiles.achievements,
      bio: profiles.bio,
    })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(users.status, "approved"), eq(profiles.featured, true)))
    .limit(3);

  return (
    <OnboardingWizard
      firstName={user.firstName}
      section={user.section}
      grade={user.grade}
      primaryInstrument={user.primaryInstrument}
      marchingInstrument={user.marchingInstrument}
      mentorSkillOptions={[...MENTOR_SKILLS]}
      examples={examples.filter((e) => e.firstName !== user.firstName || e.lastName !== user.lastName)}
    />
  );
}

import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { requireApprovedUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NewMentorRequestForm } from "./form";
import { MENTOR_SKILLS } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ to?: string }>;
}

export default async function NewMentorRequestPage({ searchParams }: PageProps) {
  await requireApprovedUser();
  const sp = await searchParams;

  let targetUser: { id: string; firstName: string; lastName: string; section: string; grade: number; skills: string[] } | null = null;
  if (sp.to) {
    const [row] = await db
      .select({ user: users, profile: profiles })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(eq(users.id, sp.to), eq(users.status, "approved")))
      .limit(1);
    if (row && row.profile?.mentorAvailable) {
      targetUser = {
        id: row.user.id,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        section: row.user.section,
        grade: row.user.grade,
        skills: row.profile.mentorSkills ?? [],
      };
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link href="/mentorship" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to board
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Request mentorship</CardTitle>
          <CardDescription>
            {targetUser
              ? "This one goes straight to the mentor you picked. They'll see it as a request for them."
              : "Posts to the open board so any available mentor with that skill can pick it up."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {targetUser && (
            <div className="flex items-center gap-3 rounded-md border border-border p-3 bg-primary-soft/40">
              <Avatar name={`${targetUser.firstName} ${targetUser.lastName}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{targetUser.firstName} {targetUser.lastName}</p>
                <p className="text-xs text-muted-foreground">
                  Grade {targetUser.grade} · {targetUser.section}
                </p>
              </div>
            </div>
          )}
          <NewMentorRequestForm
            targetId={targetUser?.id ?? null}
            skillHints={targetUser?.skills.length ? targetUser.skills : [...MENTOR_SKILLS]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

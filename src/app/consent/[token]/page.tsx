import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { parentConsents, users } from "@/db/schema";
import { APP } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApproveButton } from "./approve-button";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ConsentPage({ params }: PageProps) {
  const { token } = await params;
  const [row] = await db
    .select({
      consent: parentConsents,
      studentFirst: users.firstName,
      studentLast: users.lastName,
      studentGrade: users.grade,
      studentSection: users.section,
    })
    .from(parentConsents)
    .leftJoin(users, eq(parentConsents.userId, users.id))
    .where(eq(parentConsents.token, token))
    .limit(1);

  const now = new Date();
  const expired = row ? (row.consent.expiresAt as unknown as Date) < now : true;
  const alreadyConsented = row?.consent.consentedAt != null;

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <span className="font-display text-lg leading-none">W</span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent" />
          </div>
          <span className="font-display text-xl tracking-tight">{APP.name}</span>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-xl w-full px-6 py-12">
        <Card>
          {!row ? (
            <>
              <CardHeader>
                <CardTitle>Link invalid</CardTitle>
                <CardDescription>This consent link isn&apos;t recognized. Double-check you used the latest email.</CardDescription>
              </CardHeader>
            </>
          ) : alreadyConsented ? (
            <>
              <CardHeader>
                <CardTitle>Already confirmed</CardTitle>
                <CardDescription>
                  You approved <strong>{row.studentFirst} {row.studentLast}</strong>&apos;s account on{" "}
                  {(row.consent.consentedAt as unknown as Date).toLocaleDateString()}. They&apos;ll move through
                  the drum major&apos;s approval queue from here.
                </CardDescription>
              </CardHeader>
            </>
          ) : expired ? (
            <>
              <CardHeader>
                <CardTitle>Link expired</CardTitle>
                <CardDescription>
                  This link expired. If your student still wants access, they&apos;ll need to sign up again with a fresh invite code.
                </CardDescription>
              </CardHeader>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Approve your student&apos;s Woodshed account</CardTitle>
                <CardDescription>
                  <strong>{row.studentFirst} {row.studentLast}</strong> — grade {row.studentGrade}, {row.studentSection} — signed up for Woodshed,
                  a private app for Pieper Band musicians. We need your permission before their account becomes active.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-md border border-border bg-muted/50 p-4 text-sm">
                  <p className="font-medium mb-1">What&apos;s collected</p>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li>Name, email, grade, section, and instruments.</li>
                    <li>Optional bio, outside ensembles, private lesson teachers, and achievements.</li>
                    <li>Practice sessions they log (minutes, what they worked on).</li>
                    <li>Mentor requests they post or respond to.</li>
                  </ul>
                  <p className="font-medium mt-3 mb-1">What&apos;s not collected</p>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li>Grades, test scores, or academic records (FERPA-covered info is excluded by design).</li>
                    <li>Location data, contacts, or any data from other apps.</li>
                  </ul>
                  <p className="mt-3">
                    Full policy: <Link href="/privacy" className="text-primary underline">woodshed.app/privacy</Link>
                  </p>
                </div>
                <ApproveButton token={token} />
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}

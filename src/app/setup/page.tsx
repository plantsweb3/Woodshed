import { notFound } from "next/navigation";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP } from "@/lib/constants";
import { SetupForm } from "./form";

export default async function SetupPage() {
  const [{ c: userCount }] = await db.select({ c: count() }).from(users);
  if (userCount > 0) notFound();

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-xl px-6 py-5 flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <span className="font-display text-lg leading-none">W</span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent" />
          </div>
          <span className="font-display text-xl tracking-tight">{APP.name} — first-time setup</span>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-xl w-full px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Create the director account</CardTitle>
            <CardDescription>
              This page only exists until the first user is created. After you complete setup, it 404s forever.
              You&apos;ll be signed in as director and can rotate the invite code from the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetupForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

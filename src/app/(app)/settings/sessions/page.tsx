import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { requireApprovedOrAlumniNoOnboarding, getSession } from "@/lib/session";
import { revokeSession } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Monitor } from "lucide-react";

export default async function SessionsPage() {
  const user = await requireApprovedOrAlumniNoOnboarding();
  const current = await getSession();
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, user.id), isNull(sessions.revokedAt)))
    .orderBy(desc(sessions.lastSeenAt))
    .limit(20);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Everywhere your account is signed in. If something looks wrong, revoke the session — you&apos;ll be signed out of that device immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active sessions recorded.</p>
        ) : (
          rows.map((s) => {
            const isCurrent = s.id === current?.sid;
            return (
              <div key={s.id} className="flex items-start justify-between gap-3 flex-wrap rounded-md border border-border p-4">
                <div className="flex items-start gap-3 min-w-0">
                  <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.userAgent ?? "Unknown device"}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.ip ?? "unknown ip"} · Last seen {formatDate(s.lastSeenAt as unknown as Date)}
                      {isCurrent && " · this device"}
                    </p>
                  </div>
                </div>
                <form action={revokeSession}>
                  <input type="hidden" name="sid" value={s.id} />
                  <Button type="submit" size="sm" variant={isCurrent ? "outline" : "ghost"}>
                    {isCurrent ? "Sign out here" : "Revoke"}
                  </Button>
                </form>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

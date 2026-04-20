import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { inviteCodes } from "@/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateInviteCodeButton } from "./rotate-button";
import { formatDate } from "@/lib/utils";

export default async function SettingsPage() {
  const [active] = await db
    .select()
    .from(inviteCodes)
    .where(eq(inviteCodes.active, true))
    .orderBy(desc(inviteCodes.createdAt))
    .limit(1);

  const recent = await db.select().from(inviteCodes).orderBy(desc(inviteCodes.createdAt)).limit(6);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Invite code</CardTitle>
          <CardDescription>
            This is the code students type at signup. Post it in the band hall. Rotate it if you want to cut off
            new signups or if it&apos;s leaked to non-members.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {active ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-md bg-primary-soft/60 border border-primary/20">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Current active code</p>
                <p className="font-mono text-3xl tracking-wider mt-1 select-all">{active.code}</p>
                <p className="text-xs text-muted-foreground mt-1">Activated {formatDate(active.createdAt)}</p>
              </div>
              <div className="flex-1" />
              <RotateInviteCodeButton />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 p-4 rounded-md border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No active code. Generate the first one.</p>
              <RotateInviteCodeButton label="Generate code" />
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Recent history</p>
            <div className="flex flex-col gap-2">
              {recent.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{c.code}</span>
                  <div className="flex items-center gap-2">
                    {c.active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="outline">
                        Retired {c.rotatedAt ? formatDate(c.rotatedAt) : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Placeholder settings</CardTitle>
          <CardDescription>
            Reserved for future: band info, Pieper hex codes, upload service, Resend email delivery. Ask Ulysses when you want these wired up.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

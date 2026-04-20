import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { approveUser, rejectUser } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import { Check, X } from "lucide-react";

export default async function ApprovalsPage() {
  const pending = await db
    .select()
    .from(users)
    .where(eq(users.status, "pending"))
    .orderBy(asc(users.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl">Pending signups</h2>
        <p className="text-sm text-muted-foreground">
          Approve to let them into the directory. Reject deletes the signup (they&apos;d need a new invite code to try again).
        </p>
      </div>

      {pending.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-display text-xl">Queue is clear.</p>
          <p className="mt-2 text-sm text-muted-foreground">Nobody waiting right now.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((u) => (
            <Card key={u.id} className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar name={`${u.firstName} ${u.lastName}`} />
                  <div className="min-w-0">
                    <p className="font-medium">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline">Grade {u.grade}</Badge>
                      <Badge variant="outline">{u.section}</Badge>
                      <Badge variant="outline">{u.primaryInstrument}</Badge>
                      {u.marchingInstrument && <Badge variant="outline">{u.marchingInstrument} (marching)</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Requested {formatDate(u.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={approveUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <Button type="submit" className="gap-2">
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                  </form>
                  <form action={rejectUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <Button type="submit" variant="outline" className="gap-2">
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

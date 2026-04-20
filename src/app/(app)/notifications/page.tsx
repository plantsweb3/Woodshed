import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function NotificationsPage() {
  const user = await requireApprovedOrAlumniNoOnboarding();
  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Notifications</h1>
        <p className="mt-1 text-muted-foreground">Everything that&apos;s happened since you last looked.</p>
      </div>
      {items.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-display text-xl">Nothing yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">When there is, it&apos;ll show up here and in the bell at the top.</p>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.link ?? "#"}
                  className="block px-5 py-4 hover:bg-muted/60"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium">{n.title}</p>
                      {n.body && <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {n.category.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(n.createdAt as unknown as Date)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

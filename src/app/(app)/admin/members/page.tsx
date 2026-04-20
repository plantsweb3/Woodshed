import Link from "next/link";
import { asc, ne } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleChangeSelect } from "@/components/role-change-select";
import { requireApprovedUser } from "@/lib/session";
import { deactivateUser, reactivateUser, forceSignOutUser } from "@/app/actions/admin";
import { ROLES, type Role } from "@/lib/constants";

function roleLabel(role: Role) {
  return role === "drum_major" ? "Drum Major" : role === "section_leader" ? "Section Leader" : role === "director" ? "Director" : "Student";
}

export default async function AdminMembersPage() {
  const me = await requireApprovedUser();
  const rows = await db.select().from(users).where(ne(users.status, "pending")).orderBy(asc(users.lastName));
  const isDirector = me.role === "director";
  const availableRoles = (isDirector
    ? [...ROLES]
    : (ROLES.filter((r) => r !== "director" && r !== "drum_major") as Role[])) as Role[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl">Members</h2>
        <p className="text-sm text-muted-foreground">
          {isDirector
            ? "Full control. Directors can promote anyone, including drum majors, and force sign-out compromised accounts."
            : "As drum major, you can promote section leaders and deactivate students. Role changes above your level are the director's call."}
        </p>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {rows.map((u) => (
            <div key={u.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3 min-w-0">
                <Avatar name={`${u.firstName} ${u.lastName}`} />
                <div className="min-w-0">
                  <Link href={`/directory/${u.id}`} className="font-medium hover:underline">
                    {u.firstName} {u.lastName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <Badge variant="primary">{roleLabel(u.role as Role)}</Badge>
                    <Badge variant="outline">Grade {u.grade}</Badge>
                    <Badge variant="outline">{u.section}</Badge>
                    {u.status === "inactive" && <Badge variant="default">Inactive</Badge>}
                    {u.status === "alumni" && <Badge variant="default">Alumni</Badge>}
                    {u.status === "deleted_pending" && <Badge variant="default">Deletion pending</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <RoleChangeSelect
                  userId={u.id}
                  userName={`${u.firstName} ${u.lastName}`}
                  currentRole={u.role as Role}
                  availableRoles={availableRoles}
                  disabled={u.id === me.id}
                />
                {u.id !== me.id && u.status === "approved" && (
                  <form action={deactivateUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      Deactivate
                    </Button>
                  </form>
                )}
                {u.status === "inactive" && (
                  <form action={reactivateUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Reactivate
                    </Button>
                  </form>
                )}
                {isDirector && u.id !== me.id && u.status === "approved" && (
                  <form action={forceSignOutUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <Button type="submit" size="sm" variant="ghost" className="text-destructive">
                      Force sign-out
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

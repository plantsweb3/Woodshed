import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/nav";
import { listNotifications, unreadCount } from "@/lib/notifications";
import { TelemetryProvider } from "@/components/telemetry-provider";
import { hashId } from "@/lib/telemetry";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireApprovedOrAlumniNoOnboarding();
  if (user.status !== "approved" && user.status !== "alumni") redirect("/pending");

  const [items, unread] = await Promise.all([listNotifications(user.id, { limit: 20 }), unreadCount(user.id)]);

  const notifications = items.map((n) => ({
    id: n.id,
    category: n.category,
    title: n.title,
    body: n.body,
    link: n.link,
    createdAt: n.createdAt as unknown as Date,
    readAt: (n.readAt as unknown as Date | null) ?? null,
  }));

  return (
    <div className="min-h-dvh">
      <TelemetryProvider hashedUserId={hashId(user.id)} role={user.role} />
      <AppNav
        role={user.role}
        name={`${user.firstName} ${user.lastName}`}
        notifications={notifications}
        unreadCount={unread}
      />
      <main className="mx-auto max-w-6xl px-6 pb-24 md:pb-10 pt-8">{children}</main>
    </div>
  );
}

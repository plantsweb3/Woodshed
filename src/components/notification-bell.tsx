"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { markNotificationsRead } from "@/app/actions/notifications";

export interface NotificationPeek {
  id: string;
  category: string;
  title: string;
  body: string | null;
  link: string | null;
  createdAt: string | Date;
  readAt: string | Date | null;
}

function groupByRecency(items: NotificationPeek[]) {
  const today: NotificationPeek[] = [];
  const week: NotificationPeek[] = [];
  const earlier: NotificationPeek[] = [];
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(dayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  for (const n of items) {
    const d = typeof n.createdAt === "string" ? new Date(n.createdAt) : n.createdAt;
    if (d >= dayStart) today.push(n);
    else if (d >= weekStart) week.push(n);
    else earlier.push(n);
  }
  return { today, week, earlier };
}

export function NotificationBell({ items, unreadCount: initialUnread }: { items: NotificationPeek[]; unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [pending, startTransition] = useTransition();
  const groups = groupByRecency(items);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as HTMLElement;
      if (!target.closest("[data-notification-panel]") && !target.closest("[data-notification-trigger]")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  const onOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      startTransition(async () => {
        await markNotificationsRead();
        setUnread(0);
      });
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        data-notification-trigger
        onClick={onOpen}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-card" aria-hidden />
        )}
      </button>

      {open && (
        <div
          data-notification-panel
          className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="font-medium">Notifications</span>
            </div>
            <Link
              href="/notifications"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Quiet day.</div>
            ) : (
              <>
                <Group title="Today" items={groups.today} onNavigate={() => setOpen(false)} />
                <Group title="This week" items={groups.week} onNavigate={() => setOpen(false)} />
                <Group title="Earlier" items={groups.earlier} onNavigate={() => setOpen(false)} />
              </>
            )}
          </div>
        </div>
      )}
      {pending && <span className="sr-only">Marking as read…</span>}
    </div>
  );
}

function Group({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: NotificationPeek[];
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul>
        {items.map((n) => (
          <li key={n.id}>
            <Link
              href={n.link ?? "/notifications"}
              onClick={onNavigate}
              className={cn(
                "block px-4 py-3 border-t border-border/50 hover:bg-muted/60",
                !n.readAt && "bg-primary-soft/40"
              )}
            >
              <p className="text-sm font-medium leading-tight">{n.title}</p>
              {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

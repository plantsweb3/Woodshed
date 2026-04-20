"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Lightbulb, Megaphone, Shield, User as UserIcon, Flame } from "lucide-react";
import { APP } from "@/lib/constants";
import { SignoutButton } from "./signout-button";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/constants";
import { NotificationBell, type NotificationPeek } from "./notification-bell";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Users;
}

const studentTabs: NavItem[] = [
  { href: "/directory", label: "Directory", icon: Users },
  { href: "/mentorship", label: "Mentorship", icon: Lightbulb },
  { href: "/opportunities", label: "Opportunities", icon: Megaphone },
  { href: "/shed", label: "The Shed", icon: Flame },
  { href: "/profile", label: "My profile", icon: UserIcon },
];

export function AppNav({
  role,
  name,
  notifications,
  unreadCount,
}: {
  role: Role;
  name: string;
  notifications: NotificationPeek[];
  unreadCount: number;
}) {
  const pathname = usePathname();
  const isAdmin = role === "drum_major" || role === "director";
  const items: NavItem[] = [...studentTabs];
  if (isAdmin) items.push({ href: "/admin", label: "Admin", icon: Shield });

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between gap-6">
          <Link href="/directory" className="flex items-center gap-3">
            <div className="relative h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <span className="font-display text-base leading-none">W</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
            <span className="font-display text-lg tracking-tight hidden sm:inline">{APP.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {items.map((t) => {
              const active = pathname === t.href || pathname.startsWith(t.href + "/");
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 h-9 text-sm transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <NotificationBell items={notifications} unreadCount={unreadCount} />
            <Link href="/settings" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground px-2">
              {name}
            </Link>
            <SignoutButton />
          </div>
        </div>
      </header>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-6xl grid grid-cols-5">
          {items.slice(0, 5).map((t) => {
            const active = pathname === t.href || pathname.startsWith(t.href + "/");
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

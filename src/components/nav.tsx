"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Lightbulb, Megaphone, Shield, User as UserIcon, Flame, Mic } from "lucide-react";
import { APP } from "@/lib/constants";
import { SignoutButton } from "./signout-button";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/constants";
import { NotificationBell, type NotificationPeek } from "./notification-bell";

interface NavItem {
  href: string;
  label: string;
  italicSlice: string;
  icon: typeof Users;
}

const studentTabs: NavItem[] = [
  { href: "/directory", label: "Directory", italicSlice: "ory", icon: Users },
  { href: "/shoutouts", label: "Shoutouts", italicSlice: "outs", icon: Mic },
  { href: "/mentorship", label: "Mentorship", italicSlice: "ship", icon: Lightbulb },
  { href: "/opportunities", label: "Opportunities", italicSlice: "tunities", icon: Megaphone },
  { href: "/shed", label: "The Shed", italicSlice: "Shed", icon: Flame },
  { href: "/profile", label: "Profile", italicSlice: "file", icon: UserIcon },
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
  if (isAdmin) items.push({ href: "/admin", label: "Admin", italicSlice: "min", icon: Shield });

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-[color:var(--color-rule)]/30">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between gap-6">
          <Link href="/directory" className="flex items-center gap-3">
            <div className="relative h-8 w-8 border-2 border-ink bg-paper grid place-items-center">
              <span className="font-display text-xl leading-none -mt-0.5">W</span>
              <span className="absolute -top-1 -right-1 h-2 w-2 rotate-45 bg-accent border border-ink" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-lg tracking-tight">{APP.name}</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center">
            {items.map((t, idx) => {
              const active = pathname === t.href || pathname.startsWith(t.href + "/");
              const label = t.label;
              const before = label.slice(0, label.length - t.italicSlice.length);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cn(
                    "relative px-3.5 h-9 inline-flex items-center text-sm transition-colors group",
                    active ? "text-primary" : "text-foreground/75 hover:text-foreground",
                    idx > 0 && "border-l border-[color:var(--color-rule)]/20"
                  )}
                >
                  <span className="font-editorial">
                    {before}
                    <span className="font-editorial-italic">{t.italicSlice}</span>
                  </span>
                  <span
                    className={cn(
                      "absolute left-3 right-3 -bottom-px h-[2px] bg-primary transition-transform origin-left",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <NotificationBell items={notifications} unreadCount={unreadCount} />
            <Link
              href="/settings"
              className="hidden sm:inline text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground px-2"
            >
              {name}
            </Link>
            <SignoutButton />
          </div>
        </div>
      </header>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-7xl grid grid-cols-5">
          {items.slice(0, 5).map((t) => {
            const active = pathname === t.href || pathname.startsWith(t.href + "/");
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-mono uppercase tracking-wider border-r border-[color:var(--color-rule)]/20 last:border-r-0",
                  active ? "text-primary bg-primary-soft" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

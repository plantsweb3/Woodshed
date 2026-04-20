"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/settings", label: "Overview" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/sessions", label: "Active sessions" },
  { href: "/settings/data", label: "Your data" },
  { href: "/settings/account", label: "Account" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex lg:flex-col gap-1 lg:gap-0.5 overflow-x-auto lg:overflow-visible">
      {items.map((i) => {
        const active = pathname === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors",
              active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

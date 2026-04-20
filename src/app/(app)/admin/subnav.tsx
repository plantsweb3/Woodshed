"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/approvals", label: "Approvals" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/opportunities", label: "Opportunities" },
  { href: "/admin/featured", label: "Featured" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminSubNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 p-1 bg-muted rounded-md self-start">
      {items.map((i) => {
        const active = pathname === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            className={cn(
              "px-3 h-8 rounded-[4px] text-sm inline-flex items-center transition-colors",
              active ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

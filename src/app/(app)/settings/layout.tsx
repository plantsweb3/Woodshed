import Link from "next/link";
import type { ReactNode } from "react";
import { SettingsNav } from "./nav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-primary">Settings</p>
        <h1 className="font-display text-4xl tracking-tight">Your account</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <SettingsNav />
        <div>{children}</div>
      </div>
    </div>
  );
}

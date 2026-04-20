import { requireRole } from "@/lib/session";
import { AdminSubNav } from "./subnav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["drum_major", "director"]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-primary">Admin</p>
          <h1 className="font-display text-4xl tracking-tight">
            {user.role === "director" ? "Director tools" : "Drum major tools"}
          </h1>
        </div>
      </div>
      <AdminSubNav />
      {children}
    </div>
  );
}

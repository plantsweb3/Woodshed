import Link from "next/link";
import { Eye } from "lucide-react";
import { signout } from "@/app/actions/auth";

export function DemoBanner() {
  return (
    <div className="bg-accent text-accent-foreground border-b-2 border-ink">
      <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="h-4 w-4 shrink-0" />
          <p className="leading-tight">
            <strong className="font-semibold">Read-only demo.</strong>{" "}
            <span className="text-accent-foreground/80">
              Posting, kudos, and editing are turned off in this mode.
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em]">
          <Link href="/signup" className="underline underline-offset-4 hover:opacity-70">
            Sign up to participate
          </Link>
          <form action={signout}>
            <button className="underline underline-offset-4 hover:opacity-70">
              Exit demo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { APP } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <span className="font-display text-lg leading-none">W</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent" />
            </div>
            <span className="font-display text-xl tracking-tight">{APP.name}</span>
          </Link>
          <span className="text-xs text-muted-foreground">{APP.program}</span>
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center px-6 py-12 sm:py-20 chrome-grain">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground">
        BAND has the rehearsal schedule. This is for the work.
      </footer>
    </div>
  );
}

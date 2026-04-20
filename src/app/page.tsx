import Link from "next/link";
import { APP } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Lightbulb, Megaphone } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mark />
            <span className="font-display text-xl tracking-tight">{APP.name}</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/signin">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Enter {APP.affection}</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="chrome-grain">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <p className="text-xs uppercase tracking-[0.24em] text-primary mb-6">{APP.program}</p>
          <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight max-w-4xl">
            Where the work
            <br />
            happens.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            BAND has your rehearsal schedule. <span className="text-foreground font-medium">Woodshed</span> is
            for everything beyond it — mentorship, opportunities, and the musicians who take this seriously.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Enter {APP.affection} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline" size="lg">I already have an account</Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Signup requires the current invite code from the band hall.
          </p>
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl sm:text-4xl max-w-2xl">A second tier for the sweats.</h2>
          <p className="mt-5 max-w-3xl text-muted-foreground leading-relaxed">
            Pieper&apos;s BAND handles rehearsals, announcements, parent updates, bus schedules, and
            everything official. This is the opt-in layer on top of it — the place where serious
            musicianship gets visible inside our own program, so nobody has to find out at SAYWE
            that an All-Stater has been sitting two chairs over all along.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureBlock
              icon={<Users className="h-5 w-5" />}
              title="See each other"
              body="A directory of the program's musicians — outside ensembles, private lessons, achievements. Built for students, not parents."
            />
            <FeatureBlock
              icon={<Lightbulb className="h-5 w-5" />}
              title="Learn from each other"
              body="Upperclassmen offer mentorship in the skills they've been through. Freshmen post what they need help with. The board is public to members."
            />
            <FeatureBlock
              icon={<Megaphone className="h-5 w-5" />}
              title="What's out there"
              body="SAYWE, DCI camps, college clinics, regional auditions — the opportunities BAND doesn't post because they're not Pieper events."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl sm:text-4xl max-w-2xl">Who it&apos;s for.</h2>
          <p className="mt-5 max-w-3xl text-muted-foreground leading-relaxed">
            Anyone in the program who wants more than the minimum. Freshmen who want to know what&apos;s
            possible. Upperclassmen who are already grinding and would rather not hide it. Section
            leaders who want to mentor with something to point at. Drum majors and the director
            who want the full picture of what their students are working on outside the room.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/signup">
              <Button size="lg">Enter Woodshed</Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline" size="lg">Sign in</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Built for the {APP.program}.
      </footer>
    </main>
  );
}

function Mark() {
  return (
    <div className="relative h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
      <span className="font-display text-lg leading-none">W</span>
      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent" />
    </div>
  );
}

function FeatureBlock({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">{icon}</div>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

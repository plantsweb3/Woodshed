import Link from "next/link";
import { APP } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-background paper-vignette">
      {/* Masthead */}
      <header className="border-b-4 border-double border-[color:var(--color-rule)]">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em]">
          <div className="flex items-center gap-4">
            <span className="font-mono text-muted-foreground">Pieper Band of Warriors</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/why" className="hover:underline underline-offset-4">Why this exists</Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <Link href="/signin" className="hover:underline underline-offset-4">Sign in</Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <Link href="/signup" className="hover:underline underline-offset-4">Request access</Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-8">
          <p className="label-eyebrow text-muted-foreground">A private journal for the {APP.program}</p>
          <h1 className="mt-2 font-display text-[18vw] sm:text-[16vw] md:text-[13vw] lg:text-[192px] leading-[0.82] tracking-[-0.035em] text-ink letterpress">
            <span className="inline-block reveal" style={{ animationDelay: "80ms" }}>Wood</span>
            <span className="inline-block reveal font-display-italic text-primary" style={{ animationDelay: "240ms" }}>shed</span>
            <span className="inline-block reveal text-accent-ink" style={{ animationDelay: "400ms" }}>.</span>
          </h1>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-end">
            <p className="max-w-xl font-editorial text-xl md:text-2xl leading-[1.25] text-foreground/90 reveal" style={{ animationDelay: "520ms" }}>
              Where the work happens. BAND has your rehearsal schedule — <span className="font-editorial-italic text-primary">this is for everything beyond it.</span>
            </p>
            <div className="flex items-center gap-3 reveal" style={{ animationDelay: "620ms" }}>
              <Link href="/signup">
                <Button size="lg" className="gap-2 rounded-none border-0">
                  Enter <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signin" className="underline underline-offset-4 text-sm hover:text-primary">
                I have an account
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Index / table of contents */}
      <section className="border-b border-[color:var(--color-rule)]/30">
        <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <IndexItem num="I." title="The directory" note="Who's in it" />
          <IndexItem num="II." title="The mentorship board" note="Ask. Offer." />
          <IndexItem num="III." title="Opportunities" note="Outside Pieper" />
          <IndexItem num="IV." title="The Shed" note="Hours logged" />
        </div>
      </section>

      {/* Editorial section I */}
      <section className="mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
        <aside>
          <p className="font-mono text-xs text-muted-foreground">I. Premise</p>
          <hr className="rule-letterpress mt-2 mb-4 w-12" />
          <p className="label-eyebrow text-primary">A second tier for the sweats</p>
        </aside>
        <div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-3xl">
            Serious musicianship, <span className="font-display-italic text-primary">made visible</span> — inside our own program.
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl">
            <p className="text-lg leading-relaxed drop-cap">
              Pieper has All-Staters nobody knows about. Upperclassmen grinding in private. Freshmen who&apos;d work harder if they saw what was possible. This is the room where those students find each other.
            </p>
            <p className="text-lg leading-relaxed text-foreground/85">
              No parents, no photo albums, no rehearsal reminders — BAND has all of that. Woodshed is the opt-in layer on top: a directory, a mentorship board, a feed of opportunities outside the program, and a private shed log for your own hours.
            </p>
          </div>
        </div>
      </section>

      {/* Featured / three columns — letterpress editorial cards */}
      <section className="border-y border-[color:var(--color-rule)]/30 bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[color:var(--color-rule)]/30">
          <Column num="01" title="See each other" italic="each other">
            A directory built for musicians. Outside ensembles, private teachers, achievements — the résumé you&apos;d never post on BAND because your parents would see it.
          </Column>
          <Column num="02" title="Learn from each other" italic="from each other">
            Open requests go out to mentors with the right skill. A freshman struggling with slide step gets picked up by an upperclassman who&apos;s already been through it.
          </Column>
          <Column num="03" title="What's out there" italic="out there">
            SAYWE, DCI camps, regional auditions, college clinics — the opportunities BAND doesn&apos;t post because they&apos;re not part of the official program.
          </Column>
        </div>
      </section>

      {/* Pull quote */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-5xl md:text-7xl font-display-italic leading-[1.02] text-foreground">
          <span className="text-primary">&ldquo;</span>Nobody should find out at SAYWE that an All-Stater has been sitting two chairs over all along<span className="text-primary">.&rdquo;</span>
        </p>
        <p className="mt-6 label-eyebrow text-muted-foreground">
          <Ornament /> The founding complaint
        </p>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 border-t border-[color:var(--color-rule)]/30">
        <aside>
          <p className="font-mono text-xs text-muted-foreground">II. Audience</p>
          <hr className="rule-letterpress mt-2 mb-4 w-12" />
          <p className="label-eyebrow text-primary">Who&apos;s this for</p>
        </aside>
        <div>
          <h2 className="font-display text-5xl md:text-6xl leading-[0.95] tracking-tight max-w-3xl">
            Anyone in the program who wants <span className="font-display-italic text-primary">more than the minimum.</span>
          </h2>
          <ul className="mt-8 max-w-2xl text-lg leading-relaxed grid gap-2">
            <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>Freshmen who want to know what&apos;s possible.</span></li>
            <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>Upperclassmen already grinding and tired of hiding it.</span></li>
            <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>Section leaders who want to mentor with receipts.</span></li>
            <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>Drum majors and the director who want the full picture.</span></li>
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-none gap-2">
                Enter Woodshed <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin" className="text-sm underline underline-offset-4 hover:text-primary">
              Already a member? Sign in.
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Signup needs the current invite code — posted in the band hall.</p>
        </div>
      </section>

      {/* Footer / colophon */}
      <footer className="border-t-4 border-double border-[color:var(--color-rule)] bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row justify-between items-start gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Crest />
            <div>
              <p className="font-display text-lg leading-tight">{APP.name}</p>
              <p className="text-muted-foreground font-mono mt-0.5">Where the work happens.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 font-mono text-muted-foreground uppercase tracking-[0.18em] text-[10px]">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <span>Built for the {APP.program}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function IndexItem({ num, title, note }: { num: string; title: string; note: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{num}</span>
      <span className="font-editorial text-lg leading-tight mt-1">{title}</span>
      <span className="text-xs text-muted-foreground italic">{note}</span>
    </div>
  );
}

function Column({ num, title, italic, children }: { num: string; title: string; italic: string; children: React.ReactNode }) {
  const before = title.split(italic)[0];
  return (
    <div className="px-0 md:px-8 py-8 first:pt-0 md:first:pt-8 last:pb-0 md:last:pb-8">
      <p className="font-mono text-xs text-accent-ink">{num}</p>
      <h3 className="mt-3 font-display text-3xl leading-tight tracking-tight">
        {before}<span className="font-display-italic text-primary">{italic}</span>
      </h3>
      <p className="mt-4 text-foreground/85 leading-relaxed">{children}</p>
    </div>
  );
}

function Ornament() {
  return <span className="inline-block mx-2 align-middle text-accent-ink">✦</span>;
}

function Crest() {
  return (
    <div className="relative h-10 w-10 border-2 border-ink bg-paper grid place-items-center">
      <span className="font-display text-2xl leading-none -mt-0.5">W</span>
      <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rotate-45 bg-accent border border-ink" />
    </div>
  );
}

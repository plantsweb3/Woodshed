import Link from "next/link";
import { APP } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

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
          <p className="label-eyebrow text-muted-foreground">A culture tool for the {APP.program}</p>
          <h1 className="mt-2 font-display text-[18vw] sm:text-[16vw] md:text-[13vw] lg:text-[192px] leading-[0.82] tracking-[-0.035em] text-ink letterpress">
            <span className="inline-block reveal" style={{ animationDelay: "80ms" }}>Wood</span>
            <span className="inline-block reveal font-display-italic text-primary" style={{ animationDelay: "240ms" }}>shed</span>
            <span className="inline-block reveal text-accent-ink" style={{ animationDelay: "400ms" }}>.</span>
          </h1>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-end">
            <p className="max-w-xl font-editorial text-xl md:text-2xl leading-[1.25] text-foreground/90 reveal" style={{ animationDelay: "520ms" }}>
              Where the work happens. BAND has the rehearsal schedule — <span className="font-editorial-italic text-primary">this is for everything beyond it,</span> with leadership oversight built in.
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
          <IndexItem num="I." title="The directory" note="Who's in the program" />
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
          <p className="label-eyebrow text-primary">A culture layer for the program</p>
        </aside>
        <div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-3xl">
            Serious musicianship, <span className="font-display-italic text-primary">made visible</span> — across the whole program.
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl">
            <p className="text-lg leading-relaxed drop-cap">
              Pieper has more dedicated musicians than most of the program realizes. Upperclassmen training outside rehearsal. Freshmen who&apos;d commit harder if they saw what was possible. Section leaders quietly mentoring. Most of that effort is invisible to the rest of the band — Woodshed is the room where it stops being invisible.
            </p>
            <p className="text-lg leading-relaxed text-foreground/85">
              BAND covers rehearsal logistics, parent communication, schedules. Woodshed is the layer on top: a directory, a mentorship board, a feed of outside opportunities, and a private practice log. Member-only, invite-coded, and actively monitored by the directors and drum majors.
            </p>
          </div>
        </div>
      </section>

      {/* Featured / three columns — letterpress editorial cards */}
      <section className="border-y border-[color:var(--color-rule)]/30 bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[color:var(--color-rule)]/30">
          <Column num="01" title="See each other" italic="each other">
            A directory of every member of the program — outside ensembles, private teachers, achievements. Internal to the band community, not public-facing.
          </Column>
          <Column num="02" title="Learn from each other" italic="from each other">
            Open requests go out to mentors with the right skill. A freshman struggling with slide step gets picked up by an upperclassman who&apos;s already been through it.
          </Column>
          <Column num="03" title="What's out there" italic="out there">
            Regional honor bands, DCI camps, college clinics, scholarship deadlines — the opportunities BAND doesn&apos;t cover because they&apos;re not part of the official Pieper schedule.
          </Column>
        </div>
      </section>

      {/* Pull quote */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-5xl md:text-7xl font-display-italic leading-[1.02] text-foreground">
          <span className="text-primary">&ldquo;</span>Hidden effort shrinks. Visible effort spreads.<span className="text-primary">&rdquo;</span>
        </p>
        <p className="mt-6 label-eyebrow text-muted-foreground">
          <Ornament /> The principle
        </p>
      </section>

      {/* Safety + tone — explicit, not buried */}
      <section className="border-y border-[color:var(--color-rule)]/30 bg-primary-soft/40">
        <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
          <aside>
            <p className="font-mono text-xs text-muted-foreground">II. House rules</p>
            <hr className="rule-letterpress mt-2 mb-4 w-12" />
            <p className="label-eyebrow text-primary inline-flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Safety + tone
            </p>
          </aside>
          <div>
            <h2 className="font-display text-4xl md:text-5xl leading-[0.95] tracking-tight max-w-3xl">
              This is the band hall, <span className="font-display-italic text-primary">on a screen.</span>
            </h2>
            <div className="mt-6 max-w-3xl text-lg leading-relaxed text-foreground/85 space-y-4">
              <p>
                Posts and profiles here are read by the director, the assistant directors, and the drum majors. Anything you wouldn&apos;t say in front of Mr. Berry, don&apos;t say here.
              </p>
              <p>
                Profanity, harassment, slurs, sexual content, threats, and self-harm references are auto-flagged on submission and removed. Repeat issues result in suspension or removal from the program app. Reports stay private — the person reported isn&apos;t notified.
              </p>
              <p>
                Treat this like the band hall: serious, focused, and accountable to leadership. The whole point is to make the program look better when an outsider sees it — not worse.
              </p>
            </div>
            <ul className="mt-6 max-w-2xl text-base leading-relaxed grid gap-2 text-foreground/85">
              <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>Real names. Use your actual first and last name on your profile.</span></li>
              <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>One account per member. Don&apos;t share your password.</span></li>
              <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>Keep posts about your own work. Not other students&apos;.</span></li>
              <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>If something feels wrong, the report button is on every post and profile.</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 border-t border-[color:var(--color-rule)]/30">
        <aside>
          <p className="font-mono text-xs text-muted-foreground">III. Audience</p>
          <hr className="rule-letterpress mt-2 mb-4 w-12" />
          <p className="label-eyebrow text-primary">Who&apos;s this for</p>
        </aside>
        <div>
          <h2 className="font-display text-5xl md:text-6xl leading-[0.95] tracking-tight max-w-3xl">
            Anyone in the program who wants <span className="font-display-italic text-primary">more than the minimum.</span>
          </h2>
          <ul className="mt-8 max-w-2xl text-lg leading-relaxed grid gap-2">
            <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>Freshmen who want to know what&apos;s possible.</span></li>
            <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>Upperclassmen already putting in real time outside rehearsal.</span></li>
            <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>Section leaders who want to mentor with something to point at.</span></li>
            <li className="flex gap-3"><span className="text-accent-ink shrink-0">✦</span><span>Drum majors and directors who want the full picture of the program&apos;s work.</span></li>
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
          <p className="mt-3 text-xs text-muted-foreground">Signup requires the current invite code — posted in the band hall — and director or drum major approval.</p>
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

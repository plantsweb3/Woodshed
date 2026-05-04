import Link from "next/link";
import { APP } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Why Woodshed — A culture argument for the Pieper Band of Warriors",
  description:
    "The case for Woodshed: why hidden effort is killing our program, what the research says, and what changes when we go 6A.",
};

export default function WhyPage() {
  return (
    <main className="min-h-dvh bg-background paper-vignette">
      <header className="border-b-4 border-double border-[color:var(--color-rule)]">
        <div className="mx-auto max-w-3xl px-6 py-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em]">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
          <span className="font-mono text-muted-foreground">Pieper Band of Warriors</span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="label-eyebrow text-accent-ink">A culture argument</p>
        <h1 className="mt-3 font-display text-6xl md:text-8xl leading-[0.85] tracking-tight">
          Why <span className="font-display-italic text-primary">Woodshed</span>.
        </h1>
        <p className="mt-6 text-xl md:text-2xl font-editorial leading-snug max-w-2xl text-foreground/85">
          The Pieper Band of Warriors has a quiet problem. The fix isn&apos;t a pep
          talk. It&apos;s a <em className="font-editorial-italic text-primary">structure</em> that makes hidden effort visible.
        </p>

        <hr className="rule-letterpress my-12 w-24" />

        <Section roman="I." title="The diagnosis">
          <Paragraph dropCap>
            Pieper has All-State-level musicians who don&apos;t know other All-Staters
            are in the same program — because nobody talks about their outside work. Fred
            two chairs down has been at SAYWE since freshman year. The freshman three
            seats up takes lessons every Saturday morning. Neither of them knows about
            the other. They&apos;re both protecting themselves.
          </Paragraph>
          <Paragraph>
            The instinct to hide isn&apos;t a Pieper-specific quirk. It&apos;s a sixty-five-year-old
            documented phenomenon in American adolescents.
          </Paragraph>

          <PullQuote
            text="In every American high school, kids could be smart, but only if it looked effortless."
            attribution="James Coleman, The Adolescent Society, 1961"
          />

          <Paragraph>
            Coleman surveyed ten Illinois high schools and found that across every one,
            scholastic achievement was tolerated only &ldquo;without special efforts, without
            doing anything beyond the required work.&rdquo; In athletics, by contrast, &ldquo;there
            is no epithet comparable to <em>curve-raiser</em>.&rdquo; Visible effort, in
            athletics, was prestige. In academics, it was social cost.
          </Paragraph>
          <Paragraph>
            Forty-two years later, Cornell&apos;s John Bishop surveyed 100,000+ students
            across 350 schools and produced what he called the <em>harassment curve</em>:
            both slackers and students who exceeded the local effort norm got teased
            weekly. The middle gets enforced from both sides. That&apos;s why our All-Staters
            hide. It&apos;s rational self-protection.
          </Paragraph>
          <Paragraph>
            But there&apos;s a meaner trick happening underneath: <em>pluralistic ignorance</em>.
            Every kid in the section privately wants to be good. Each one assumes nobody
            else does. So they all hide. The norm isn&apos;t real. It&apos;s every student
            simultaneously pretending for every other student.
          </Paragraph>
        </Section>

        <Section roman="II." title="The stakes">
          <Paragraph>
            Pieper is now <strong>2,253 students</strong>, above the new 6A floor of
            2,215. The 2026-27 marching season is our first year as a 6A program. The
            field gets deeper, not friendlier. Reagan finished 5th at 6A state in 2025.
            That&apos;s our area benchmark now.
          </Paragraph>
          <Paragraph>
            Bands that successfully made the same jump credit one thing more than any
            other: <em>leadership infrastructure</em>. Vandegrift — 4A state champs in
            2013, 6A state champs in 2022 and 2023 — runs ~50 student leadership
            positions and a year-round leadership curriculum, not a leadership camp in
            May. Hebron, with 350+ marchers, runs five drum majors and 30+ student
            leaders. Their director Mike Howard puts it bluntly:
          </Paragraph>

          <PullQuote
            text="Leadership is a skill, not a talent. It can constantly improve."
            attribution="Mike Howard, Vandegrift Director of Bands"
          />

          <Paragraph>
            5A culture cannot survive 6A intact. The bands that make it through don&apos;t
            do it on a single tier of senior talent. They do it by making serious
            musicianship a <em>year-round identity</em>, distributed across all four
            grades, made visible to every member.
          </Paragraph>
        </Section>

        <Section roman="III." title="The mechanism">
          <Paragraph>
            The research convergence is sharp. <strong>Hidden effort shrinks. Visible
            effort spreads.</strong> But only when visibility is peer-led, not director-distributed.
          </Paragraph>
          <Paragraph>
            Norman Feather&apos;s work on <em>tall poppy syndrome</em> — replicated across
            multiple controlled studies — shows that high achievers face <em>more</em> social
            punishment than average achievers for identical mistakes. Director&apos;s Awards
            often spotlight that resentment instead of fixing it. The cleanest mechanism
            is the one Wesley Perkins and Alan Berkowitz developed at Cornell in the
            1980s: <em>social norms marketing</em>. You publish the actual hidden norm.
            Behavior follows.
          </Paragraph>
          <Paragraph>
            Daphna Oyserman&apos;s identity-based motivation research at USC adds the other
            half: when effort feels like &ldquo;what <em>we</em> do&rdquo; instead of &ldquo;what makes me
            weird,&rdquo; students sustain it. Difficulty stops reading as &ldquo;this is impossible&rdquo;
            and starts reading as &ldquo;this is what serious people do.&rdquo;
          </Paragraph>
          <Paragraph>
            Drum corps already operates this way. A &ldquo;shed dog&rdquo; — someone who
            woodsheds for hours alone — is a compliment. Same behavior. Different
            culture. Different norm. The norm is a <em>choice</em>.
          </Paragraph>
        </Section>

        <Section roman="IV." title="Woodshed">
          <Paragraph>
            Woodshed is the social-norms-marketing intervention applied to the Pieper
            band program. It is deliberately not a teen social app. There are no
            leaderboards, no public streaks, no comparison-to-average. The features map
            directly onto the research:
          </Paragraph>

          <List>
            <ListItem>
              <strong>The directory</strong> publishes the hidden norm. Every member&apos;s
              outside ensembles, private teachers, and achievements become visible to
              every other member. Pluralistic ignorance breaks the moment a freshman
              opens it and sees that 23 other Warriors take private lessons.
            </ListItem>
            <ListItem>
              <strong>Featured profiles</strong> are peer-curated. Drum majors and
              section leaders pick a handful of musicians who exemplify the new norm.
              Rotates regularly so it doesn&apos;t become an oligarchy. Visible to all.
            </ListItem>
            <ListItem>
              <strong>The mentorship board</strong> turns hidden tutoring into visible
              infrastructure. Underclassmen post what they need help with. Upperclassmen
              who&apos;ve been through it pick it up. The whole transaction happens out in
              the open.
            </ListItem>
            <ListItem>
              <strong>Opportunities</strong> are the things BAND doesn&apos;t post — SAYWE
              auditions, DCI camps, college clinics, regional honor bands. The pipeline
              that makes elite musicians becomes legible to younger students.
            </ListItem>
            <ListItem>
              <strong>The Shed</strong> is the practice log. Every session is &ldquo;a shed.&rdquo;
              Streaks are private — the research is clear that public streaks shame
              break-takers. Section-level pulse is visible without naming individuals.
            </ListItem>
            <ListItem>
              <strong>High-fives</strong> are peer-distributed acknowledgement. Counts
              are public, names are private to the recipient. No one ranks. Distributed
              recognition is what the Feather research says works.
            </ListItem>
            <ListItem>
              <strong>Shoutouts</strong> are member-posted callouts of outside work —
              the literal &ldquo;What we did this summer&rdquo; ritual the social norms research
              identifies as the single highest-leverage intervention for hidden effort.
            </ListItem>
          </List>
        </Section>

        <Section roman="V." title="The drum major's leverage">
          <Paragraph>
            The drum major is the single student role with the structural authority to
            publicly model effort without it reading as bragging. Research on
            student-led culture change is consistent: a peer leader can shift program
            norms in 1-2 years if they (a) name the hidden norm out loud, (b) model the
            new behavior themselves, (c) build a recognition structure peers own, and
            (d) recruit co-conspirators so the new norm has critical mass before they
            graduate.
          </Paragraph>
          <Paragraph>
            None of this requires a sophomore to wait for permission. The directory grows
            the moment members start filling profiles. The mentorship board works the
            moment one upperclassman offers to help one freshman. Opportunities post
            themselves. The intervention is the visibility — the rest is the program
            doing what serious programs already do, finally seeing each other do it.
          </Paragraph>
        </Section>

        <Section roman="VI." title="What this asks of the directors">
          <Paragraph>
            Mr. Berry — your support of three things would make this real:
          </Paragraph>
          <List>
            <ListItem>
              <strong>The invite code lives in the band hall.</strong> You rotate it
              when you want. Anyone in the program who wants in is in.
            </ListItem>
            <ListItem>
              <strong>Five minutes at the first rehearsal of the season</strong> for the
              drum majors to introduce it.
            </ListItem>
            <ListItem>
              <strong>Two co-conspirators with admin access</strong> — a section leader
              and a junior — so the system outlasts any single drum major.
            </ListItem>
          </List>
          <Paragraph>
            Everything else — moderation, audit logs, FERPA-out-of-scope by design,
            zero-cost hosting, ongoing maintenance — is already handled. The
            <Link href="/" className="text-primary underline underline-offset-4 mx-1">app is live</Link>
            and ready for members to sign up the moment you say go.
          </Paragraph>
        </Section>

        <hr className="rule-letterpress my-16 w-24" />

        {/* Citations */}
        <section>
          <p className="label-eyebrow text-muted-foreground mb-4">Citations</p>
          <ol className="text-sm leading-relaxed space-y-2 text-foreground/80 list-decimal pl-5">
            <li>
              Coleman, J. S. (1961). <em>The Adolescent Society: The Social Life of the
              Teenager and Its Impact on Education</em>. Free Press.
            </li>
            <li>
              Bishop, J. H. et al. (2003). &ldquo;Why we harass nerds and freaks: A formal
              theory of student culture and norms.&rdquo; <em>Journal of School Health</em>.
            </li>
            <li>
              Prentice, D. A. &amp; Miller, D. T. (1993). &ldquo;Pluralistic ignorance and
              alcohol use on campus.&rdquo; <em>Journal of Personality and Social
              Psychology</em>. Mechanism replicated across academic effort norms.
            </li>
            <li>
              Feather, N. T. (1989). &ldquo;Attitudes towards the high achiever: The fall of
              the tall poppy.&rdquo; <em>Australian Journal of Psychology</em>.
            </li>
            <li>
              Oyserman, D. &amp; Destin, M. (2010). &ldquo;Identity-based motivation:
              Implications for intervention.&rdquo; <em>The Counseling Psychologist</em>.
            </li>
            <li>
              Perkins, H. W. &amp; Berkowitz, A. D. (1986). &ldquo;Perceiving the
              community norms of alcohol use among students.&rdquo; <em>International
              Journal of the Addictions</em>. Foundation of social norms marketing.
            </li>
            <li>
              Howard, M. (2016). &ldquo;Leading from Within.&rdquo; <em>The Instrumentalist</em>.
              Vandegrift HS leadership philosophy.
            </li>
            <li>
              UIL realignment data. <em>UIL Texas, December 2025 enrollment counts</em>.
              Pieper enrollment 2,253; 6A floor 2,215.
            </li>
            <li>
              TMEA All-State analysis: ~97% of qualifiers report taking private lessons.
              <em> (Per Maclay&apos;s analysis of TMEA-published data.)</em>
            </li>
          </ol>
        </section>

        <div className="mt-16 flex flex-col sm:flex-row items-start gap-4 border-t border-[color:var(--color-rule)]/30 pt-8">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Enter Woodshed <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground self-center">
            Back to the front page
          </Link>
        </div>
      </article>

      <footer className="border-t-4 border-double border-[color:var(--color-rule)] bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-6 flex justify-between items-center text-xs">
          <span className="font-display text-base">{APP.name}</span>
          <span className="text-muted-foreground font-mono uppercase tracking-[0.18em]">
            Built for the {APP.program}
          </span>
        </div>
      </footer>
    </main>
  );
}

function Section({ roman, title, children }: { roman: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16 first:mt-0">
      <div className="grid grid-cols-[80px_1fr] gap-4 sm:gap-8 mb-6">
        <div>
          <p className="font-display-italic text-3xl text-primary">{roman}</p>
        </div>
        <h2 className="font-display text-3xl md:text-4xl leading-[0.95] tracking-tight">
          {title}
        </h2>
      </div>
      <div className="space-y-5 max-w-prose">{children}</div>
    </section>
  );
}

function Paragraph({ children, dropCap }: { children: React.ReactNode; dropCap?: boolean }) {
  return (
    <p className={`text-lg leading-[1.65] text-foreground/90 ${dropCap ? "drop-cap" : ""}`}>{children}</p>
  );
}

function PullQuote({ text, attribution }: { text: string; attribution: string }) {
  return (
    <blockquote className="my-8 px-2">
      <p className="font-display-italic text-3xl md:text-4xl leading-[1.05] text-primary">
        <span className="text-accent-ink">&ldquo;</span>
        {text}
        <span className="text-accent-ink">&rdquo;</span>
      </p>
      <footer className="mt-2 label-eyebrow text-muted-foreground">— {attribution}</footer>
    </blockquote>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-3 text-lg leading-[1.55]">{children}</ul>;
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="text-accent-ink shrink-0 mt-1">✦</span>
      <span>{children}</span>
    </li>
  );
}

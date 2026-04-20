import Link from "next/link";
import { APP } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <span className="font-display text-lg leading-none">W</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent" />
            </div>
            <span className="font-display text-xl tracking-tight">{APP.name}</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12 prose prose-neutral">
        <h1 className="font-display text-4xl">Terms of use</h1>
        <p className="text-sm text-muted-foreground">Last updated April 19, 2026.</p>

        <h2 className="font-display text-2xl mt-8">Who this is for</h2>
        <p>
          Woodshed is a private app for current students and staff of the Pieper High School Band of Warriors.
          You need an invite code to sign up. Access can be revoked at any time by a drum major or the director.
        </p>

        <h2 className="font-display text-2xl mt-8">Your account</h2>
        <ul className="list-disc pl-6">
          <li>Use your real first and last name. Profiles with fake names will be removed.</li>
          <li>One account per person. Don&apos;t share passwords.</li>
          <li>Grades 9–10 require parent/guardian approval to activate.</li>
          <li>You&apos;re responsible for what you post. Harassment, explicit content, slurs, threats, or self-harm material
            will be removed and may result in account deletion and notification of your parents and school administration.</li>
        </ul>

        <h2 className="font-display text-2xl mt-8">What this app is not</h2>
        <p>
          Woodshed is <em>not</em> the official Pieper BAND app. Rehearsal schedules, uniform reminders, bus info,
          and parent communications all live on BAND. Do not use Woodshed to communicate time-critical logistics.
        </p>

        <h2 className="font-display text-2xl mt-8">Acceptable use</h2>
        <ul className="list-disc pl-6">
          <li>Mentorship and sharing opportunities = yes.</li>
          <li>Private practice tracking = yes.</li>
          <li>Venting about teachers, students, or the program = no.</li>
          <li>Anything that violates your school&apos;s code of conduct = no.</li>
        </ul>

        <h2 className="font-display text-2xl mt-8">Moderation</h2>
        <p>
          Reported content is reviewed by a drum major or the director. We use basic automated filters to flag profanity
          and keywords related to self-harm, threats, sexual content, and slurs — these bypass the normal queue for immediate
          director review.
        </p>

        <h2 className="font-display text-2xl mt-8">Termination</h2>
        <p>
          Your access ends when you graduate (you move to alumni status and can still view your profile and the directory
          but can&apos;t make mentor requests), when your account is deactivated for cause, or when you delete your account
          voluntarily.
        </p>

        <h2 className="font-display text-2xl mt-8">Limits</h2>
        <p>
          Woodshed is provided as-is by Ulysses Munoz and Hailey for the Pieper Band community. It is not an
          official product of Pieper ISD. If you have an emergency, call 911 or contact a school counselor.
        </p>

        <p className="mt-10">
          Questions? Ask your director or drum major, or contact{" "}
          <a href="mailto:hello@woodshed.app" className="text-primary">hello@woodshed.app</a>.
        </p>
      </main>
    </div>
  );
}

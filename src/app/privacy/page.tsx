import Link from "next/link";
import { APP } from "@/lib/constants";

export default function PrivacyPage() {
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
        <h1 className="font-display text-4xl">Privacy policy</h1>
        <p className="text-sm text-muted-foreground">Last updated April 19, 2026.</p>

        <h2 className="font-display text-2xl mt-8">What we collect</h2>
        <ul className="list-disc pl-6">
          <li>Account info: name, email, password (hashed), grade, section, instruments.</li>
          <li>Profile info you add: bio, outside ensembles, private lesson teachers, achievements, mentor availability.</li>
          <li>Activity you generate: practice sessions you log, mentor requests, opportunities you click.</li>
          <li>Technical info: IP and user agent for signup attempts, active sessions, and audit logs.</li>
          <li>For grades 9–10: parent/guardian email for one-time consent.</li>
        </ul>

        <h2 className="font-display text-2xl mt-8">What we don&apos;t collect</h2>
        <ul className="list-disc pl-6">
          <li>Grades, test scores, teacher evaluations, or anything covered by FERPA.</li>
          <li>Location data, calendar, contacts, or any data from other apps on your device.</li>
          <li>Third-party advertising identifiers. No ads. No resale of data. Ever.</li>
        </ul>

        <h2 className="font-display text-2xl mt-8">Who sees what</h2>
        <ul className="list-disc pl-6">
          <li>Your profile is visible to other approved Pieper Band members.</li>
          <li>Your practice logs default to private. You can opt in to section- or band-level visibility per entry.</li>
          <li>Drum majors and the director can see approval/moderation data, audit logs, and all mentor request threads.</li>
          <li>Parents only see the one-time consent email; they do not get access to your account.</li>
        </ul>

        <h2 className="font-display text-2xl mt-8">Analytics</h2>
        <p>
          We use PostHog to understand which features people actually use. Identifiers are <strong>hashed</strong> —
          PostHog never sees your email or name. We only look at aggregate patterns, never individual traces. The
          landing page has no analytics at all. If you&apos;d rather not be tracked inside the app, email us and we&apos;ll
          exclude your account.
        </p>

        <h2 className="font-display text-2xl mt-8">Email</h2>
        <p>
          We send account notifications (approval, mentor activity, featured placement) and parent-consent emails.
          You can turn off every non-safety email category from your notification settings. Safety/moderation emails to the
          director remain on.
        </p>

        <h2 className="font-display text-2xl mt-8">Your data rights</h2>
        <ul className="list-disc pl-6">
          <li>Download everything: settings → Your data → Export JSON.</li>
          <li>Delete your account: settings → Your data → Delete. Soft-deleted for 7 days, then permanent.</li>
          <li>Correct or update anything: profile page or settings.</li>
        </ul>

        <h2 className="font-display text-2xl mt-8">Data retention</h2>
        <p>
          Active accounts retain data while the account is active. Deleted accounts are permanently removed 7 days
          after deletion. Accounts awaiting parent consent that aren&apos;t approved within 14 days are auto-deleted.
          Audit logs and signup-attempt records are retained separately for safety review.
        </p>

        <h2 className="font-display text-2xl mt-8">Security</h2>
        <p>
          Passwords are bcrypt-hashed. Sessions are JWT-signed cookies, HTTP-only and SameSite=Lax. Connections are
          encrypted via HTTPS in production. We follow industry-standard practices appropriate for a school-scale app.
        </p>

        <h2 className="font-display text-2xl mt-8">Contact</h2>
        <p>
          Questions or requests: <a className="text-primary" href="mailto:privacy@woodshed.app">privacy@woodshed.app</a>.
        </p>
      </main>
    </div>
  );
}

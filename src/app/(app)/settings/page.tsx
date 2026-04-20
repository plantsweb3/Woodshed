import Link from "next/link";
import { Card } from "@/components/ui/card";
import { requireApprovedOrAlumniNoOnboarding } from "@/lib/session";
import { Bell, ShieldCheck, Database, Users } from "lucide-react";

export default async function SettingsOverview() {
  const user = await requireApprovedOrAlumniNoOnboarding();
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
        <p className="font-medium mt-1">{user.firstName} {user.lastName}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Shortcut href="/settings/notifications" title="Notification preferences" description="Which alerts arrive by email." icon={<Bell className="h-4 w-4" />} />
        <Shortcut href="/settings/sessions" title="Active sessions" description="Where you're signed in. Sign out of individual devices." icon={<ShieldCheck className="h-4 w-4" />} />
        <Shortcut href="/settings/data" title="Your data" description="Download everything. Delete your account with a 7-day grace period." icon={<Database className="h-4 w-4" />} />
        <Shortcut href="/settings/account" title="Account" description="Graduation status, visibility, and more." icon={<Users className="h-4 w-4" />} />
      </div>
    </div>
  );
}

function Shortcut({ href, title, description, icon }: { href: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <Card className="p-5 h-full hover:border-primary/40 transition-colors">
        <div className="flex items-center gap-2 text-primary mb-2">{icon}<span className="text-xs uppercase tracking-wide">{title}</span></div>
        <p className="text-sm text-foreground/90">{description}</p>
      </Card>
    </Link>
  );
}

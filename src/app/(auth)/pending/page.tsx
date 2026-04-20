import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SignoutButton } from "@/components/signout-button";
import { getCurrentUser } from "@/lib/session";

interface PageProps {
  searchParams: Promise<{ state?: string }>;
}

export default async function PendingPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const sp = await searchParams;
  const awaitingParent = sp.state === "parent" || user?.status === "awaiting_parent_consent";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{awaitingParent ? "Waiting on parent approval." : "You're in line."}</CardTitle>
        <CardDescription>
          {awaitingParent
            ? `We've emailed your parent or guardian at ${user?.parentEmail ?? "the address you provided"} with a one-click approval link. Once they confirm, your account moves to the drum major's approval queue. If no action is taken in 14 days, the account is auto-deleted.`
            : `${user ? `Hey ${user.firstName} — ` : ""}your account is pending approval from a drum major or the director. You'll get access the moment it's approved.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {awaitingParent
            ? "If your parent didn't receive the email, ask them to check spam. You can sign out and sign back in from the same device to resume — your invite code was already used successfully."
            : "In the meantime, start thinking about what you'll put on your profile: outside ensembles, private lessons, anything you're working on that another Pieper musician would benefit from seeing."}
        </p>
      </CardContent>
      <CardFooter>
        <SignoutButton />
      </CardFooter>
    </Card>
  );
}

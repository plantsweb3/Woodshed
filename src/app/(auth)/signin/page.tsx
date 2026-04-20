import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SigninForm } from "./form";

interface PageProps {
  searchParams: Promise<{ from?: string; inactive?: string }>;
}

export default async function SigninPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          {sp.inactive
            ? "Your account is deactivated. Talk to your director."
            : "Welcome back. The work is still here."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SigninForm />
      </CardContent>
      <CardFooter className="justify-between text-sm">
        <span className="text-muted-foreground">No account?</span>
        <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
          Request one with your invite code
        </Link>
      </CardFooter>
    </Card>
  );
}
